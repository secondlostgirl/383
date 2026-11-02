const { getDb } = require('../db/connection');
const { findChild, canAccessChild } = require('../services/access');

// Use on EVERY /api/children/:childId/* route, after `authenticate`
// (which sets req.user = { id, role }). Checks the database on each request,
// so an unlinked specialist is refused immediately even with a valid JWT.
// On success sets req.child.
function loadChildAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const childId = Number(req.params.childId);
  if (!Number.isInteger(childId) || childId <= 0) {
    return res.status(404).json({ error: 'Child not found' });
  }

  const db = getDb();
  const child = findChild(db, childId);
  if (!child) {
    return res.status(404).json({ error: 'Child not found' });
  }

  if (!canAccessChild(db, req.user, child)) {
    return res.status(403).json({ error: 'You do not have access to this child' });
  }

  req.child = child;
  return next();
}

module.exports = loadChildAccess;
