// /api/auth – email + password login (M1). The role comes from the account;
// the user never chooses it.
const express = require('express');
const { getDb } = require('../db/connection');
const { verifyCredentials, signToken } = require('../services/auth');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/login', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = verifyCredentials(getDb(), email, password);
  if (!user) {
    // Same message for unknown email and wrong password
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json({ token: signToken(user), user });
});

// The signed-in user; the client calls this on start-up to restore a session.
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
