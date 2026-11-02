// /api/children/:childId/specialists – parent links, lists and unlinks
// specialists for their own child (M2, assignment Appendix A.6).
const express = require('express');
const { getDb } = require('../db/connection');
const { SPECIALIST_TYPES } = require('../db/schema');
const loadChildAccess = require('../middleware/loadChildAccess');
const requireRole = require('../middleware/requireRole');
const links = require('../services/links');

const router = express.Router({ mergeParams: true });

// Only parents manage links; loadChildAccess then makes sure it is their own child.
router.use(requireRole('parent'), loadChildAccess);

router.get('/', (req, res) => {
  res.json({ specialists: links.listLinkedSpecialists(getDb(), req.child.id) });
});

router.post('/', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const { specialistType } = req.body ?? {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!SPECIALIST_TYPES.includes(specialistType)) {
    return res.status(400).json({
      error: `Specialist type must be one of: ${SPECIALIST_TYPES.join(', ')}`,
    });
  }

  const db = getDb();
  const specialist = links.findSpecialistByEmail(db, email);
  if (!specialist) {
    return res.status(404).json({ error: 'No registered specialist with this email' });
  }

  const linked = links.linkSpecialist(db, req.child.id, specialist.id, specialistType);
  if (!linked) {
    return res.status(409).json({ error: 'This specialist is already linked to the child' });
  }
  return res.status(201).json({ specialist: linked });
});

router.delete('/:specialistId', (req, res) => {
  const specialistId = Number(req.params.specialistId);
  if (!Number.isInteger(specialistId) || specialistId <= 0
    || !links.unlinkSpecialist(getDb(), req.child.id, specialistId)) {
    return res.status(404).json({ error: 'This specialist is not linked to the child' });
  }
  return res.status(204).end();
});

module.exports = router;
