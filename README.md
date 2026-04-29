# 🛡️ Rurik

AI agent gateway for the Russian ecosystem. Connect messaging platforms (Telegram, VK, Yandex Messenger) to AI agents with tool access, session persistence, and a web dashboard.

> 🚧 **Early development.** Phase 1: Core gateway + Telegram channel.

## Features (planned)

- **Multi-channel**: Telegram, VK, VK Messenger, Yandex Messenger, Discord
- **Russian LLMs**: YandexGPT, GigaChat, plus DeepSeek, OpenAI, Anthropic
- **Web Dashboard**: Manage channels, agents, sessions, logs
- **Self-hosted**: Docker or bare-metal, your VPS
- **AI Agent**: Powered by [pi](https://github.com/badlogic/pi-mono) — coding tools, file access, bash

## Quick Start

```bash
git clone https://github.com/ZSI21/rurik-ai.git
cd rurik-ai
pnpm install
pnpm dev
```

## Architecture

```
📱 Telegram/VK → 🔄 Channel Manager → 🧠 Agent (pi SDK) → 💬 Response
                                     ↕
                              📊 Web Dashboard
                              💾 Session Storage
```

## License

MIT
