// Tables are added module by module (full schema in M1-05, see docs/SDD.md §3).
// Every statement must be idempotent (CREATE TABLE IF NOT EXISTS ...).
const STATEMENTS = [];

function initSchema(db) {
  for (const sql of STATEMENTS) {
    db.exec(sql);
  }
}

module.exports = { initSchema };
