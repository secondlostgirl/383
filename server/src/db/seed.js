// Resets the database and fills it with synthetic data only.
const fs = require('fs');
const { getDb, closeDb, resolveDbPath } = require('./connection');
const { insertSampleTasks } = require('./sampleData');

function seed() {
  const dbPath = resolveDbPath();
  if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
    fs.rmSync(dbPath);
  }

  const db = getDb();
  // More seed data is added per module (M1-05).
  insertSampleTasks(db);

  closeDb();
  console.log(`Database reset: ${dbPath}`);
}

seed();
