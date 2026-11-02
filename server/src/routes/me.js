// /api/me/* – data about the signed-in user (req.user is set by `authenticate`).
const express = require('express');
const { getDb } = require('../db/connection');
const links = require('../services/links');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Specialist → children linked right now (M2-03); parent → own children.
router.get('/children', requireRole('parent', 'specialist'), (req, res) => {
  const db = getDb();
  const children = req.user.role === 'specialist'
    ? links.listLinkedChildren(db, req.user.id)
    : links.listOwnChildren(db, req.user.id);
  res.json({ children });
});

module.exports = router;
