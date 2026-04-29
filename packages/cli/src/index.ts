#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gatewayPath = path.resolve(__dirname, "../../gateway/src/start.ts");

const args = process.argv.slice(2);
const command = args[0] || "gateway";

async function main() {
  switch (command) {
    case "gateway":
    case "start": {
      console.log("🛡️  Starting Rurik Gateway...");
      const child = spawn("npx", ["tsx", gatewayPath], {
        stdio: "inherit",
        env: process.env,
      });
      child.on("exit", (code) => process.exit(code || 0));
      break;
    }
    case "channels": {
      console.log("Channels: telegram (configured: " + (!!process.env.TELEGRAM_BOT_TOKEN ? "yes" : "no") + ")");
      break;
    }
    case "config": {
      console.log("Config file: ~/.rurik/rurik.db");
      break;
    }
    case "help":
    case "--help":
    case "-h": {
      console.log(`
🛡️  Rurik — AI Agent Gateway

Commands:
  rurik gateway       Start the gateway (default)
  rurik channels      List configured channels
  rurik config        Show config location
  rurik help          Show this help

Environment:
  TELEGRAM_BOT_TOKEN  Telegram bot token
  DEEPSEEK_API_KEY    DeepSeek API key
  RURIK_PORT          Gateway port (default: 18900)
  RURIK_BIND          Bind address (default: 127.0.0.1)
  RURIK_PROVIDER      LLM provider (default: deepseek)
  RURIK_MODEL         LLM model (default: deepseek-v4-pro)
      `);
      break;
    }
    default:
      console.log(`Unknown command: ${command}`);
      console.log("Run 'rurik help' for available commands.");
      process.exit(1);
  }
}

main();
