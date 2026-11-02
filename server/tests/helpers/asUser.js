// Sends requests to the real app as a given user, with a real JWT, so every
// test goes through the same `authenticate` middleware as production.
const request = require('supertest');
const app = require('../../src/app');
const { signToken } = require('../../src/services/auth');

// asUser({ id, role }).get('/api/...')  – or asUser(null) for an anonymous request
function asUser(user) {
  const agent = request(app);
  const token = user ? signToken(user) : null;
  const withAuth = (req) => (token ? req.set('Authorization', `Bearer ${token}`) : req);
  return {
    get: (url) => withAuth(agent.get(url)),
    post: (url) => withAuth(agent.post(url)),
    patch: (url) => withAuth(agent.patch(url)),
    delete: (url) => withAuth(agent.delete(url)),
  };
}

module.exports = { asUser };
