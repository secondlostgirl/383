const express = require('express');
const tasksRouter = require('./routes/tasks');
const specialistsRouter = require('./routes/specialists');
const meRouter = require('./routes/me');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', tasksRouter);

// Protected routes below. `authenticate` (S2G1-20) must run before them and
// set req.user = { id, role }; without it they answer 401.
app.use('/api/children/:childId/specialists', specialistsRouter);
app.use('/api/me', meRouter);

// Unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
