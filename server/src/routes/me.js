// /api/me/* – data about the signed-in user.
const express = require('express');
const { getDb } = require('../db/connection');
const links = require('../services/links');

const router = express.Router();

// TODO(S2G1-20): `authenticate` will set req.user; until then every call is 401.
function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return next();
}

// Specialist → children linked right now (M2-03); parent → own children.
router.get('/children', requireUser, (req, res) => {
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
