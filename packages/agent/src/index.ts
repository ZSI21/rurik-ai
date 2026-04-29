import { AuthStorage, ModelRegistry, SessionManager, createAgentSession } from "@mariozechner/pi-coding-agent";
import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { AgentConfig, ChatTarget } from "@rurik/core";
import type { Storage } from "@rurik/storage";
import fs from "node:fs";
import path from "node:path";

interface ActiveSession {
  session: AgentSession;
  config: AgentConfig;
  lastUsed: number;
}

export class AgentEngine {
  private sessions = new Map<string, ActiveSession>();
  private authStorage: AuthStorage;
  private modelRegistry: ModelRegistry;
  private storage: Storage;
  private defaults: AgentConfig;

  constructor(storage: Storage, defaults: AgentConfig) {
    this.storage = storage;
    this.defaults = defaults;
    this.authStorage = AuthStorage.create();
    this.modelRegistry = ModelRegistry.create(this.authStorage);
  }

  private sessionKey(target: ChatTarget): string {
    return `${target.channel}:${target.chatId}:${target.userId || "anon"}`;
  }

  private getSessionPath(target: ChatTarget): string {
    const dir = path.join(this.storage["dataDir"], "sessions", target.channel, target.chatId);
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${this.sessionKey(target)}.jsonl`);
  }

  async processMessage(
    target: ChatTarget,
    userMessage: string,
    onStream: (text: string) => Promise<void>
  ): Promise<string> {
    const key = this.sessionKey(target);
    const config = this.defaults;
    const sessionPath = this.getSessionPath(target);

    // Reuse or create session
    let active = this.sessions.get(key);
    if (!active) {
      const sessionManager = SessionManager.fromFile({
        filePath: sessionPath,
        saveAfterEveryMessage: true,
      });

      const { session } = await createAgentSession({
        sessionManager,
        authStorage: this.authStorage,
        modelRegistry: this.modelRegistry,
        model: config.model,
      });

      active = { session, config, lastUsed: Date.now() };
      this.sessions.set(key, active);

      // Record in storage
      this.storage.recordSession({
        id: key,
        channel: target.channel,
        chatId: target.chatId,
        userId: target.userId,
        model: config.model,
        provider: config.provider,
      });
    }

    active.lastUsed = Date.now();

    // Collect response
    let fullResponse = "";
    active.session.subscribe((event) => {
      if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
        fullResponse += event.assistantMessageEvent.delta;
        onStream(event.assistantMessageEvent.delta).catch(() => {});
      }
    });

    await active.session.prompt(userMessage);
    return fullResponse;
  }

  async shutdown() {
    this.sessions.clear();
  }
}
