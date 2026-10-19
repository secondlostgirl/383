const app = require('./app');
const { getDb } = require('./db/connection');

const PORT = process.env.PORT || 3001;

getDb();

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
