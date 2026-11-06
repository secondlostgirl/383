// /api/tasks/* – task routes that are not under one child (M4).
const express = require('express');
const { getDb } = require('../db/connection');
const { TASK_STATUSES } = require('../db/schema');
const { findChild, canAccessChild } = require('../services/access');
const requireRole = require('../middleware/requireRole');
const tasks = require('../services/tasks');

const router = express.Router();

// Tasks the signed-in parent/specialist assigned, with their status.
router.get('/assigned-by-me', requireRole('parent', 'specialist'), (req, res) => {
  res.json({ tasks: tasks.listAssignedBy(getDb(), req.user) });
});

// Only the child the task belongs to changes its status.
// A task the user may not see answers 404, so task ids of other children do not leak.
router.patch('/:taskId/status', (req, res) => {
  const db = getDb();
  const taskId = Number(req.params.taskId);
  const task = Number.isInteger(taskId) && taskId > 0 ? tasks.getTask(db, taskId) : null;
  if (!task || !canAccessChild(db, req.user, findChild(db, task.childId))) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (req.user.role !== 'child') {
    return res.status(403).json({ error: 'Only the child can change the status of a task' });
  }

  const { status } = req.body ?? {};
  if (!TASK_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${TASK_STATUSES.join(', ')}` });
  }

  return res.json({ task: tasks.setTaskStatus(db, task.id, status) });
});

module.exports = router;
