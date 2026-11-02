process.env.DB_PATH = ':memory:';

const express = require('express');
const request = require('supertest');
const { getDb, closeDb } = require('../src/db/connection');
const { insertDemoData } = require('../src/db/sampleData');
const { findChild, canAccessChild } = require('../src/services/access');
const loadChildAccess = require('../src/middleware/loadChildAccess');

let db;
let ids;

beforeEach(() => {
  db = getDb();
  ids = insertDemoData(db);
});

afterEach(() => {
  closeDb();
});

const user = (key, role) => ({ id: ids.users[key], role });
const child = (key) => findChild(db, ids.children[key]);
const unlink = (childKey, specialistKey) => db
  .prepare('DELETE FROM specialist_links WHERE child_id = ? AND specialist_id = ?')
  .run(ids.children[childKey], ids.users[specialistKey]);

describe('M2-01 canAccessChild', () => {
  // Demo data: elif → parent of deniz, murat → parent of ece,
  // selin linked to deniz, can linked to ece, zeynep linked to nobody.
  it.each([
    ['parent of the child', 'elif', 'parent', 'deniz', true],
    ['parent of another child', 'elif', 'parent', 'ece', false],
    ['linked specialist', 'selin', 'specialist', 'deniz', true],
    ['specialist linked to another child', 'selin', 'specialist', 'ece', false],
    ['specialist with no links', 'zeynep', 'specialist', 'deniz', false],
    ['the child itself', 'deniz', 'child', 'deniz', true],
    ['another child', 'deniz', 'child', 'ece', false],
  ])('%s → %s', (_label, userKey, role, childKey, expected) => {
    expect(canAccessChild(db, user(userKey, role), child(childKey))).toBe(expected);
  });

  it('refuses a specialist as soon as the link is removed', () => {
    const selin = user('selin', 'specialist');
    expect(canAccessChild(db, selin, child('deniz'))).toBe(true);

    unlink('deniz', 'selin');

    expect(canAccessChild(db, selin, child('deniz'))).toBe(false);
  });

  it('refuses an unknown role, a missing user and a missing child', () => {
    expect(canAccessChild(db, { id: ids.users.elif, role: 'admin' }, child('deniz'))).toBe(false);
    expect(canAccessChild(db, undefined, child('deniz'))).toBe(false);
    expect(canAccessChild(db, user('elif', 'parent'), undefined)).toBe(false);
  });

  it('uses the role from the token, not the id alone', () => {
    // Parent id with a specialist role must not pass as parent
    expect(canAccessChild(db, user('elif', 'specialist'), child('deniz'))).toBe(false);
  });
});

describe('M2-01 loadChildAccess middleware', () => {
  // Test app: the X-Test-User header stands in for the `authenticate`
  // middleware (S2G1-20), which will set req.user from the JWT.
  function buildApp() {
    const app = express();
    app.use((req, res, next) => {
      const header = req.get('X-Test-User');
      if (header) req.user = JSON.parse(header);
      next();
    });
    app.get('/api/children/:childId/ping', loadChildAccess, (req, res) => {
      res.json({ childId: req.child.id, name: req.child.name });
    });
    return app;
  }

  const get = (path, u) => {
    const req = request(buildApp()).get(path);
    return u ? req.set('X-Test-User', JSON.stringify(u)) : req;
  };

  it('returns 401 without an authenticated user', async () => {
    const res = await get(`/api/children/${ids.children.deniz}/ping`);
    expect(res.status).toBe(401);
  });

  it('lets the parent through and sets req.child', async () => {
    const res = await get(`/api/children/${ids.children.deniz}/ping`, user('elif', 'parent'));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ childId: ids.children.deniz, name: 'Deniz Demir' });
  });

  it('lets a linked specialist through', async () => {
    const res = await get(`/api/children/${ids.children.deniz}/ping`, user('selin', 'specialist'));
    expect(res.status).toBe(200);
  });

  it('returns 403 for an unlinked specialist', async () => {
    const res = await get(`/api/children/${ids.children.deniz}/ping`, user('zeynep', 'specialist'));
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'You do not have access to this child' });
  });

  it('returns 403 right after unlinking, with the same user object', async () => {
    const selin = user('selin', 'specialist');
    expect((await get(`/api/children/${ids.children.deniz}/ping`, selin)).status).toBe(200);

    unlink('deniz', 'selin');

    expect((await get(`/api/children/${ids.children.deniz}/ping`, selin)).status).toBe(403);
  });

  it('returns 403 for a child opening another child', async () => {
    const res = await get(`/api/children/${ids.children.ece}/ping`, user('deniz', 'child'));
    expect(res.status).toBe(403);
  });

  it.each(['999999', 'abc', '0', '-1'])('returns 404 for child id %s', async (childId) => {
    const res = await get(`/api/children/${childId}/ping`, user('elif', 'parent'));
    expect(res.status).toBe(404);
  });
});
