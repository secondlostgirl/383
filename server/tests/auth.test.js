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

describe('M1 authenticate middleware and GET /api/auth/me', () => {
  const me = (authHeader) => {
    const req = request(app).get('/api/auth/me');
    return authHeader ? req.set('Authorization', authHeader) : req;
  };
  const sign = (claims, options = {}, secret = process.env.JWT_SECRET) => jwt.sign(
    claims, secret, { subject: String(ids.users.elif), expiresIn: '1h', ...options },
  );

  it('returns the signed-in user for the token from login', async () => {
    const { body } = await login({ email: 'elif.parent@demo.test', password: DEMO_PASSWORD });

    const res = await me(`Bearer ${body.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: body.user });
  });

  it.each([
    ['no Authorization header', undefined],
    ['a non-Bearer scheme', 'Basic abc'],
    ['an empty Bearer token', 'Bearer '],
    ['a malformed token', 'Bearer not.a.jwt'],
  ])('returns 401 for %s', async (_label, header) => {
    expect((await me(header)).status).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    const token = sign({ role: 'parent' }, { expiresIn: -10 });
    expect((await me(`Bearer ${token}`)).status).toBe(401);
  });

  it('returns 401 for a token signed with another secret', async () => {
    const token = sign({ role: 'parent' }, {}, 'some-other-secret');
    expect((await me(`Bearer ${token}`)).status).toBe(401);
  });

  it('returns 401 for an unsigned (alg: none) token', async () => {
    const token = jwt.sign({ role: 'parent' }, null, {
      subject: String(ids.users.elif), algorithm: 'none',
    });
    expect((await me(`Bearer ${token}`)).status).toBe(401);
  });

  it('returns 401 when the account was deleted after login', async () => {
    const { body } = await login({ email: 'zeynep.specialist@demo.test', password: DEMO_PASSWORD });
    getDb().prepare('DELETE FROM users WHERE id = ?').run(ids.users.zeynep);

    expect((await me(`Bearer ${body.token}`)).status).toBe(401);
  });

  it('takes the role from the account, not from the token', async () => {
    // Token claims "specialist", but the account is a parent
    const token = sign({ role: 'specialist' });

    const res = await me(`Bearer ${token}`);
    expect(res.body.user.role).toBe('parent');
  });
});
