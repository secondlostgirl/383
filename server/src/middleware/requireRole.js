const { ROLES } = require('../db/schema');

// Use after `authenticate`: requireRole('parent') or requireRole('parent', 'specialist').
// Answers 403 when the signed-in user's role is not in the list.
function requireRole(...allowed) {
  const unknown = allowed.filter((role) => !ROLES.includes(role));
  if (allowed.length === 0 || unknown.length > 0) {
    throw new Error(`requireRole: unknown role(s) ${unknown.join(', ') || '(none given)'}`);
  }

  return function checkRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission for this action' });
    }
    return next();
  };
}

module.exports = requireRole;
