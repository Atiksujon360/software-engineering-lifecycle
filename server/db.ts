import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'playbook.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'new',
    fields_json TEXT NOT NULL DEFAULT '{}',
    dates_json TEXT NOT NULL DEFAULT '{}',
    blocks_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_progress (
    project_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    checked INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(project_id, task_id),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS phase_notes (
    project_id TEXT NOT NULL,
    phase_id INTEGER NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL,
    PRIMARY KEY(project_id, phase_id),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_snapshots (
    project_id TEXT NOT NULL,
    date TEXT NOT NULL,
    percent INTEGER NOT NULL,
    done_count INTEGER NOT NULL,
    total_count INTEGER NOT NULL,
    PRIMARY KEY(project_id, date),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
  CREATE INDEX IF NOT EXISTS idx_progress_updated_at ON project_progress(updated_at);
  CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON phase_notes(updated_at);
`);
