const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { initSchema } = require('./schema');

// DB_PATH is resolved relative to the repository root, so it works the same
// no matter which folder the command is started from.
const REPO_ROOT = path.resolve(__dirname, '../../..');
const DEFAULT_DB_PATH = 'server/data/app.sqlite';

function resolveDbPath(dbPath = process.env.DB_PATH || DEFAULT_DB_PATH) {
  if (dbPath === ':memory:') return dbPath;
  const absolute = path.resolve(REPO_ROOT, dbPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  return absolute;
}

let db;

function getDb() {
  if (!db) {
    db = new Database(resolveDbPath());
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}

module.exports = { getDb, closeDb, resolveDbPath };
