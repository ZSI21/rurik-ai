import { Bot, type Context } from "grammy";
import type { IncomingMessage, OutgoingMessage, ChatTarget, ChannelConfig } from "@rurik/core";
import type { Channel, ChannelStatus, MessageHandler } from "@rurik/channel-base";

export class TelegramChannel implements Channel {
  readonly id = "telegram";
  private bot: Bot | null = null;
  private token: string;
  private handler: MessageHandler | null = null;
  private status: ChannelStatus = { connected: false };

  constructor(config: ChannelConfig) {
    this.token = (config.token as string) || process.env.TELEGRAM_BOT_TOKEN || "";
  }

  async start(handler: MessageHandler): Promise<void> {
    if (!this.token) throw new Error("Telegram bot token not configured");
    this.handler = handler;

    this.bot = new Bot(this.token);

    this.bot.on("message:text", async (ctx: Context) => {
      if (!this.handler || !ctx.message?.text) return;
      const msg: IncomingMessage = {
        id: String(ctx.message.message_id),
        target: {
          channel: "telegram",
          chatId: String(ctx.chat.id),
          userId: String(ctx.from?.id),
        },
        text: ctx.message.text,
        senderName: ctx.from?.first_name,
        timestamp: ctx.message.date * 1000,
      };
      try {
        await ctx.replyWithChatAction("typing");
        await this.handler(msg);
      } catch (err) {
        console.error("[telegram] handler error:", err);
        await ctx.reply("⚠️ Произошла ошибка. Попробуйте позже.").catch(() => {});
      }
    });

    await this.bot.start({
      onStart: () => {
        this.status = { connected: true, lastEvent: Date.now() };
      },
    });
  }

  async stop(): Promise<void> {
    await this.bot?.stop();
    this.status = { connected: false };
  }

  async send(target: ChatTarget, message: OutgoingMessage): Promise<void> {
    if (!this.bot) throw new Error("Telegram bot not started");
    await this.bot.api.sendMessage(target.chatId, message.text, {
      reply_to_message_id: message.replyToId ? Number(message.replyToId) : undefined,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
    this.status.lastEvent = Date.now();
  }

  getStatus(): ChannelStatus {
    return { ...this.status };
  }

  async configure(config: ChannelConfig): Promise<void> {
    const wasRunning = this.status.connected;
    if (wasRunning) await this.stop();
    this.token = (config.token as string) || this.token;
    if (wasRunning && this.handler) await this.start(this.handler);
  }
}

export function createTelegramChannel(config: ChannelConfig): Channel {
  return new TelegramChannel(config);
}
