process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/app');
const { getDb, closeDb } = require('../src/db/connection');
const { TASKS, insertDemoData } = require('../src/db/sampleData');

describe('GET /api/tasks (walking skeleton)', () => {
  afterEach(() => {
    closeDb();
  });

  it('returns an empty list when there are no tasks', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ tasks: [] });
  });

  it('returns the seeded tasks from SQLite', async () => {
    insertDemoData(getDb());

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(TASKS.length);
    expect(res.body.tasks[0]).toMatchObject({
      id: expect.any(Number),
      title: 'Read a picture book for 15 minutes',
      status: 'pending',
    });
  });
});
