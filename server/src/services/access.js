// Who may work with which child (M2-01). Always reads the CURRENT state of the
// database – never trust anything cached in the JWT except the user's id and role.

function findChild(db, childId) {
  return db
    .prepare('SELECT id, parent_id, user_id, name, birth_date FROM children WHERE id = ?')
    .get(childId);
}

function isLinkedSpecialist(db, specialistId, childId) {
  const row = db
    .prepare('SELECT 1 FROM specialist_links WHERE child_id = ? AND specialist_id = ?')
    .get(childId, specialistId);
  return row !== undefined;
}

// user: { id, role } from the authenticated request; child: row from findChild()
function canAccessChild(db, user, child) {
  if (!user || !child) return false;

  switch (user.role) {
    case 'parent':
      return child.parent_id === user.id;
    case 'child':
      return child.user_id === user.id;
    case 'specialist':
      return isLinkedSpecialist(db, user.id, child.id);
    default:
      return false;
  }
}

module.exports = { findChild, isLinkedSpecialist, canAccessChild };
