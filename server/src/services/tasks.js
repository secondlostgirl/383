// Tasks (M4): parents and linked specialists assign, the child marks done,
// the assigner follows the status. Access checks happen in the routes
// (loadChildAccess / canAccessChild); this module only reads and writes rows.
const { DEVELOPMENT_AREAS, TASK_STATUSES } = require('../db/schema');

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

const TASK_COLUMNS = `
  t.id,
  t.child_id         AS childId,
  c.name             AS childName,
  t.title,
  t.description,
  t.development_area AS developmentArea,
  t.due_date         AS dueDate,
  t.status,
  t.completed_at     AS completedAt,
  t.created_at       AS createdAt,
  u.id               AS assignedById,
  u.name             AS assignedByName,
  u.role             AS assignedByRole`;

const FROM_TASKS = `
  FROM tasks t
  JOIN children c ON c.id = t.child_id
  JOIN users u    ON u.id = t.assigned_by`;

function toTask(row) {
  if (!row) return null;
  const { assignedById, assignedByName, assignedByRole, ...task } = row;
  return { ...task, assignedBy: { id: assignedById, name: assignedByName, role: assignedByRole } };
}

// A real calendar date in YYYY-MM-DD form (rejects 2026-02-30).
function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

// Returns { value } with the cleaned input, or { error } with a message for the user.
function validateNewTask(body) {
  const input = body ?? {};
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title) return { error: 'Title is required' };
  if (title.length > TITLE_MAX) return { error: `Title must be at most ${TITLE_MAX} characters` };

  if (input.description != null && typeof input.description !== 'string') {
    return { error: 'Description must be text' };
  }
  const description = input.description?.trim() || null;
  if (description && description.length > DESCRIPTION_MAX) {
    return { error: `Description must be at most ${DESCRIPTION_MAX} characters` };
  }

  if (!DEVELOPMENT_AREAS.includes(input.developmentArea)) {
    return { error: `Development area must be one of: ${DEVELOPMENT_AREAS.join(', ')}` };
  }

  if (!isIsoDate(input.dueDate)) {
    return { error: 'Due date is required in the form YYYY-MM-DD' };
  }

  return {
    value: { title, description, developmentArea: input.developmentArea, dueDate: input.dueDate },
  };
}

function getTask(db, taskId) {
  return toTask(db.prepare(`SELECT ${TASK_COLUMNS} ${FROM_TASKS} WHERE t.id = ?`).get(taskId));
}

function createTask(db, childId, assignedBy, { title, description, developmentArea, dueDate }) {
  const result = db
    .prepare(`
      INSERT INTO tasks (child_id, assigned_by, title, description, development_area, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(childId, assignedBy, title, description, developmentArea, dueDate);
  return getTask(db, Number(result.lastInsertRowid));
}

// Pending tasks first, then by due date.
const ORDER = "ORDER BY t.status = 'done', t.due_date, t.id";

function listChildTasks(db, childId) {
  return db
    .prepare(`SELECT ${TASK_COLUMNS} ${FROM_TASKS} WHERE t.child_id = ? ${ORDER}`)
    .all(childId)
    .map(toTask);
}

// Tasks the user assigned, limited to children the user may still access:
// a specialist no longer sees tasks of a child they were unlinked from.
function listAssignedBy(db, user) {
  const accessible = user.role === 'specialist'
    ? 'EXISTS (SELECT 1 FROM specialist_links l WHERE l.child_id = t.child_id AND l.specialist_id = @userId)'
    : 'c.parent_id = @userId';
  return db
    .prepare(`
      SELECT ${TASK_COLUMNS} ${FROM_TASKS}
      WHERE t.assigned_by = @userId AND ${accessible}
      ${ORDER}
    `)
    .all({ userId: user.id })
    .map(toTask);
}

// status: 'done' sets completed_at (kept if it was already done),
// 'pending' clears it (undo a mistaken tap).
function setTaskStatus(db, taskId, status) {
  if (!TASK_STATUSES.includes(status)) throw new Error(`Unknown task status: ${status}`);
  db.prepare(`
    UPDATE tasks
    SET status = @status,
        completed_at = CASE WHEN @status = 'done' THEN COALESCE(completed_at, datetime('now')) END
    WHERE id = @taskId
  `).run({ taskId, status });
  return getTask(db, taskId);
}

module.exports = {
  TITLE_MAX,
  DESCRIPTION_MAX,
  isIsoDate,
  validateNewTask,
  getTask,
  createTask,
  listChildTasks,
  listAssignedBy,
  setTaskStatus,
};
