const express = require('express');
const { getDb } = require('../db/connection');

const router = express.Router();

// Walking skeleton (M4-01): list all tasks. Auth and per-child access
// are added with M1-06 and M4-03.
router.get('/', (req, res) => {
  const tasks = getDb()
    .prepare('SELECT id, title, description, status, created_at FROM tasks ORDER BY id')
    .all();
  res.json({ tasks });
});

module.exports = router;
