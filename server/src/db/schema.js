// Full data model (M1-05, see docs/SDD.md §3).
// Every statement must be idempotent (CREATE TABLE IF NOT EXISTS ...).
// Changing an existing table? Run `npm run seed` to recreate the local DB.

const ROLES = ['parent', 'specialist', 'child'];
const DEVELOPMENT_AREAS = ['language', 'motor', 'cognitive', 'social_emotional', 'self_care'];
const TASK_STATUSES = ['pending', 'done'];
const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const SUMMARY_SOURCE_TYPES = ['observation', 'task', 'event', 'document'];

const list = (values) => values.map((v) => `'${v}'`).join(', ');

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN (${list(ROLES)})),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // user_id is the child's own login account (role = child).
  `CREATE TABLE IF NOT EXISTS children (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id    INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    name       TEXT NOT NULL,
    birth_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // A row exists only while the specialist is linked. Unlink = DELETE.
  `CREATE TABLE IF NOT EXISTS specialist_links (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id        INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    specialist_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialist_type TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (child_id, specialist_id)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_links_specialist ON specialist_links (specialist_id)',

  `CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id    INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    created_by  INTEGER NOT NULL REFERENCES users(id),
    title       TEXT NOT NULL,
    description TEXT,
    start_at    TEXT NOT NULL,
    end_at      TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (end_at > start_at)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_events_child_start ON events (child_id, start_at)',

  `CREATE TABLE IF NOT EXISTS tasks (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id         INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    assigned_by      INTEGER NOT NULL REFERENCES users(id),
    title            TEXT NOT NULL,
    description      TEXT,
    development_area TEXT NOT NULL CHECK (development_area IN (${list(DEVELOPMENT_AREAS)})),
    due_date         TEXT,
    status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (${list(TASK_STATUSES)})),
    completed_at     TEXT,
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  'CREATE INDEX IF NOT EXISTS idx_tasks_child ON tasks (child_id)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks (assigned_by)',

  // updated_at stays NULL until the entry is edited ("edited" indicator, M5).
  `CREATE TABLE IF NOT EXISTS observations (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id         INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    specialist_id    INTEGER NOT NULL REFERENCES users(id),
    development_area TEXT NOT NULL CHECK (development_area IN (${list(DEVELOPMENT_AREAS)})),
    content          TEXT NOT NULL,
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT
  )`,
  'CREATE INDEX IF NOT EXISTS idx_observations_child ON observations (child_id)',

  `CREATE TABLE IF NOT EXISTS documents (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id      INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    uploaded_by   INTEGER NOT NULL REFERENCES users(id),
    original_name TEXT NOT NULL,
    stored_name   TEXT NOT NULL UNIQUE,
    mime_type     TEXT NOT NULL CHECK (mime_type IN (${list(DOCUMENT_MIME_TYPES)})),
    size_bytes    INTEGER NOT NULL CHECK (size_bytes > 0),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  'CREATE INDEX IF NOT EXISTS idx_documents_child ON documents (child_id)',

  `CREATE TABLE IF NOT EXISTS ai_summaries (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id     INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    requested_by INTEGER NOT NULL REFERENCES users(id),
    reader_role  TEXT NOT NULL CHECK (reader_role IN ('parent', 'specialist')),
    week_start   TEXT NOT NULL,
    content      TEXT NOT NULL,
    model        TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Which records a summary was generated from (shown as source references).
  `CREATE TABLE IF NOT EXISTS ai_summary_sources (
    summary_id  INTEGER NOT NULL REFERENCES ai_summaries(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN (${list(SUMMARY_SOURCE_TYPES)})),
    source_id   INTEGER NOT NULL,
    PRIMARY KEY (summary_id, source_type, source_id)
  )`,
];

function initSchema(db) {
  for (const sql of STATEMENTS) {
    db.exec(sql);
  }
}

module.exports = {
  initSchema,
  ROLES,
  DEVELOPMENT_AREAS,
  TASK_STATUSES,
  DOCUMENT_MIME_TYPES,
  SUMMARY_SOURCE_TYPES,
};
