// /api/me/* – data about the signed-in user (req.user is set by `authenticate`).
const express = require('express');
const { getDb } = require('../db/connection');
const links = require('../services/links');

const router = express.Router();

// Specialist → children linked right now (M2-03); parent → own children.
router.get('/children', (req, res) => {
  const db = getDb();
  switch (req.user.role) {
    case 'specialist':
      return res.json({ children: links.listLinkedChildren(db, req.user.id) });
    case 'parent':
      return res.json({ children: links.listOwnChildren(db, req.user.id) });
    default:
      return res.status(403).json({ error: 'Not available for this role' });
  }
});

module.exports = router;
