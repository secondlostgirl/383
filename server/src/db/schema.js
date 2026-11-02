// Tables are added module by module (full schema in M1-05, see docs/SDD.md §3).
// Every statement must be idempotent (CREATE TABLE IF NOT EXISTS ...).
const STATEMENTS = [
  // Walking skeleton (M4-01). M1-05 / M4-03 extend this table with
  // assignee, assigner, child and due date columns.
  `CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

function initSchema(db) {
  for (const sql of STATEMENTS) {
    db.exec(sql);
  }
}

module.exports = { initSchema };
