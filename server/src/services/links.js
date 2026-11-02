// Specialist ↔ child links (M2). A link row exists only while the specialist
// is linked; unlinking deletes it, so access is refused on the next request.

const SPECIALIST_COLUMNS = `
  u.id, u.name, u.email,
  l.specialist_type AS specialistType,
  l.created_at      AS linkedAt`;

function findSpecialistByEmail(db, email) {
  return db
    .prepare("SELECT id, name, email FROM users WHERE email = ? AND role = 'specialist'")
    .get(email);
}

function getLinkedSpecialist(db, childId, specialistId) {
  return db.prepare(`
    SELECT ${SPECIALIST_COLUMNS}
    FROM specialist_links l JOIN users u ON u.id = l.specialist_id
    WHERE l.child_id = ? AND l.specialist_id = ?
  `).get(childId, specialistId);
}

function listLinkedSpecialists(db, childId) {
  return db.prepare(`
    SELECT ${SPECIALIST_COLUMNS}
    FROM specialist_links l JOIN users u ON u.id = l.specialist_id
    WHERE l.child_id = ?
    ORDER BY u.name
  `).all(childId);
}

// Returns the linked specialist, or null if the link already exists.
function linkSpecialist(db, childId, specialistId, specialistType) {
  const result = db
    .prepare(`
      INSERT INTO specialist_links (child_id, specialist_id, specialist_type)
      VALUES (?, ?, ?)
      ON CONFLICT (child_id, specialist_id) DO NOTHING
    `)
    .run(childId, specialistId, specialistType);
  if (result.changes === 0) return null;
  return getLinkedSpecialist(db, childId, specialistId);
}

// Returns true if a link was removed.
function unlinkSpecialist(db, childId, specialistId) {
  const result = db
    .prepare('DELETE FROM specialist_links WHERE child_id = ? AND specialist_id = ?')
    .run(childId, specialistId);
  return result.changes > 0;
}

// Children a specialist is linked to right now.
function listLinkedChildren(db, specialistId) {
  return db.prepare(`
    SELECT c.id, c.name, c.birth_date AS birthDate, l.specialist_type AS specialistType
    FROM specialist_links l JOIN children c ON c.id = l.child_id
    WHERE l.specialist_id = ?
    ORDER BY c.name
  `).all(specialistId);
}

function listOwnChildren(db, parentId) {
  return db.prepare(`
    SELECT id, name, birth_date AS birthDate
    FROM children WHERE parent_id = ?
    ORDER BY name
  `).all(parentId);
}

module.exports = {
  findSpecialistByEmail,
  getLinkedSpecialist,
  listLinkedSpecialists,
  linkSpecialist,
  unlinkSpecialist,
  listLinkedChildren,
  listOwnChildren,
};
