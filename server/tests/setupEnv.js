// Runs before every test file (jest "setupFiles").
// Tests never need a real secret; CI does not have to provide one.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-jwt-secret';
process.env.AI_MODE = 'mock';
