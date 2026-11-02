process.env.DB_PATH = ':memory:';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { getDb, closeDb } = require('../src/db/connection');
const { insertDemoData, DEMO_PASSWORD } = require('../src/db/sampleData');

let ids;

beforeEach(() => {
  ids = insertDemoData(getDb());
});

afterEach(() => {
  closeDb();
});

const login = (body) => request(app).post('/api/auth/login').send(body);

describe('M1 POST /api/auth/login', () => {
  it.each([
    ['parent', 'elif.parent@demo.test', 'elif'],
    ['specialist', 'selin.specialist@demo.test', 'selin'],
    ['child', 'deniz.child@demo.test', 'deniz'],
  ])('logs a %s in and returns the role from the account', async (role, email, key) => {
    const res = await login({ email, password: DEMO_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: ids.users[key], name: expect.any(String), email, role });
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('puts only the user id, role and expiry in the token', async () => {
    const res = await login({ email: 'elif.parent@demo.test', password: DEMO_PASSWORD });
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);

    expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'role', 'sub']);
    expect(payload).toMatchObject({ sub: String(ids.users.elif), role: 'parent' });
    expect(payload.exp - payload.iat).toBe(8 * 60 * 60);
  });

  it('never returns the password hash', async () => {
    const res = await login({ email: 'elif.parent@demo.test', password: DEMO_PASSWORD });
    expect(JSON.stringify(res.body)).not.toMatch(/password|\$2[aby]\$/);
  });

  it('ignores email case and surrounding spaces', async () => {
    const res = await login({ email: '  ELIF.Parent@demo.test ', password: DEMO_PASSWORD });
    expect(res.status).toBe(200);
  });

  it('returns 401 with a generic message for a wrong password', async () => {
    const res = await login({ email: 'elif.parent@demo.test', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid email or password' });
  });

  it('returns the same 401 message for an unknown email', async () => {
    const res = await login({ email: 'nobody@demo.test', password: DEMO_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid email or password' });
  });

  it.each([
    ['missing email', { password: DEMO_PASSWORD }],
    ['missing password', { email: 'elif.parent@demo.test' }],
    ['blank email', { email: '  ', password: DEMO_PASSWORD }],
    ['non-string password', { email: 'elif.parent@demo.test', password: 12345 }],
  ])('returns 400 for %s', async (_label, body) => {
    const res = await login(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
  });
});
