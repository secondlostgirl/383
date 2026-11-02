// Login, password verification and JWT handling (M1).
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TOKEN_TTL = '8h';
const JWT_ALGORITHM = 'HS256';

// Compared against when the email is unknown, so a wrong email takes as long
// as a wrong password and the response time does not reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-real-password', 10);

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env and set JWT_SECRET to a long random string.');
  }
  return secret;
}

function toPublicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

function findUserById(db, id) {
  const row = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(id);
  return row ? toPublicUser(row) : null;
}

// Returns the public user for valid credentials, otherwise null.
function verifyCredentials(db, email, password) {
  const row = db
    .prepare('SELECT id, name, email, role, password_hash FROM users WHERE email = ?')
    .get(email);
  const passwordMatches = bcrypt.compareSync(password, row ? row.password_hash : DUMMY_HASH);
  return row && passwordMatches ? toPublicUser(row) : null;
}

// The token carries only the user id (sub) and role – no personal data.
function signToken(user) {
  return jwt.sign({ role: user.role }, getJwtSecret(), {
    subject: String(user.id),
    expiresIn: TOKEN_TTL,
    algorithm: JWT_ALGORITHM,
  });
}

// Throws if the token is missing, malformed, expired or signed with another secret.
function verifyToken(token) {
  const payload = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
  return { id: Number(payload.sub), role: payload.role };
}

module.exports = {
  TOKEN_TTL,
  getJwtSecret,
  findUserById,
  verifyCredentials,
  signToken,
  verifyToken,
};
