// Test-only stand-in for the `authenticate` middleware (S2G1-20):
// wraps the real app and sets req.user from the X-Test-User header.
// Once login + JWT exist, tests can switch to real tokens.
const express = require('express');
const request = require('supertest');
const app = require('../../src/app');

const testApp = express();
testApp.use((req, res, next) => {
  const header = req.get('X-Test-User');
  if (header) req.user = JSON.parse(header);
  next();
});
testApp.use(app);

// asUser({ id, role }).get('/api/...')  – or asUser(null) for no user
function asUser(user) {
  const agent = request(testApp);
  const withUser = (req) => (user ? req.set('X-Test-User', JSON.stringify(user)) : req);
  return {
    get: (url) => withUser(agent.get(url)),
    post: (url) => withUser(agent.post(url)),
    patch: (url) => withUser(agent.patch(url)),
    delete: (url) => withUser(agent.delete(url)),
  };
}

module.exports = { asUser };
