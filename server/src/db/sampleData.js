// Synthetic demo data only – no real personal data.
// Emails use the reserved .test domain. All demo accounts share DEMO_PASSWORD.
const bcrypt = require('bcryptjs');

const DEMO_PASSWORD = 'Demo1234!';

const USERS = {
  elif: { email: 'elif.parent@demo.test', name: 'Elif Demir', role: 'parent' },
  murat: { email: 'murat.parent@demo.test', name: 'Murat Kaya', role: 'parent' },
  deniz: { email: 'deniz.child@demo.test', name: 'Deniz Demir', role: 'child' },
  ece: { email: 'ece.child@demo.test', name: 'Ece Kaya', role: 'child' },
  selin: { email: 'selin.specialist@demo.test', name: 'Selin Arslan', role: 'specialist' },
  can: { email: 'can.specialist@demo.test', name: 'Can Ozturk', role: 'specialist' },
  zeynep: { email: 'zeynep.specialist@demo.test', name: 'Zeynep Sahin', role: 'specialist' },
};

const CHILDREN = {
  deniz: { parent: 'elif', account: 'deniz', name: 'Deniz Demir', birthDate: '2019-04-12' },
  ece: { parent: 'murat', account: 'ece', name: 'Ece Kaya', birthDate: '2018-09-03' },
};

// zeynep is a registered specialist with no link (for "unlinked → 403" cases).
const LINKS = [
  { child: 'deniz', specialist: 'selin', type: 'special_education_teacher' },
  { child: 'ece', specialist: 'can', type: 'coach' },
];

// week: 0 = current week, -1 = last week, 1 = next week; day: 0 = Monday
const EVENTS = [
  { child: 'deniz', by: 'selin', title: 'Special education session', week: 0, day: 1, start: '10:00', end: '10:45' },
  { child: 'deniz', by: 'elif', title: 'Swimming class', week: 0, day: 3, start: '16:00', end: '17:00' },
  { child: 'deniz', by: 'selin', title: 'Special education session', week: -1, day: 1, start: '10:00', end: '10:45' },
  { child: 'deniz', by: 'elif', title: 'Paediatrician check-up', week: 1, day: 2, start: '09:30', end: '10:00' },
  { child: 'ece', by: 'can', title: 'Movement coaching session', week: 0, day: 2, start: '14:00', end: '14:45' },
  { child: 'ece', by: 'murat', title: 'Art workshop', week: 0, day: 5, start: '11:00', end: '12:30' },
  { child: 'ece', by: 'can', title: 'Movement coaching session', week: 1, day: 2, start: '14:00', end: '14:45' },
];

// The first task is the walking-skeleton task checked by the E2E smoke test.
const TASKS = [
  { child: 'deniz', by: 'elif', title: 'Read a picture book for 15 minutes', description: 'Pick any picture book and talk about the pictures.', area: 'language', week: 0, day: 4, status: 'pending' },
  { child: 'deniz', by: 'selin', title: 'Practise the /r/ sound with 10 picture cards', area: 'language', week: 0, day: 2, status: 'done' },
  { child: 'deniz', by: 'elif', title: 'Build a tower with 10 blocks', area: 'motor', week: -1, day: 4, status: 'done' },
  { child: 'deniz', by: 'elif', title: 'Say thank you after meals', area: 'social_emotional', week: 1, day: 4, status: 'pending' },
  { child: 'ece', by: 'can', title: 'Balance on one foot for 10 seconds', area: 'motor', week: 0, day: 3, status: 'pending' },
  { child: 'ece', by: 'murat', title: 'Sort toys by colour', area: 'cognitive', week: -1, day: 3, status: 'done' },
  { child: 'ece', by: 'murat', title: 'Brush teeth without help', area: 'self_care', week: 0, day: 6, status: 'pending' },
];

const OBSERVATIONS = [
  { child: 'deniz', by: 'selin', area: 'language', week: -1, day: 1, content: 'Produced /r/ correctly in 4 of 10 words at the start of words.', edited: false },
  { child: 'deniz', by: 'selin', area: 'language', week: 0, day: 1, content: 'Produced /r/ correctly in 6 of 10 words; more confident than last week.', edited: true },
  { child: 'ece', by: 'can', area: 'motor', week: 0, day: 2, content: 'Balanced on the left foot for 6 seconds, right foot for 4 seconds.', edited: false },
];

// Monday of the current week (local time) shifted by whole weeks and days.
function dayOf(week, day, now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setDate(monday.getDate() + week * 7 + day);
  return monday;
}

function isoDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Inserts the full demo data set and returns the generated ids by key,
// e.g. { users: { elif: 1, ... }, children: { deniz: 1, ... } }.
function insertDemoData(db, { now = new Date() } = {}) {
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const ids = { users: {}, children: {} };

  const insertAll = db.transaction(() => {
    const insertUser = db.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
    );
    for (const [key, u] of Object.entries(USERS)) {
      ids.users[key] = Number(insertUser.run(u.email, passwordHash, u.name, u.role).lastInsertRowid);
    }

    const insertChild = db.prepare(
      'INSERT INTO children (parent_id, user_id, name, birth_date) VALUES (?, ?, ?, ?)',
    );
    for (const [key, c] of Object.entries(CHILDREN)) {
      ids.children[key] = Number(
        insertChild.run(ids.users[c.parent], ids.users[c.account], c.name, c.birthDate).lastInsertRowid,
      );
    }

    const insertLink = db.prepare(
      'INSERT INTO specialist_links (child_id, specialist_id, specialist_type) VALUES (?, ?, ?)',
    );
    for (const l of LINKS) {
      insertLink.run(ids.children[l.child], ids.users[l.specialist], l.type);
    }

    const insertEvent = db.prepare(
      'INSERT INTO events (child_id, created_by, title, start_at, end_at) VALUES (?, ?, ?, ?, ?)',
    );
    for (const e of EVENTS) {
      const date = isoDate(dayOf(e.week, e.day, now));
      insertEvent.run(ids.children[e.child], ids.users[e.by], e.title, `${date}T${e.start}`, `${date}T${e.end}`);
    }

    const insertTask = db.prepare(
      `INSERT INTO tasks (child_id, assigned_by, title, description, development_area, due_date, status, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const t of TASKS) {
      const due = isoDate(dayOf(t.week, t.day, now));
      insertTask.run(
        ids.children[t.child], ids.users[t.by], t.title, t.description ?? null, t.area, due, t.status,
        t.status === 'done' ? `${due} 18:00:00` : null,
      );
    }

    const insertObservation = db.prepare(
      `INSERT INTO observations (child_id, specialist_id, development_area, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const o of OBSERVATIONS) {
      const created = `${isoDate(dayOf(o.week, o.day, now))} 12:00:00`;
      const updated = o.edited ? `${isoDate(dayOf(o.week, o.day, now))} 15:30:00` : null;
      insertObservation.run(ids.children[o.child], ids.users[o.by], o.area, o.content, created, updated);
    }
  });

  insertAll();
  return ids;
}

module.exports = {
  DEMO_PASSWORD,
  USERS,
  CHILDREN,
  LINKS,
  EVENTS,
  TASKS,
  OBSERVATIONS,
  insertDemoData,
};
