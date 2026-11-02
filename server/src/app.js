const express = require('express');
const authRouter = require('./routes/auth');
const specialistsRouter = require('./routes/specialists');
const meRouter = require('./routes/me');
const authenticate = require('./middleware/authenticate');

const app = express();

app.use(express.json());

// --- Public routes -------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter); // POST /login is public, GET /me authenticates itself

// --- Everything below requires a valid JWT (secure by default) ------------
app.use('/api', authenticate);

app.use('/api/children/:childId/specialists', specialistsRouter);
app.use('/api/me', meRouter);

// Unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Malformed JSON body and other client errors raised by express.json()
  if (err.type === 'entity.parse.failed' || (err.status >= 400 && err.status < 500)) {
    return res.status(err.status || 400).json({ error: 'Invalid request body' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
