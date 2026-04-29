import { Gateway } from "./index.js";
import type { GatewayConfig } from "@rurik/core";
import path from "node:path";
import os from "node:os";

const dataDir = process.env.RURIK_DATA_DIR || path.join(os.homedir(), ".rurik");

const config: GatewayConfig = {
  port: Number(process.env.RURIK_PORT) || 18900,
  bind: process.env.RURIK_BIND || "127.0.0.1",
  auth: {
    mode: "token",
    token: process.env.RURIK_TOKEN || undefined,
  },
  channels: {
    telegram: {
      enabled: !!process.env.TELEGRAM_BOT_TOKEN,
      token: process.env.TELEGRAM_BOT_TOKEN || "",
    },
  },
  agent: {
    defaults: {
      provider: process.env.RURIK_PROVIDER || "deepseek",
      model: process.env.RURIK_MODEL || "deepseek-v4-pro",
      thinkingLevel: "medium",
    },
  },
  storage: {
    dataDir,
  },
};

const gateway = new Gateway(config);

process.on("SIGINT", async () => {
  console.log("\n[gateway] Shutting down...");
  await gateway.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await gateway.stop();
  process.exit(0);
});

gateway.start().catch((err) => {
  console.error("[gateway] Failed to start:", err);
  process.exit(1);
});
