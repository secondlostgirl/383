process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/app');
const { getDb, closeDb } = require('../src/db/connection');
const { SAMPLE_TASKS, insertSampleTasks } = require('../src/db/sampleData');

describe('GET /api/tasks (walking skeleton)', () => {
  afterEach(() => {
    closeDb();
  });

  it('returns an empty list when there are no tasks', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ tasks: [] });
  });

  it('returns the seeded sample task from SQLite', async () => {
    insertSampleTasks(getDb());

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(SAMPLE_TASKS.length);
    expect(res.body.tasks[0]).toMatchObject({
      id: expect.any(Number),
      title: SAMPLE_TASKS[0].title,
      status: 'pending',
    });
  });
});
