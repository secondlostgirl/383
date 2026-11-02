const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('needs no authentication', async () => {
    const res = await request(app).get('/api/health').set('Authorization', 'Bearer not-a-token');
    expect(res.status).toBe(200);
  });

  it('answers 401 (not 404) to anonymous requests for unknown API routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(401);
  });
});
