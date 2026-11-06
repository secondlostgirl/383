process.env.DB_PATH = ':memory:';

const { getDb, closeDb } = require('../src/db/connection');
const { insertDemoData, TASKS } = require('../src/db/sampleData');
const { isIsoDate } = require('../src/services/tasks');
const { asUser } = require('./helpers/asUser');

// Demo data: elif → parent of deniz, murat → parent of ece,
// selin linked to deniz, can linked to ece, zeynep linked to nobody.
let ids;
const user = (key, role) => ({ id: ids.users[key], role });
const elif = () => user('elif', 'parent');
const selin = () => user('selin', 'specialist');
const deniz = () => user('deniz', 'child');
const tasksUrl = (childKey) => `/api/children/${ids.children[childKey]}/tasks`;
const statusUrl = (taskId) => `/api/tasks/${taskId}/status`;

const newTask = (overrides = {}) => ({
  title: 'Name five animals',
  description: 'Use the animal picture cards.',
  developmentArea: 'language',
  dueDate: '2026-11-20',
  ...overrides,
});

const taskIdByTitle = (title) => getDb().prepare('SELECT id FROM tasks WHERE title = ?').get(title).id;

beforeEach(() => {
  ids = insertDemoData(getDb());
});

afterEach(() => {
  closeDb();
});

describe('M4 POST /api/children/:childId/tasks (assign)', () => {
  it.each([
    ['the parent', () => elif()],
    ['a linked specialist', () => selin()],
  ])('lets %s assign a task, stored as pending', async (_label, who) => {
    const assigner = who();
    const res = await asUser(assigner).post(tasksUrl('deniz')).send(newTask());

    expect(res.status).toBe(201);
    expect(res.body.task).toEqual({
      id: expect.any(Number),
      childId: ids.children.deniz,
      childName: 'Deniz Demir',
      title: 'Name five animals',
      description: 'Use the animal picture cards.',
      developmentArea: 'language',
      dueDate: '2026-11-20',
      status: 'pending',
      completedAt: null,
      createdAt: expect.any(String),
      assignedBy: { id: assigner.id, name: expect.any(String), role: assigner.role },
    });

    const row = getDb().prepare('SELECT child_id, assigned_by, status FROM tasks WHERE id = ?')
      .get(res.body.task.id);
    expect(row).toEqual({ child_id: ids.children.deniz, assigned_by: assigner.id, status: 'pending' });
  });

  it('trims the title and stores an empty description as null', async () => {
    const res = await asUser(elif()).post(tasksUrl('deniz'))
      .send(newTask({ title: '  Clap a rhythm  ', description: '   ' }));

    expect(res.status).toBe(201);
    expect(res.body.task).toMatchObject({ title: 'Clap a rhythm', description: null });
  });

  it('ignores a status or assigner sent by the client', async () => {
    const res = await asUser(selin()).post(tasksUrl('deniz'))
      .send(newTask({ status: 'done', assignedBy: ids.users.elif, childId: ids.children.ece }));

    expect(res.status).toBe(201);
    expect(res.body.task).toMatchObject({
      status: 'pending',
      childId: ids.children.deniz,
      assignedBy: expect.objectContaining({ id: ids.users.selin }),
    });
  });

  it.each([
    ['a missing title', { title: undefined }, /title is required/i],
    ['a blank title', { title: '   ' }, /title is required/i],
    ['a too long title', { title: 'x'.repeat(201) }, /at most 200/i],
    ['a non-text description', { description: 42 }, /description must be text/i],
    ['a too long description', { description: 'x'.repeat(2001) }, /at most 2000/i],
    ['an unknown development area', { developmentArea: 'music' }, /development area must be one of/i],
    ['a missing due date', { dueDate: undefined }, /due date is required/i],
    ['a due date in another format', { dueDate: '20.11.2026' }, /due date is required/i],
    ['an impossible due date', { dueDate: '2026-02-30' }, /due date is required/i],
  ])('returns 400 for %s', async (_label, overrides, message) => {
    const res = await asUser(elif()).post(tasksUrl('deniz')).send(newTask(overrides));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(message);
    expect(getDb().prepare('SELECT COUNT(*) AS n FROM tasks').get().n).toBe(TASKS.length);
  });

  it.each([
    ['the child', () => deniz()],
    ['an unlinked specialist', () => user('zeynep', 'specialist')],
    ['a specialist linked to another child', () => user('can', 'specialist')],
    ['another child\'s parent', () => user('murat', 'parent')],
  ])('returns 403 for %s', async (_label, who) => {
    const res = await asUser(who()).post(tasksUrl('deniz')).send(newTask());
    expect(res.status).toBe(403);
  });

  it('returns 401 without a signed-in user', async () => {
    const res = await asUser(null).post(tasksUrl('deniz')).send(newTask());
    expect(res.status).toBe(401);
  });

  it('returns 404 for a child that does not exist', async () => {
    const res = await asUser(elif()).post('/api/children/9999/tasks').send(newTask());
    expect(res.status).toBe(404);
  });

  it('refuses a specialist right after the parent unlinks them', async () => {
    await asUser(elif()).delete(`/api/children/${ids.children.deniz}/specialists/${ids.users.selin}`);

    const res = await asUser(selin()).post(tasksUrl('deniz')).send(newTask());
    expect(res.status).toBe(403);
  });
});

