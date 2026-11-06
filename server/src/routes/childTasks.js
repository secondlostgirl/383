// /api/children/:childId/tasks – the child's task list (M4).
// Everyone who may access the child (parent, linked specialist, the child
// itself) can read it; only the parent and linked specialists assign tasks.
const express = require('express');
const { getDb } = require('../db/connection');
const loadChildAccess = require('../middleware/loadChildAccess');
const requireRole = require('../middleware/requireRole');
const tasks = require('../services/tasks');

const router = express.Router({ mergeParams: true });

router.use(loadChildAccess);

router.get('/', (req, res) => {
  res.json({ tasks: tasks.listChildTasks(getDb(), req.child.id) });
});

router.post('/', requireRole('parent', 'specialist'), (req, res) => {
  const { value, error } = tasks.validateNewTask(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const task = tasks.createTask(getDb(), req.child.id, req.user.id, value);
  return res.status(201).json({ task });
});

module.exports = router;
