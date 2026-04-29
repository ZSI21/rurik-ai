import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import type { GatewayConfig, AgentConfig } from "@rurik/core";

export class Storage {
  private db: Database.Database;
  private dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    fs.mkdirSync(dataDir, { recursive: true });
    fs.mkdirSync(path.join(dataDir, "sessions"), { recursive: true });

    const dbPath = path.join(dataDir, "rurik.db");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.migrate();
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        user_id TEXT,
        model TEXT NOT NULL,
        provider TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
  }

  // Config
  getConfig(): Partial<GatewayConfig> {
    const row = this.db.prepare("SELECT value FROM config WHERE key = ?").get("gateway") as { value: string } | undefined;
    return row ? JSON.parse(row.value) : {};
  }

  setConfig(config: Partial<GatewayConfig>) {
    this.db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)").run("gateway", JSON.stringify(config));
  }

  // Sessions
  getSessionPath(channel: string, chatId: string, sessionId: string): string {
    return path.join(this.dataDir, "sessions", channel, chatId, `${sessionId}.jsonl`);
  }

  recordSession(params: {
    id: string;
    channel: string;
    chatId: string;
    userId?: string;
    model: string;
    provider: string;
  }) {
    this.db.prepare(`
      INSERT OR REPLACE INTO sessions (id, channel, chat_id, user_id, model, provider, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(params.id, params.channel, params.chatId, params.userId ?? null, params.model, params.provider, Date.now(), Date.now());
  }

  listSessions(channel?: string, chatId?: string) {
    let query = "SELECT * FROM sessions WHERE 1=1";
    const params: unknown[] = [];
    if (channel) { query += " AND channel = ?"; params.push(channel); }
    if (chatId) { query += " AND chat_id = ?"; params.push(chatId); }
    query += " ORDER BY updated_at DESC LIMIT 50";
    return this.db.prepare(query).all(...params);
  }

  close() {
    this.db.close();
  }
}
