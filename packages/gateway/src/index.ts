import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import http from "node:http";
import type { GatewayConfig, IncomingMessage, OutgoingMessage } from "@rurik/core";
import type { Channel, MessageHandler } from "@rurik/channel-base";
import { createTelegramChannel } from "@rurik/channel-telegram";
import { AgentEngine } from "@rurik/agent";
import { Storage } from "@rurik/storage";

export class Gateway {
  private config: GatewayConfig;
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocketServer;
  private channels = new Map<string, Channel>();
  private agent: AgentEngine;
  private storage: Storage;
  private clients = new Set<WebSocket>();

  constructor(config: GatewayConfig) {
    this.config = config;
    this.storage = new Storage(config.storage.dataDir);

    // Restore config from DB (overrides defaults)
    const saved = this.storage.getConfig();
    this.config = { ...config, ...saved };

    this.agent = new AgentEngine(this.storage, this.config.agent.defaults);

    // Express
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());

    // HTTP server + WebSocket
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.setupAPI();
    this.setupWebSocket();
  }

  // --- REST API ---
  private setupAPI() {
    // Health
    this.app.get("/api/health", (_req, res) => {
      const channelStatus: Record<string, unknown> = {};
      for (const [id, ch] of this.channels) {
        channelStatus[id] = ch.getStatus();
      }
      res.json({ status: "ok", channels: channelStatus, uptime: process.uptime() });
    });

    // List channels
    this.app.get("/api/channels", (_req, res) => {
      const result: Record<string, unknown> = {};
      for (const [id, ch] of this.channels) {
        result[id] = { id, status: ch.getStatus() };
      }
      res.json(result);
    });

    // Sessions
    this.app.get("/api/sessions", (req, res) => {
      const { channel, chatId } = req.query;
      res.json(this.storage.listSessions(channel as string, chatId as string));
    });

    // Config
    this.app.get("/api/config", (_req, res) => {
      res.json(this.config);
    });

    this.app.put("/api/config", (req, res) => {
      this.storage.setConfig(req.body);
      res.json({ ok: true });
    });

    // Send message via channel
    this.app.post("/api/send", async (req, res) => {
      const { channel, chatId, text } = req.body;
      const ch = this.channels.get(channel);
      if (!ch) return res.status(404).json({ error: "Channel not found" });
      await ch.send({ channel, chatId }, { text });
      res.json({ ok: true });
    });
  }

  // --- WebSocket ---
  private setupWebSocket() {
    this.wss.on("connection", (ws) => {
      this.clients.add(ws);
      ws.on("close", () => this.clients.delete(ws));
    });
  }

  private broadcast(type: string, data: unknown) {
    const msg = JSON.stringify({ type, data, timestamp: Date.now() });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    }
  }

  // --- Message Handler ---
  private createMessageHandler(): MessageHandler {
    return async (msg: IncomingMessage) => {
      this.broadcast("incoming", msg);

      try {
        // Send typing indicator
        const channel = this.channels.get(msg.target.channel);
        const fullResponse = await this.agent.processMessage(
          msg.target,
          msg.text,
          async (chunk) => {
            // Stream chunks to dashboard
            this.broadcast("stream", { target: msg.target, chunk });
          }
        );

        // Send response
        if (channel) {
          await channel.send(msg.target, {
            text: fullResponse || "(no response)",
            replyToId: msg.id,
          });
        }
        this.broadcast("outgoing", { target: msg.target, text: fullResponse });
      } catch (err) {
        console.error("[gateway] agent error:", err);
        this.broadcast("error", { target: msg.target, error: String(err) });
      }
    };
  }

  // --- Lifecycle ---
  async start() {
    const handler = this.createMessageHandler();

    // Start configured channels
    if (this.config.channels.telegram?.enabled) {
      const tgChannel = createTelegramChannel(this.config.channels.telegram);
      await tgChannel.start(handler);
      this.channels.set("telegram", tgChannel);
      console.log("[gateway] Telegram channel started");
    }

    // Start HTTP server
    const { port, bind } = this.config;
    this.server.listen(port, bind, () => {
      console.log(`[gateway] Listening on http://${bind}:${port}`);
      console.log(`[gateway] WebSocket: ws://${bind}:${port}`);
    });
  }

  async stop() {
    for (const [, ch] of this.channels) {
      await ch.stop();
    }
    await this.agent.shutdown();
    this.wss.close();
    this.server.close();
    this.storage.close();
  }
}
