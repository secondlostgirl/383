const app = require('./app');
const { getDb } = require('./db/connection');
const { getJwtSecret } = require('./services/auth');

const PORT = process.env.PORT || 3001;

// Fail fast with a clear message instead of failing on the first login
try {
  getJwtSecret();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

getDb();

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
