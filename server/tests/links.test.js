process.env.DB_PATH = ':memory:';

const { getDb, closeDb } = require('../src/db/connection');
const { insertDemoData } = require('../src/db/sampleData');
const { asUser } = require('./helpers/asUser');

// Demo data: elif → parent of deniz, murat → parent of ece,
// selin linked to deniz, can linked to ece, zeynep linked to nobody.
let ids;
const user = (key, role) => ({ id: ids.users[key], role });
const elif = () => user('elif', 'parent');
const specialistsUrl = (childKey) => `/api/children/${ids.children[childKey]}/specialists`;

beforeEach(() => {
  ids = insertDemoData(getDb());
});

afterEach(() => {
  closeDb();
});

describe('M2 GET /api/children/:childId/specialists', () => {
  it('lists the specialists linked to the parent\'s child', async () => {
    const res = await asUser(elif()).get(specialistsUrl('deniz'));

    expect(res.status).toBe(200);
    expect(res.body.specialists).toEqual([{
      id: ids.users.selin,
      name: 'Selin Arslan',
      email: 'selin.specialist@demo.test',
      specialistType: 'special_education_teacher',
      linkedAt: expect.any(String),
    }]);
  });

  it('returns 401 without a signed-in user', async () => {
    const res = await asUser(null).get(specialistsUrl('deniz'));
    expect(res.status).toBe(401);
  });

  it.each([
    ['another child\'s parent', 'murat', 'parent'],
    ['a linked specialist', 'selin', 'specialist'],
    ['the child', 'deniz', 'child'],
  ])('returns 403 for %s', async (_label, key, role) => {
    const res = await asUser(user(key, role)).get(specialistsUrl('deniz'));
    expect(res.status).toBe(403);
  });
});

describe('M2 POST /api/children/:childId/specialists (link)', () => {
  it('links a registered specialist by email and type', async () => {
    const res = await asUser(elif())
      .post(specialistsUrl('deniz'))
      .send({ email: 'zeynep.specialist@demo.test', specialistType: 'psychologist' });

    expect(res.status).toBe(201);
    expect(res.body.specialist).toMatchObject({
      id: ids.users.zeynep,
      name: 'Zeynep Sahin',
      specialistType: 'psychologist',
    });

    const list = await asUser(elif()).get(specialistsUrl('deniz'));
    expect(list.body.specialists.map((s) => s.id)).toContain(ids.users.zeynep);
  });

  it('gives the newly linked specialist access to the child immediately', async () => {
    const zeynep = user('zeynep', 'specialist');
    expect((await asUser(zeynep).get('/api/me/children')).body.children).toEqual([]);

    await asUser(elif())
      .post(specialistsUrl('deniz'))
      .send({ email: 'zeynep.specialist@demo.test', specialistType: 'coach' });

    const res = await asUser(zeynep).get('/api/me/children');
    expect(res.body.children).toEqual([
      expect.objectContaining({ id: ids.children.deniz, specialistType: 'coach' }),
    ]);
  });

  it('matches the email case-insensitively and ignores surrounding spaces', async () => {
    const res = await asUser(elif())
      .post(specialistsUrl('deniz'))
      .send({ email: '  Zeynep.Specialist@DEMO.test ', specialistType: 'doctor' });
    expect(res.status).toBe(201);
  });

  it('returns 404 for an unregistered email', async () => {
    const res = await asUser(elif())
      .post(specialistsUrl('deniz'))
      .send({ email: 'nobody@demo.test', specialistType: 'teacher' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'No registered specialist with this email' });
  });

  it('returns 404 when the email belongs to a non-specialist account', async () => {
    const res = await asUser(elif())
      .post(specialistsUrl('deniz'))
      .send({ email: 'murat.parent@demo.test', specialistType: 'teacher' });
    expect(res.status).toBe(404);
  });

  it('returns 409 when the specialist is already linked', async () => {
    const res = await asUser(elif())
      .post(specialistsUrl('deniz'))
      .send({ email: 'selin.specialist@demo.test', specialistType: 'teacher' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'This specialist is already linked to the child' });
  });

  it.each([
    ['missing email', { specialistType: 'teacher' }],
    ['blank email', { email: '   ', specialistType: 'teacher' }],
    ['missing type', { email: 'zeynep.specialist@demo.test' }],
    ['unknown type', { email: 'zeynep.specialist@demo.test', specialistType: 'wizard' }],
  ])('returns 400 for %s', async (_label, body) => {
    const res = await asUser(elif()).post(specialistsUrl('deniz')).send(body);
    expect(res.status).toBe(400);
  });

  it('returns 403 when a parent links to someone else\'s child', async () => {
    const res = await asUser(elif())
      .post(specialistsUrl('ece'))
      .send({ email: 'zeynep.specialist@demo.test', specialistType: 'teacher' });
    expect(res.status).toBe(403);
  });

  it('returns 403 when a specialist tries to link another specialist', async () => {
    const res = await asUser(user('selin', 'specialist'))
      .post(specialistsUrl('deniz'))
      .send({ email: 'zeynep.specialist@demo.test', specialistType: 'teacher' });
    expect(res.status).toBe(403);
  });
});

