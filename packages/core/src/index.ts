// Shared types for Rurik

export interface ChatTarget {
  channel: string;
  chatId: string;
  userId?: string;
  threadId?: string;
}

export interface IncomingMessage {
  id: string;
  target: ChatTarget;
  text: string;
  senderName?: string;
  attachments?: Attachment[];
  timestamp: number;
}

export interface OutgoingMessage {
  text: string;
  attachments?: Attachment[];
  replyToId?: string;
}

export interface Attachment {
  type: "image" | "file" | "audio" | "video";
  url?: string;
  data?: Buffer;
  mimeType: string;
  filename?: string;
}

export interface ChannelConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface AgentConfig {
  provider: string;
  model: string;
  thinkingLevel: "off" | "minimal" | "low" | "medium" | "high" | "xhigh";
  tools?: string[];
  maxTokens?: number;
  systemPrompt?: string;
}

export interface GatewayConfig {
  port: number;
  bind: string;
  auth: {
    mode: "token" | "none";
    token?: string;
  };
  channels: Record<string, ChannelConfig>;
  agent: {
    defaults: AgentConfig;
    perChannelOverrides?: Record<string, Partial<AgentConfig>>;
  };
  storage: {
    dataDir: string;
  };
}