describe('M4 GET /api/children/:childId/tasks', () => {
  const denizTitles = TASKS.filter((t) => t.child === 'deniz').map((t) => t.title);

  it.each([
    ['the parent', () => elif()],
    ['a linked specialist', () => selin()],
    ['the child itself', () => deniz()],
  ])('lists the child\'s tasks for %s', async (_label, who) => {
    const res = await asUser(who()).get(tasksUrl('deniz'));

    expect(res.status).toBe(200);
    expect(res.body.tasks.map((t) => t.title).sort()).toEqual([...denizTitles].sort());
    expect(res.body.tasks.every((t) => t.childId === ids.children.deniz)).toBe(true);
  });

  it('lists pending tasks first, each group by due date', async () => {
    const res = await asUser(elif()).get(tasksUrl('deniz'));
    const statuses = res.body.tasks.map((t) => t.status);

    expect(statuses).toEqual([...statuses].sort((a, b) => (a === 'done') - (b === 'done')));
    for (const status of ['pending', 'done']) {
      const dates = res.body.tasks.filter((t) => t.status === status).map((t) => t.dueDate);
      expect(dates).toEqual([...dates].sort());
    }
  });

  it('shows who assigned each task', async () => {
    const res = await asUser(elif()).get(tasksUrl('deniz'));
    const fromSelin = res.body.tasks.find((t) => t.title === 'Practise the /r/ sound with 10 picture cards');

    expect(fromSelin.assignedBy).toEqual({ id: ids.users.selin, name: 'Selin Arslan', role: 'specialist' });
  });

  it.each([
    ['another child', () => user('ece', 'child')],
    ['an unlinked specialist', () => user('zeynep', 'specialist')],
    ['another child\'s parent', () => user('murat', 'parent')],
  ])('returns 403 for %s', async (_label, who) => {
    const res = await asUser(who()).get(tasksUrl('deniz'));
    expect(res.status).toBe(403);
  });

  it('returns 401 without a signed-in user', async () => {
    const res = await asUser(null).get(tasksUrl('deniz'));
    expect(res.status).toBe(401);
  });
});

