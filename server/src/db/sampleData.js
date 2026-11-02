// Synthetic sample data only – no real personal data.
const SAMPLE_TASKS = [
  {
    title: 'Read a picture book for 15 minutes',
    description: 'Sample task for the walking skeleton.',
  },
];

function insertSampleTasks(db) {
  const insert = db.prepare('INSERT INTO tasks (title, description) VALUES (@title, @description)');
  for (const task of SAMPLE_TASKS) {
    insert.run(task);
  }
}

module.exports = { SAMPLE_TASKS, insertSampleTasks };
