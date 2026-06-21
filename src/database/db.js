import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'zenith.db');

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const wasmPath = join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');
const SQL = await initSqlJs({ locateFile: () => wasmPath });

let database;
if (existsSync(dbPath)) {
  database = new SQL.Database(readFileSync(dbPath));
} else {
  database = new SQL.Database();
}

function saveDatabase() {
  writeFileSync(dbPath, Buffer.from(database.export()));
}

function prepare(sql) {
  return {
    run(...params) {
      database.run(sql, params);
      saveDatabase();
      const lastId = database.exec('SELECT last_insert_rowid() AS id')[0]?.values[0][0] ?? 0;
      return {
        changes: database.getRowsModified(),
        lastInsertRowid: lastId
      };
    },

    get(...params) {
      const stmt = database.prepare(sql);
      stmt.bind(params);
      let row;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();
      return row;
    },

    all(...params) {
      const stmt = database.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    }
  };
}

function exec(sql) {
  database.run(sql);
  saveDatabase();
}

const db = { prepare, exec };

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      joined_at INTEGER DEFAULT (strftime('%s', 'now')),
      PRIMARY KEY (user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      type TEXT NOT NULL,
      claimed_by TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      message_id TEXT,
      status TEXT DEFAULT 'pending',
      age TEXT,
      timezone TEXT,
      experience TEXT,
      reason TEXT,
      activity TEXT,
      reviewer_id TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS levels (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0,
      last_xp_at INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS giveaways (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,
      channel_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      prize TEXT NOT NULL,
      winners_count INTEGER DEFAULT 1,
      host_id TEXT NOT NULL,
      ends_at INTEGER NOT NULL,
      ended INTEGER DEFAULT 0,
      winners TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,
      channel_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      guild_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (guild_id, key)
    );

    CREATE INDEX IF NOT EXISTS idx_warnings_user ON warnings(user_id, guild_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id, guild_id);
    CREATE INDEX IF NOT EXISTS idx_levels_guild ON levels(guild_id, xp DESC);
    CREATE INDEX IF NOT EXISTS idx_giveaways_active ON giveaways(guild_id, ended);

    CREATE TABLE IF NOT EXISTS suggestion_votes (
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      vote TEXT NOT NULL,
      PRIMARY KEY (message_id, user_id)
    );
  `);
}

export default db;