describe('M4 PATCH /api/tasks/:taskId/status (child marks done)', () => {
  const pendingTitle = 'Read a picture book for 15 minutes';
  const doneTitle = 'Practise the /r/ sound with 10 picture cards';

  it('lets the child mark their own task as done', async () => {
    const taskId = taskIdByTitle(pendingTitle);
    const res = await asUser(deniz()).patch(statusUrl(taskId)).send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.task).toMatchObject({ id: taskId, status: 'done', completedAt: expect.any(String) });
  });

  it('lets the assigner see the new status right away', async () => {
    const taskId = taskIdByTitle(pendingTitle);
    await asUser(deniz()).patch(statusUrl(taskId)).send({ status: 'done' });

    const res = await asUser(elif()).get('/api/tasks/assigned-by-me');
    expect(res.body.tasks.find((t) => t.id === taskId).status).toBe('done');
  });

  it('keeps the first completion time when a done task is marked done again', async () => {
    const taskId = taskIdByTitle(doneTitle);
    const before = getDb().prepare('SELECT completed_at FROM tasks WHERE id = ?').get(taskId).completed_at;

    const res = await asUser(deniz()).patch(statusUrl(taskId)).send({ status: 'done' });
    expect(res.body.task.completedAt).toBe(before);
  });

  it('lets the child undo a done task back to pending', async () => {
    const taskId = taskIdByTitle(doneTitle);
    const res = await asUser(deniz()).patch(statusUrl(taskId)).send({ status: 'pending' });

    expect(res.status).toBe(200);
    expect(res.body.task).toMatchObject({ status: 'pending', completedAt: null });
  });

  it.each([
    ['a missing status', {}],
    ['an unknown status', { status: 'approved' }],
  ])('returns 400 for %s', async (_label, body) => {
    const res = await asUser(deniz()).patch(statusUrl(taskIdByTitle(pendingTitle))).send(body);
    expect(res.status).toBe(400);
  });

  it.each([
    ['the parent', () => elif()],
    ['the linked specialist who assigned it', () => selin()],
  ])('returns 403 for %s, who can see but not complete the task', async (_label, who) => {
    const taskId = taskIdByTitle(doneTitle);
    const res = await asUser(who()).patch(statusUrl(taskId)).send({ status: 'pending' });

    expect(res.status).toBe(403);
    expect(getDb().prepare('SELECT status FROM tasks WHERE id = ?').get(taskId).status).toBe('done');
  });

  it.each([
    ['another child', () => user('ece', 'child')],
    ['an unlinked specialist', () => user('zeynep', 'specialist')],
    ['another child\'s parent', () => user('murat', 'parent')],
  ])('returns 404 for %s, so the task does not leak', async (_label, who) => {
    const taskId = taskIdByTitle(pendingTitle);
    const res = await asUser(who()).patch(statusUrl(taskId)).send({ status: 'done' });

    expect(res.status).toBe(404);
    expect(getDb().prepare('SELECT status FROM tasks WHERE id = ?').get(taskId).status).toBe('pending');
  });

  it.each(['9999', 'abc', '0'])('returns 404 for task id %s', async (taskId) => {
    const res = await asUser(deniz()).patch(statusUrl(taskId)).send({ status: 'done' });
    expect(res.status).toBe(404);
  });

  it('returns 401 without a signed-in user', async () => {
    const res = await asUser(null).patch(statusUrl(taskIdByTitle(pendingTitle))).send({ status: 'done' });
    expect(res.status).toBe(401);
  });
});

describe('M4 GET /api/tasks/assigned-by-me', () => {
  const titlesBy = (key) => TASKS.filter((t) => t.by === key).map((t) => t.title).sort();

  it.each([
    ['a parent', 'elif', 'parent'],
    ['a specialist', 'selin', 'specialist'],
    ['another specialist', 'can', 'specialist'],
  ])('lists only the tasks %s assigned, with status and due date', async (_label, key, role) => {
    const res = await asUser(user(key, role)).get('/api/tasks/assigned-by-me');

    expect(res.status).toBe(200);
    expect(res.body.tasks.map((t) => t.title).sort()).toEqual(titlesBy(key));
    for (const task of res.body.tasks) {
      expect(task.assignedBy.id).toBe(ids.users[key]);
      expect(['pending', 'done']).toContain(task.status);
      expect(isIsoDate(task.dueDate)).toBe(true);
      expect(task.childName).toEqual(expect.any(String));
    }
  });

  it('includes a task right after it is assigned', async () => {
    const created = await asUser(selin()).post(tasksUrl('deniz')).send(newTask());

    const res = await asUser(selin()).get('/api/tasks/assigned-by-me');
    expect(res.body.tasks.map((t) => t.id)).toContain(created.body.task.id);
  });

  it('hides tasks of a child the specialist was unlinked from', async () => {
    await asUser(elif()).delete(`/api/children/${ids.children.deniz}/specialists/${ids.users.selin}`);

    const res = await asUser(selin()).get('/api/tasks/assigned-by-me');
    expect(res.body.tasks).toEqual([]);
  });

  it('returns an empty list for a specialist who assigned nothing', async () => {
    const res = await asUser(user('zeynep', 'specialist')).get('/api/tasks/assigned-by-me');
    expect(res.body.tasks).toEqual([]);
  });

  it('returns 403 for a child', async () => {
    const res = await asUser(deniz()).get('/api/tasks/assigned-by-me');
    expect(res.status).toBe(403);
  });

  it('returns 401 without a signed-in user', async () => {
    const res = await asUser(null).get('/api/tasks/assigned-by-me');
    expect(res.status).toBe(401);
  });
});

describe('isIsoDate', () => {
  it.each(['2026-11-20', '2028-02-29'])('accepts %s', (value) => {
    expect(isIsoDate(value)).toBe(true);
  });

  it.each(['2026-02-29', '2026-13-01', '2026-1-5', '', null, 20261120])('rejects %s', (value) => {
    expect(isIsoDate(value)).toBe(false);
  });
});
