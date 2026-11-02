const { getDb } = require('../db/connection');
const { verifyToken, findUserById } = require('../services/auth');

// Requires `Authorization: Bearer <JWT>`. The user is loaded from the database
// on every request, so a deleted account is refused even with a valid token
// and the role always comes from the account. Sets req.user = { id, name, email, role }.
function authenticate(req, res, next) {
  const [scheme, token] = (req.get('Authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let claims;
  try {
    claims = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = Number.isInteger(claims.id) ? findUserById(getDb(), claims.id) : null;
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  return next();
}

module.exports = authenticate;
