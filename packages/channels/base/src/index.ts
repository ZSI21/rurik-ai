import type { IncomingMessage, OutgoingMessage, ChatTarget, ChannelConfig } from "@rurik/core";

export type MessageHandler = (msg: IncomingMessage) => Promise<void>;

export interface Channel {
  /** Unique channel identifier (e.g. "telegram", "vk") */
  readonly id: string;

  /** Start listening for incoming messages */
  start(handler: MessageHandler): Promise<void>;

  /** Stop listening */
  stop(): Promise<void>;

  /** Send a message to a chat */
  send(target: ChatTarget, message: OutgoingMessage): Promise<void>;

  /** Get channel health status */
  getStatus(): ChannelStatus;

  /** Configure the channel (hot-reload) */
  configure(config: ChannelConfig): Promise<void>;
}

export interface ChannelStatus {
  connected: boolean;
  lastEvent?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ChannelFactory {
  id: string;
  create(config: ChannelConfig): Channel;
}
