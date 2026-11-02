const express = require('express');
const request = require('supertest');
const requireRole = require('../src/middleware/requireRole');

// Small app: X-Role header stands in for req.user set by `authenticate`
function appWith(...roles) {
  const app = express();
  app.use((req, res, next) => {
    const role = req.get('X-Role');
    if (role) req.user = { id: 1, role };
    next();
  });
  app.get('/only', requireRole(...roles), (req, res) => res.json({ ok: true }));
  return app;
}

describe('M1 requireRole', () => {
  it.each(['parent', 'specialist', 'child'])('lets an allowed %s through', async (role) => {
    const res = await request(appWith('parent', 'specialist', 'child')).get('/only').set('X-Role', role);
    expect(res.status).toBe(200);
  });

  it.each([
    ['child', ['parent']],
    ['specialist', ['parent']],
    ['parent', ['specialist']],
    ['child', ['parent', 'specialist']],
  ])('returns 403 for %s when only %j are allowed', async (role, allowed) => {
    const res = await request(appWith(...allowed)).get('/only').set('X-Role', role);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'You do not have permission for this action' });
  });

  it('returns 401 when no user is signed in', async () => {
    const res = await request(appWith('parent')).get('/only');
    expect(res.status).toBe(401);
  });

  it('refuses to be configured with an unknown or missing role', () => {
    expect(() => requireRole('admin')).toThrow(/unknown role/);
    expect(() => requireRole()).toThrow(/none given/);
  });
});