describe('M2 DELETE /api/children/:childId/specialists/:specialistId (unlink)', () => {
  it('unlinks, and the specialist is refused on the very next request', async () => {
    const selin = user('selin', 'specialist');
    const childUrl = `/api/children/${ids.children.deniz}/specialists`;

    const res = await asUser(elif()).delete(`${childUrl}/${ids.users.selin}`);
    expect(res.status).toBe(204);

    const list = await asUser(elif()).get(childUrl);
    expect(list.body.specialists).toEqual([]);

    const mine = await asUser(selin).get('/api/me/children');
    expect(mine.body.children).toEqual([]);
  });

  it('returns 404 when the specialist is not linked', async () => {
    const res = await asUser(elif()).delete(`${specialistsUrl('deniz')}/${ids.users.zeynep}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for an invalid specialist id', async () => {
    const res = await asUser(elif()).delete(`${specialistsUrl('deniz')}/abc`);
    expect(res.status).toBe(404);
  });

  it('returns 403 when the linked specialist tries to unlink themself', async () => {
    const res = await asUser(user('selin', 'specialist'))
      .delete(`${specialistsUrl('deniz')}/${ids.users.selin}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 for another child\'s parent and keeps the link', async () => {
    const res = await asUser(user('murat', 'parent'))
      .delete(`${specialistsUrl('deniz')}/${ids.users.selin}`);
    expect(res.status).toBe(403);

    const list = await asUser(elif()).get(specialistsUrl('deniz'));
    expect(list.body.specialists).toHaveLength(1);
  });
});

describe('M2-03 GET /api/me/children', () => {
  it('returns only the children a specialist is linked to now', async () => {
    const res = await asUser(user('selin', 'specialist')).get('/api/me/children');

    expect(res.status).toBe(200);
    expect(res.body.children).toEqual([{
      id: ids.children.deniz,
      name: 'Deniz Demir',
      birthDate: '2019-04-12',
      specialistType: 'special_education_teacher',
    }]);
  });

  it('returns an empty list for an unlinked specialist', async () => {
    const res = await asUser(user('zeynep', 'specialist')).get('/api/me/children');
    expect(res.body.children).toEqual([]);
  });

  it('returns the parent\'s own children', async () => {
    const res = await asUser(elif()).get('/api/me/children');
    expect(res.body.children.map((c) => c.id)).toEqual([ids.children.deniz]);
  });

  it('returns 403 for a child and 401 without a user', async () => {
    expect((await asUser(user('deniz', 'child')).get('/api/me/children')).status).toBe(403);
    expect((await asUser(null).get('/api/me/children')).status).toBe(401);
  });
});

describe('M2 routes without authentication middleware', () => {
  it('are closed (401) in the real app until authenticate is added', async () => {
    const request = require('supertest');
    const app = require('../src/app');

    expect((await request(app).get(specialistsUrl('deniz'))).status).toBe(401);
    expect((await request(app).get('/api/me/children')).status).toBe(401);
  });
});
