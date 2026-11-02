process.env.DB_PATH = ':memory:';

const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('../src/db/connection');
const { initSchema } = require('../src/db/schema');
const {
  DEMO_PASSWORD, USERS, CHILDREN, LINKS, EVENTS, TASKS, OBSERVATIONS, insertDemoData,
} = require('../src/db/sampleData');

const count = (db, table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

describe('M1-05 database schema', () => {
  afterEach(() => {
    closeDb();
  });

  it('creates every table and can run twice (idempotent)', () => {
    const db = getDb();
    expect(() => initSchema(db)).not.toThrow();

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
      .all()
      .map((t) => t.name);
    expect(tables).toEqual(expect.arrayContaining([
      'users', 'children', 'specialist_links', 'events', 'tasks',
      'observations', 'documents', 'ai_summaries', 'ai_summary_sources',
    ]));
  });

  it('rejects an unknown role', () => {
    const insert = getDb().prepare(
      "INSERT INTO users (email, password_hash, name, role) VALUES ('x@demo.test', 'h', 'X', 'admin')",
    );
    expect(() => insert.run()).toThrow(/CHECK constraint failed/);
  });

  it('rejects a duplicate email regardless of case', () => {
    const insert = getDb().prepare(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, 'h', 'X', 'parent')",
    );
    insert.run('same@demo.test');
    expect(() => insert.run('SAME@demo.test')).toThrow(/UNIQUE constraint failed/);
  });

  it('rejects an unknown development area on tasks', () => {
    const db = getDb();
    const ids = insertDemoData(db);
    const insert = db.prepare(
      "INSERT INTO tasks (child_id, assigned_by, title, development_area) VALUES (?, ?, 'T', 'music')",
    );
    expect(() => insert.run(ids.children.deniz, ids.users.elif)).toThrow(/CHECK constraint failed/);
  });

  it('rejects linking the same specialist to the same child twice', () => {
    const db = getDb();
    const ids = insertDemoData(db);
    const insert = db.prepare(
      "INSERT INTO specialist_links (child_id, specialist_id, specialist_type) VALUES (?, ?, 'x')",
    );
    expect(() => insert.run(ids.children.deniz, ids.users.selin)).toThrow(/UNIQUE constraint failed/);
  });
});

describe('M1-05 demo seed data', () => {
  afterEach(() => {
    closeDb();
  });

  it('inserts the documented number of rows', () => {
    const db = getDb();
    insertDemoData(db);

    expect(count(db, 'users')).toBe(Object.keys(USERS).length);
    expect(count(db, 'children')).toBe(Object.keys(CHILDREN).length);
    expect(count(db, 'specialist_links')).toBe(LINKS.length);
    expect(count(db, 'events')).toBe(EVENTS.length);
    expect(count(db, 'tasks')).toBe(TASKS.length);
    expect(count(db, 'observations')).toBe(OBSERVATIONS.length);
  });

  it('has 2 parents, 2 children, 3 specialists with exactly one unlinked', () => {
    const db = getDb();
    insertDemoData(db);

    const byRole = Object.fromEntries(db
      .prepare('SELECT role, COUNT(*) AS n FROM users GROUP BY role')
      .all()
      .map((r) => [r.role, r.n]));
    expect(byRole).toEqual({ parent: 2, child: 2, specialist: 3 });

    const unlinked = db.prepare(`
      SELECT email FROM users
      WHERE role = 'specialist' AND id NOT IN (SELECT specialist_id FROM specialist_links)
    `).all();
    expect(unlinked).toEqual([{ email: 'zeynep.specialist@demo.test' }]);
  });

  it('stores bcrypt hashes, never the plain password', () => {
    const db = getDb();
    insertDemoData(db);

    const { password_hash: hash } = db.prepare('SELECT password_hash FROM users LIMIT 1').get();
    expect(hash).not.toBe(DEMO_PASSWORD);
    expect(bcrypt.compareSync(DEMO_PASSWORD, hash)).toBe(true);
  });

  it('dates records relative to the current week', () => {
    const db = getDb();
    // Wednesday 2026-11-04 → current week is Mon 2026-11-02 … Sun 2026-11-08
    insertDemoData(db, { now: new Date(2026, 10, 4) });

    const { due_date: due } = db
      .prepare("SELECT due_date FROM tasks WHERE title = 'Read a picture book for 15 minutes'")
      .get();
    expect(due).toBe('2026-11-06'); // week 0, day 4 = Friday

    const thisWeek = db
      .prepare("SELECT COUNT(*) AS n FROM events WHERE start_at >= '2026-11-02' AND start_at < '2026-11-09'")
      .get().n;
    expect(thisWeek).toBe(EVENTS.filter((e) => e.week === 0).length);
  });

  it('sets updated_at only on edited observations', () => {
    const db = getDb();
    insertDemoData(db);

    const edited = db.prepare('SELECT COUNT(*) AS n FROM observations WHERE updated_at IS NOT NULL').get().n;
    expect(edited).toBe(OBSERVATIONS.filter((o) => o.edited).length);
  });
});
