# AGENTS.md – SENG 383 Term Project (AI-Assisted Child Development Platform)

Instructions for any AI coding agent (Warp, Claude, etc.) working in this repository.
**Always reply to the user in Turkish.** Code, comments, commit messages and docs are in English.

## 1. What we are building

A web-based decision support platform where parents, specialists and children share one weekly
schedule, task list and record of observations. An AI component summarizes records per role.
**The AI supports decisions; it never makes them** – no diagnosis, no treatment suggestions.

Roles (the role comes from the account; the user never picks it):
- **Parent** – owns the child's data, sees all records, links/unlinks specialists by email.
- **Specialist** – works only with children they are *currently* linked to.
- **Child** – sees only own tasks and schedule. Never sees observations, documents or AI summaries.

Required modules: M1 Login & roles · M2 Linking · M3 Weekly schedule · M4 Tasks ·
M5 Specialist entries · M6 Documents · M7 Weekly statistics · M8 Role-based AI summary.
v0.1 = M1–M4 (Week 8), v0.2 = M1–M8 (Week 10), v1.0 (Week 12).
Out of scope: Docker, cloud deployment, admin panel, mobile, email invitations, microservices.

## 2. Fixed stack (do not change)

- Frontend: React (Vite), React Router — `client/`
- Backend: Node.js + Express, SQLite (better-sqlite3), JWT, bcrypt — `server/`
- Tests: Jest + Supertest (server), Vitest + Testing Library (client), Playwright (`e2e/`)
- CI: GitHub Actions · Tracking: Jira
- AI: one backend module `server/src/ai/` with `AI_MODE=mock|live`. Tests and CI ALWAYS use mock.

## 3. Repository layout

```
client/            React app (src/pages, src/components, src/api, src/auth)
server/            Express app (src/app.js exports app; src/index.js listens)
  src/routes/      one router per module
  src/middleware/  authenticate, requireRole, loadChildAccess
  src/services/    business logic (access, stats, ai)
  src/db/          schema, connection, seed
  tests/           Jest + Supertest
e2e/               Playwright tests
docs/              SRS.md, SDD.md, PMP.md, BACKLOG.md, img/, meetings/
.github/workflows/ CI
```
If the course "Term Project – Student Guide" defines a different structure, file names or
standard commands, the guide wins – ask the user before deviating.

## 4. Non-negotiable rules

1. **Access control lives in the backend.** Every `/api/children/:childId/*` route uses
   `loadChildAccess`, which checks the specialist–child link in the DB *on every request*
   (a valid JWT is not enough). Hiding a button is not access control.
2. **Child restrictions**: child gets 403 on observations, documents, AI summaries, stats.
3. **AI safety**: the backend sends the model only records the reader may see; prompts are separate
   for parent and specialist; output is labelled "AI-generated" and returned with source record IDs;
   the app works when AI is down.
4. **Secrets**: API keys and JWT_SECRET only in `.env` (gitignored). Never in client code, never committed.
   Keep `.env.example` updated with names only.
5. **Data**: synthetic data only, created by `npm run seed`. No real personal data.
6. **Requirement IDs** (FR-M1-01 …) in docs/SRS.md are frozen – never renumber. Reference them in tests
   (`describe('FR-M4-02 ...')`).
7. Statistics are exact code calculations, never computed by the AI.

## 5. Workflow for a backlog task

The user will say e.g. **"M4-03'ü yap, Jira key TEAM7-45"**.

1. Read the task in `docs/BACKLOG.md` (title + definition of done) and the related parts of
   `docs/SRS.md` / `docs/SDD.md`. If the Jira key is missing, ask for it.
2. `git checkout main && git pull`, then create branch `<JIRA-KEY>-short-slug`
   (e.g. `TEAM7-45-tasks-api`).
3. Implement the smallest change that satisfies the definition of done. Feature owners do
   screen + API + data + tests together.
4. Write/extend tests (unit / API / component; E2E when the task says so). Run them:
   `npm test` (and `npm run test:e2e` if E2E touched). All must pass; never delete or skip a test to go green.
5. Commit with the key first: `TEAM7-45 Add tasks create/list API`. Small, meaningful commits.
6. Push and open a PR (`gh pr create`) titled `<JIRA-KEY> <title>`, body lists the done-criteria as a checklist
   and the FR IDs covered. Do not merge – a teammate reviews.
7. In `docs/BACKLOG.md` fill the Jira key and tick `[x]` only after merge (the user will confirm).
8. Finish by telling the user (in Turkish): what changed, how to test it manually, and that they should move
   the Jira task to In Progress/Done.

Documentation tasks (SRS/SDD/PMP/meeting notes) follow the same branch → PR flow. Remove template
guidance lines (`>`) when a section is filled. Diagrams in Mermaid.

## 6. Standard commands (keep README in sync)

```
npm install            # root, installs client + server (workspaces)
npm run seed           # reset DB with synthetic data
npm run dev            # backend + frontend
npm test               # server + client tests
npm run test:e2e       # Playwright (AI_MODE=mock)
npm run coverage       # coverage report (branch threshold: 40% → 60%)
```

## 7. Definition of Done (every code task)

- Done-criteria of the backlog item met · tests added and green locally and in CI
- Access rules covered by at least one negative test (wrong role / unlinked / child)
- No secrets, no real data, no console errors · README updated if setup changed
- PR open with Jira key, reviewed by a teammate before merge
