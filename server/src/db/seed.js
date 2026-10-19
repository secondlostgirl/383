// Resets the database and fills it with synthetic data only.
const fs = require('fs');
const { getDb, closeDb, resolveDbPath } = require('./connection');

function seed() {
  const dbPath = resolveDbPath();
  if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
    fs.rmSync(dbPath);
  }

  getDb();
  // Seed data is added per module (M4-01, M1-05).

  closeDb();
  console.log(`Database reset: ${dbPath}`);
}

seed();
