// Resets the database and fills it with synthetic data only.
const fs = require('fs');
const { getDb, closeDb, resolveDbPath } = require('./connection');
const { insertDemoData, DEMO_PASSWORD, USERS } = require('./sampleData');

function seed() {
  const dbPath = resolveDbPath();
  if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
    fs.rmSync(dbPath);
  }

  insertDemoData(getDb());

  closeDb();
  console.log(`Database reset: ${dbPath}`);
  console.log(`Demo accounts (password: ${DEMO_PASSWORD}):`);
  for (const u of Object.values(USERS)) {
    console.log(`  ${u.role.padEnd(10)} ${u.email}`);
  }
}

seed();
