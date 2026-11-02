process.env.DB_PATH = ':memory:';

const { getDb, closeDb } = require('../src/db/connection');
const { TASKS, insertDemoData } = require('../src/db/sampleData');
const { asUser } = require('./helpers/asUser');

describe('GET /api/tasks (walking skeleton)', () => {
  let elif;

  beforeEach(() => {
    const ids = insertDemoData(getDb());
    elif = { id: ids.users.elif, role: 'parent' };
  });

  afterEach(() => {
    closeDb();
  });

  it('returns the seeded tasks from SQLite to a signed-in user', async () => {
    const res = await asUser(elif).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(TASKS.length);
    expect(res.body.tasks[0]).toMatchObject({
      id: expect.any(Number),
      title: 'Read a picture book for 15 minutes',
      status: 'pending',
    });
  });

  it('returns an empty list when there are no tasks', async () => {
    getDb().exec('DELETE FROM tasks');

    const res = await asUser(elif).get('/api/tasks');
    expect(res.body).toEqual({ tasks: [] });
  });

  it('is not readable anonymously', async () => {
    const res = await asUser(null).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});
