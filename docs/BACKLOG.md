# SENG 383 – Project Backlog

> Source of truth for all tasks. Each row = one Jira task. Fill the **Jira key** column after importing to Jira.
> Mark `[x]` only when the work is **merged into main** (same rule as Jira Done).

## Owners

| Code | Name | Main modules |
|---|---|---|
| A | _(fill in)_ | M1 Login & roles, M2 Linking, M7 Statistics |
| B | _(fill in)_ | M3 Schedule, M4 Tasks, M6 Documents |
| C | _(fill in)_ | M5 Specialist entries, M8 AI summary, CI / E2E / coverage |

Documentation tasks are spread evenly so every member has commits every week.

## Sprints

| Sprint | Weeks | Goal | Ends with |
|---|---|---|---|
| Sprint 1 | Weeks 3–5 | Team, Jira, SRS draft, PMP-1/2, walking skeleton | v0.0 (Week 5) |
| Sprint 2 | Weeks 6–8 | Final SRS + SDD, M1–M4 working end to end, first E2E in CI | v0.1 (Week 8) |
| Sprint 3 | Weeks 9–10 | M5–M8, 3 critical-flow E2E tests, coverage ≥ 40% | v0.2 (Week 10) |
| Sprint 4 | Weeks 11–13 | Bug fixes, E2E per module, coverage ≥ 60%, final report and demo | v1.0 (Week 12) |

## Epic summary

| Epic | Name | Tasks | Sprints |
|---|---|---|---|
| PMP-1 | Project, Jira setup, team and roles | 9 | S1 |
| PMP-2 | Work packages (epics) and sprint plan | 4 | S1, S2 |
| PMP-3 | Progress review: mid-term (v0.1) | 3 | S2 |
| PMP-4 | Progress review: v0.2 | 6 | S3 |
| PMP-5 | Progress review: final (v1.0) | 6 | S4 |
| PMP-6 | Retrospective | 9 | S4 |
| SRS | Software Requirements Specification (docs/SRS.md) | 8 | S1, S2, S3 |
| DESIGN | Software Design Document (docs/SDD.md) | 6 | S2 |
| M1 | Login and roles | 15 | S1, S2, S3, S4 |
| M2 | Linking specialists | 7 | S2, S3 |
| M3 | Weekly schedule | 9 | S2, S4 |
| M4 | Tasks | 13 | S1, S2, S4 |
| M5 | Specialist entries | 6 | S3, S4 |
| M6 | Documents | 6 | S3, S4 |
| M7 | Weekly statistics | 6 | S3, S4 |
| M8 | Role-based AI summary | 10 | S2, S3, S4 |

**Total tasks:** 123

---

## Sprint 1 (Weeks 3–5)

**Goal:** Team, Jira, SRS draft, PMP-1/2, walking skeleton  
**Ends with:** v0.0 (Week 5)

### Week 3

- [ ] **PMP1-01** · Create team GitHub repository and protect main  
  Epic: `PMP-1` · Owner: **A** · Jira key: `____`  
  - Repository created, all 3 developers added as collaborators, test team invited (read/triage)
  - Branch protection on main: PR required, ≥1 approving review, status checks required once CI exists
  - Repo layout created: client/, server/, e2e/, docs/, docs/img/, docs/meetings/

- [ ] **PMP1-02** · Add docs templates, README skeleton, AGENTS.md, .gitignore, .env.example  
  Epic: `PMP-1` · Owner: **B** · Jira key: `____`  
  - docs/PMP.md, docs/SRS.md, docs/SDD.md copied from the course templates
  - AGENTS.md and docs/BACKLOG.md committed at repo root / docs
  - .gitignore covers node_modules, .env, *.sqlite, server/uploads/, coverage/, playwright-report/
  - .env.example lists JWT_SECRET, AI_MODE, AI_PROVIDER, AI_API_KEY, PORT, DB_PATH (no real values)

- [ ] **PMP1-03** · Set up Jira Scrum project, invite members, create epics, import backlog  
  Epic: `PMP-1` · Owner: **A** · Jira key: `____`  
  - Jira Cloud site created with university email, Scrum template, short key (e.g. TEAM7)
  - All members invited; 16 epics exist with the exact names (PMP-1…PMP-6, M1…M8, SRS, DESIGN)
  - Backlog imported from jira_import.csv; each task has exactly one assignee

- [ ] **PMP1-04** · Connect GitHub for Jira and verify commit linking  
  Epic: `PMP-1` · Owner: **A** · Jira key: `____`  
  - GitHub for Jira app installed and repo linked
  - A test commit with the issue key appears under the Jira task

- [ ] **PMP1-05** · Submit Team Information Form to WebOnline  
  Epic: `PMP-1` · Owner: **A** · Jira key: `____`  
  - Individual and team repository links and Jira board link submitted before the Week 3 deadline

- [ ] **PMP1-06** · Choose AI provider (Gemini API or GitHub Models) and record decision  
  Epic: `PMP-1` · Owner: **C** · Jira key: `____`  
  - Decision + reason recorded in docs/SDD.md (tech stack) and in Week 3 meeting notes
  - Free-tier API key obtained by one member, stored only in local .env

- [ ] **PMP1-07** · Test-team meeting notes – Week 3  
  Epic: `PMP-1` · Owner: **A** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 3
  - Notes committed as docs/meetings/week-03.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

### Week 4

- [ ] **PMP1-08** · Write PMP-1: project, Jira setup, team and roles  
  Epic: `PMP-1` · Owner: **A** · Jira key: `____`  
  - Project-in-one-sentence, Jira key and board link filled
  - Team table lists 3 developers + test team members with Jira/GitHub usernames and roles
  - 'Required by' column aligned with the assignment calendar (assignment overrides the template)
  - Merged to main; PMP-1 epic marked Done

- [ ] **PMP1-09** · Test-team meeting notes – Week 4  
  Epic: `PMP-1` · Owner: **B** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 4
  - Notes committed as docs/meetings/week-04.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

- [ ] **SRS-01** · SRS §1: purpose of the system and user types  
  Epic: `SRS` · Owner: **B** · Jira key: `____`  
  - 2–3 sentence purpose; user table for Parent, Specialist, Child with their access limits

- [ ] **SRS-02** · SRS §2 draft: functional requirements for M1, M2, M7  
  Epic: `SRS` · Owner: **A** · Jira key: `____`  
  - 'The system shall…' requirements with IDs FR-M1-xx, FR-M2-xx, FR-M7-xx and Must/Should/Could priority
  - Every requirement is testable and matches the assignment acceptance level

- [ ] **SRS-03** · SRS §2 draft: functional requirements for M3, M4, M6  
  Epic: `SRS` · Owner: **B** · Jira key: `____`  
  - IDs FR-M3-xx, FR-M4-xx, FR-M6-xx with priorities; testable wording

- [ ] **SRS-04** · SRS §2 draft: functional requirements for M5, M8  
  Epic: `SRS` · Owner: **C** · Jira key: `____`  
  - IDs FR-M5-xx, FR-M8-xx; AI safety rules (no diagnosis/treatment, AI-generated label, source records, only permitted data) stated as requirements

- [ ] **SRS-05** · SRS §3: non-functional requirements  
  Epic: `SRS` · Owner: **C** · Jira key: `____`  
  - 3–5 measurable NFRs (e.g. bcrypt password hashing, API response < 500 ms on seed data, every child route checks the current link, app runs from README in < 10 min)

- [ ] **SRS-06** · SRS §4 draft: 3 critical flows with Given/When/Then  
  Epic: `SRS` · Owner: **A** · Jira key: `____`  
  - Flow 1: specialist assigns task → child completes → specialist sees status
  - Flow 2: parent unlinks specialist → specialist is refused every child request
  - Flow 3: parent opens weekly AI summary → sees AI-generated label and source records

- [ ] **M1-01** · Scaffold backend: Express + SQLite + npm scripts  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - server/ with Express app split into app.js (exported for Supertest) and index.js (listen)
  - SQLite via better-sqlite3, DB_PATH from env; GET /api/health returns {status:'ok'}
  - Scripts: dev, start, test, seed, lint

### Week 5

- [ ] **M1-02** · Scaffold frontend: React (Vite) + router + API client  
  Epic: `M1` · Owner: **B** · Jira key: `____`  
  - client/ created with Vite React template, React Router, src/api/client.js with base URL and auth header
  - Vite dev proxy /api → backend port; scripts: dev, build, test, lint

- [ ] **M1-03** · Set up test tooling: Jest + Supertest, Vitest, Playwright  
  Epic: `M1` · Owner: **C** · Jira key: `____`  
  - server: Jest + Supertest, one passing health test; client: Vitest + Testing Library, one passing test
  - e2e/: Playwright config (Chromium); one smoke test opening the app
  - Root scripts: npm test runs server + client tests

- [ ] **M1-04** · GitHub Actions CI: install, lint, unit/API tests on every PR  
  Epic: `M1` · Owner: **C** · Jira key: `____`  
  - .github/workflows/ci.yml runs on push to main and on PRs; Node LTS; caches npm
  - Runs server and client tests with AI_MODE=mock; CI marked as a required check on main

- [ ] **M4-01** · Walking skeleton: task from SQLite shown in the browser  
  Epic: `M4` · Owner: **B** · Jira key: `____`  
  - Seed inserts one sample task; GET /api/tasks returns it; React page lists it
  - Shown end to end on a clean clone

- [ ] **M4-02** · README v0.0 and tag v0.0  
  Epic: `M4` · Owner: **C** · Jira key: `____`  
  - README: prerequisites (Node version), install, copy .env.example, seed, run backend + frontend, run tests
  - Verified on a fresh clone by a second member; tag v0.0 pushed

- [ ] **PMP2-01** · Create sprints in Jira and plan Sprint 2  
  Epic: `PMP-2` · Owner: **B** · Jira key: `____`  
  - Sprints 1–4 created matching the weekly schedule; Sprint 2 tasks moved in and assigned

- [ ] **PMP2-02** · Write PMP-2: work packages table and sprint plan  
  Epic: `PMP-2` · Owner: **B** · Jira key: `____`  
  - One row per epic with owner, number of tasks (from Jira) and planned sprint(s)
  - Sprint table with weeks, goals, ending release; matches Jira exactly
  - Merged; PMP-2 epic marked Done

- [ ] **PMP2-03** · Test-team meeting notes – Week 5  
  Epic: `PMP-2` · Owner: **C** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 5
  - Notes committed as docs/meetings/week-05.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

---

## Sprint 2 (Weeks 6–8)

**Goal:** Final SRS + SDD, M1–M4 working end to end, first E2E in CI  
**Ends with:** v0.1 (Week 8)

### Week 6

- [ ] **SRS-07** · Finalize SRS (final version, Week 6)  
  Epic: `SRS` · Owner: **B** · Jira key: `____`  
  - All FR IDs frozen, priorities set, acceptance criteria final, optional use-case diagram (Mermaid)
  - Version checkbox = Final, change log updated, guidance lines (>) removed

- [ ] **SDD-01** · SDD §1: architecture overview and technology stack  
  Epic: `DESIGN` · Owner: **C** · Jira key: `____`  
  - Mermaid diagram: React → Express REST API → SQLite, backend → AI provider (mock/live)
  - Tech stack table filled (React/Vite, Express, SQLite, JWT, Jest/Supertest/Vitest/Playwright, GitHub Actions, chosen AI provider)

- [ ] **SDD-02** · SDD §2: module design table (M1–M8 components → FR IDs)  
  Epic: `DESIGN` · Owner: **A** · Jira key: `____`  
  - For each module: pages, routes, services, middleware; requirement IDs referenced

- [ ] **SDD-03** · SDD §3: data model (ER diagram)  
  Epic: `DESIGN` · Owner: **A** · Jira key: `____`  
  - Mermaid ER: users, children, specialist_links, events, tasks, observations, documents, ai_summaries (+ source links)
  - Keys and main fields listed; development area enum defined

- [ ] **SDD-04** · SDD §4: REST API endpoint table  
  Epic: `DESIGN` · Owner: **B** · Jira key: `____`  
  - Method, endpoint, description, module, allowed roles for every endpoint of M1–M8

- [ ] **SDD-05** · SDD §5: sequence diagrams for the 3 critical flows  
  Epic: `DESIGN` · Owner: **C** · Jira key: `____`  
  - One Mermaid sequenceDiagram per SRS flow, including the access-control check step

- [ ] **SDD-06** · SDD §6: UI wireframes for main screens  
  Epic: `DESIGN` · Owner: **B** · Jira key: `____`  
  - Wireframes/screenshots in docs/img/ for login, parent dashboard, child tasks, specialist profile, linked specialists, documents

- [ ] **PMP2-04** · Test-team meeting notes – Week 6  
  Epic: `PMP-2` · Owner: **A** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 6
  - Notes committed as docs/meetings/week-06.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

- [ ] **M1-05** · Full database schema and synthetic seed script  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - All tables from SDD §3 created idempotently on startup/migrate
  - Seed: 1–2 parents, 2 children, 3 specialists (2 linked, 1 unlinked), events, tasks across areas and weeks, observations; documented demo accounts
  - Only synthetic data; npm run seed resets the DB

- [ ] **M1-06** · Auth API: login with bcrypt + JWT, /me, auth middleware  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - POST /api/auth/login returns JWT (id, role, expiry; no sensitive data) on valid credentials, 401 otherwise
  - GET /api/auth/me; authenticate middleware rejects missing/invalid/expired token with 401
  - JWT_SECRET from env

- [ ] **M1-07** · Role middleware requireRole(...)  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - Returns 403 for wrong role; used on all role-specific routes

- [ ] **M2-01** · Access-control service: canAccessChild checks the current link in DB  
  Epic: `M2` · Owner: **A** · Jira key: `____`  
  - Parent → own child; specialist → only if a link row exists NOW; child → only self
  - Middleware loadChildAccess applied to every /api/children/:childId/* route; 403 otherwise
  - Unit tests for all role/link combinations

- [ ] **M3-01** · Week utilities (week start/end, ISO week) with unit tests  
  Epic: `M3` · Owner: **B** · Jira key: `____`  
  - Shared helper used by M3 and M7; tests for week boundaries and year change

- [ ] **M3-02** · Events API: create and list by week  
  Epic: `M3` · Owner: **B** · Jira key: `____`  
  - POST /api/children/:id/events (parent or linked specialist), validation of title/start/end
  - GET /api/children/:id/events?week=YYYY-MM-DD returns that week's events; child may read own events

- [ ] **M4-03** · Tasks API: create, list, mark done, assigned-by-me  
  Epic: `M4` · Owner: **B** · Jira key: `____`  
  - POST /api/children/:id/tasks {title, description, developmentArea, dueDate} by parent/linked specialist
  - GET /api/children/:id/tasks; PATCH /api/tasks/:id/status – only the child the task belongs to can mark done
  - GET /api/tasks/assigned-by-me returns tasks with status

### Week 7

- [ ] **M1-08** · Login page, auth context, logout  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - Email + password form with validation and error message; token stored and attached to requests
  - Role comes from the account (no role picker); logout clears token

- [ ] **M1-09** · Role-based routing and route guards  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - Parent, Specialist and Child each land on their own home screen; other roles' routes redirect
  - 401 from API logs the user out

- [ ] **M1-10** · Tests for M1  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - API: login success/fail, protected route 401, wrong role 403; Vitest: login form renders and shows errors

- [ ] **M2-02** · Link API: link, list, unlink specialists  
  Epic: `M2` · Owner: **A** · Jira key: `____`  
  - POST /api/children/:id/specialists {email, specialistType} (parent only); 404 for unregistered email, 409 if already linked
  - GET list of linked specialists; DELETE unlink

- [ ] **M2-03** · Specialist API: list my linked children  
  Epic: `M2` · Owner: **A** · Jira key: `____`  
  - GET /api/me/children returns only currently linked children

- [ ] **M2-04** · Parent 'Linked specialists' page  
  Epic: `M2` · Owner: **A** · Jira key: `____`  
  - Link by email + type, list, unlink with confirmation dialog, clear error for unregistered email

- [ ] **M3-03** · Weekly schedule view component  
  Epic: `M3` · Owner: **B** · Jira key: `____`  
  - 7-day view, previous/next week navigation, events sorted by time, empty state

- [ ] **M3-04** · Add event form (parent and linked specialist)  
  Epic: `M3` · Owner: **B** · Jira key: `____`  
  - Form with validation; new event appears in the weekly view without reload

- [ ] **M4-04** · Task assignment form  
  Epic: `M4` · Owner: **B** · Jira key: `____`  
  - Title, description, development area (select), due date; validation and success/error feedback

- [ ] **M4-05** · Child 'My tasks' page with mark as done  
  Epic: `M4` · Owner: **B** · Jira key: `____`  
  - Child sees only own tasks; button marks done; status updates immediately

- [ ] **M1-11** · Playwright E2E setup in CI  
  Epic: `M1` · Owner: **C** · Jira key: `____`  
  - Playwright webServer starts backend (fresh seeded test DB, AI_MODE=mock) and frontend
  - CI job runs E2E and uploads the report on failure

- [ ] **PMP3-01** · Write PMP-3: mid-term progress review (v0.1)  
  Epic: `PMP-3` · Owner: **C** · Jira key: `____`  
  - Jira board screenshot in docs/img/, epic status table, plan changes; merged and PMP-3 epic Done (update after v0.1 if needed)

- [ ] **PMP3-02** · Test-team meeting notes – Week 7  
  Epic: `PMP-3` · Owner: **B** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 7
  - Notes committed as docs/meetings/week-07.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

### Week 8

- [ ] **M2-05** · Specialist 'My children' page and child profile shell  
  Epic: `M2` · Owner: **A** · Jira key: `____`  
  - Lists linked children; opens child profile with entry points for tasks, observations, documents, AI summary

- [ ] **M2-06** · Tests for M2 (access enforced in the API)  
  Epic: `M2` · Owner: **A** · Jira key: `____`  
  - Unlinked specialist gets 403 on every child endpoint (events, tasks, observations, documents, stats, AI) – even with a valid JWT
  - Link/unlink/unregistered-email cases covered

- [ ] **M3-05** · Child view: upcoming events  
  Epic: `M3` · Owner: **B** · Jira key: `____`  
  - Child home shows own upcoming events, read-only

- [ ] **M3-06** · Tests for M3  
  Epic: `M3` · Owner: **B** · Jira key: `____`  
  - API: create/list, week filter, unlinked 403; Vitest: weekly view renders events in the right day

- [ ] **M4-06** · Assigner task tracking list  
  Epic: `M4` · Owner: **B** · Jira key: `____`  
  - Parent/specialist sees tasks they assigned with status (pending/done) and due date

- [ ] **M4-07** · Tests for M4  
  Epic: `M4` · Owner: **B** · Jira key: `____`  
  - API: create, child marks done, other user cannot mark done, unlinked 403; Vitest: task list and form

- [ ] **M8-01** · AI service module skeleton with mandatory mock mode  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - server/src/ai/: single entry generateSummary(); AI_MODE=mock returns a fixed deterministic answer; live adapter for the chosen provider
  - API key read only from env on the backend; never sent to the client; tests and CI always use mock

- [ ] **M4-08** · E2E Flow 1: specialist assigns task → child completes → specialist sees done  
  Epic: `M4` · Owner: **C** · Jira key: `____`  
  - Runs green locally and in CI

- [ ] **M4-09** · Release v0.1 (M1–M4)  
  Epic: `M4` · Owner: **C** · Jira key: `____`  
  - All M1–M4 tasks merged, CI green, README verified on clean clone, tag v0.1 + GitHub release notes

- [ ] **M4-10** · Mid-term demo script and checkpoint preparation  
  Epic: `M4` · Owner: **B** · Jira key: `____`  
  - Step-by-step demo using seed accounts covering M1–M4; rehearsed once by the team

- [ ] **PMP3-03** · Test-team meeting notes – Week 8  
  Epic: `PMP-3` · Owner: **C** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 8
  - Notes committed as docs/meetings/week-08.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

---

## Sprint 3 (Weeks 9–10)

**Goal:** M5–M8, 3 critical-flow E2E tests, coverage ≥ 40%  
**Ends with:** v0.2 (Week 10)

### Week 9

- [ ] **PMP4-01** · Write PMP-4: progress review (v0.2)  
  Epic: `PMP-4` · Owner: **A** · Jira key: `____`  
  - Board screenshot, epic status table, plan changes; merged, PMP-4 epic Done

- [ ] **PMP4-02** · Mid-term peer review – Developer A  
  Epic: `PMP-4` · Owner: **A** · Jira key: `____`  
  - Peer review form submitted as instructed by the course

- [ ] **PMP4-03** · Mid-term peer review – Developer B  
  Epic: `PMP-4` · Owner: **B** · Jira key: `____`  
  - Peer review form submitted as instructed by the course

- [ ] **PMP4-04** · Mid-term peer review – Developer C  
  Epic: `PMP-4` · Owner: **C** · Jira key: `____`  
  - Peer review form submitted as instructed by the course

- [ ] **PMP4-05** · Test-team meeting notes – Week 9  
  Epic: `PMP-4` · Owner: **A** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 9
  - Notes committed as docs/meetings/week-09.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

- [ ] **M5-01** · Observations API: create, list, edit with 'edited' flag  
  Epic: `M5` · Owner: **C** · Jira key: `____`  
  - POST/GET /api/children/:id/observations (linked specialist creates; parent and linked specialists read)
  - PATCH by author only sets edited=true and updated_at; entries are dated
  - Child gets 403 on all observation endpoints

- [ ] **M5-02** · Observation entry form and list on specialist child profile  
  Epic: `M5` · Owner: **C** · Jira key: `____`  
  - Dated entry form, list with author/date, 'edited' badge, edit own entries

- [ ] **M6-01** · Document upload API (PDF/JPEG/PNG)  
  Epic: `M6` · Owner: **B** · Jira key: `____`  
  - multer upload with MIME + extension check and size limit; stored in server/uploads (gitignored); metadata row (name, type, uploader, date)
  - Parent and linked specialists may upload; child 403

- [ ] **M6-02** · Document list and download API  
  Epic: `M6` · Owner: **B** · Jira key: `____`  
  - GET list and GET /api/documents/:id/download with access check (no direct static serving of uploads)

- [ ] **M7-01** · Completion-rate calculation (pure function) with unit tests  
  Epic: `M7` · Owner: **A** · Jira key: `____`  
  - Total and per-development-area rate for a week; 3 of 5 done → 60%; 0 tasks → handled without division by zero

- [ ] **M7-02** · Statistics API  
  Epic: `M7` · Owner: **A** · Jira key: `____`  
  - GET /api/children/:id/stats?week= returns total and by-area rates; access checked

- [ ] **M8-02** · Record collector: only records the reader may see for the week  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - Collects tasks + status, events and observations for the week, filtered by the reader's access
  - Unit test proves restricted/other-child records are never included

- [ ] **M8-03** · Role-specific prompts (parent and specialist) with safety rules  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - Separate prompt templates; instruct: use only given records, say when information is missing, no diagnosis or treatment, plain language for parent

### Week 10

- [ ] **PMP4-06** · Test-team meeting notes – Week 10  
  Epic: `PMP-4` · Owner: **B** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 10
  - Notes committed as docs/meetings/week-10.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

- [ ] **M5-03** · Recent specialist entries on parent dashboard  
  Epic: `M5` · Owner: **C** · Jira key: `____`  
  - Latest entries with author, type and date

- [ ] **M5-04** · Tests for M5  
  Epic: `M5` · Owner: **C** · Jira key: `____`  
  - API: create/edit/edited flag, non-author cannot edit, child 403, unlinked 403; Vitest: badge rendering

- [ ] **M6-03** · Documents page  
  Epic: `M6` · Owner: **B** · Jira key: `____`  
  - Upload, list (name, type, uploader, date), view and download; error for wrong file type

- [ ] **M6-04** · Tests for M6  
  Epic: `M6` · Owner: **B** · Jira key: `____`  
  - API: valid upload, rejected type, download, child 403, unlinked 403 (use small fixture files)

- [ ] **M7-03** · Weekly statistics widget with week selector  
  Epic: `M7` · Owner: **A** · Jira key: `____`  
  - Shows total rate and by-area breakdown (bar or progress list)

- [ ] **M7-04** · Parent weekly dashboard integration  
  Epic: `M7` · Owner: **A** · Jira key: `____`  
  - Dashboard combines weekly schedule (M3), task list + assign (M4), recent entries (M5), stats (M7), AI summary (M8)

- [ ] **M7-05** · API tests for M7  
  Epic: `M7` · Owner: **A** · Jira key: `____`  
  - Stats endpoint for seeded week returns expected numbers; unlinked 403

- [ ] **M8-04** · AI summary API  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - POST /api/children/:id/ai-summary?week= for parent or linked specialist (child 403)
  - Response: summary text, label 'AI-generated', list of source record IDs/types; provider errors return a clear 502 message
  - App keeps working when AI is unavailable

- [ ] **M8-05** · AI summary card UI  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - 'Get summary' button, loading/error states, 'AI-generated' label, clickable source records; helpful/incorrect feedback optional

- [ ] **M8-06** · Tests for M8  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - Mock mode used; correct prompt chosen per role; child 403; unlinked 403; sources returned match collected records

- [ ] **M2-07** · E2E Flow 2: parent unlinks specialist → specialist loses access  
  Epic: `M2` · Owner: **A** · Jira key: `____`  
  - Specialist sees child before, gets refused after unlink (UI + API); green in CI

- [ ] **M8-07** · E2E Flow 3: parent views AI summary with label and sources (mock)  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - Green in CI

- [ ] **M1-12** · Coverage reporting and ≥ 40% branch coverage gate  
  Epic: `M1` · Owner: **C** · Jira key: `____`  
  - Jest/Vitest coverage enabled; CI fails below 40% branches; coverage summary in PR/CI log

- [ ] **SRS-08** · Update SRS and SDD to match v0.2  
  Epic: `SRS` · Owner: **B** · Jira key: `____`  
  - Any changes reflected; change logs updated; Version Final

- [ ] **M8-08** · Release v0.2 (M1–M8)  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - All M1–M8 merged, CI green (coverage ≥ 40%, 3 E2E flows), README verified, tag v0.2 + release notes

---

## Sprint 4 (Weeks 11–13)

**Goal:** Bug fixes, E2E per module, coverage ≥ 60%, final report and demo  
**Ends with:** v1.0 (Week 12)

### Week 11

- [ ] **PMP5-01** · Write PMP-5: final progress review (v1.0)  
  Epic: `PMP-5` · Owner: **B** · Jira key: `____`  
  - Board screenshot, epic statuses, plan changes; update screenshot at v1.0; PMP-5 epic Done

- [ ] **PMP5-02** · Test-team meeting notes – Week 11  
  Epic: `PMP-5` · Owner: **C** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 11
  - Notes committed as docs/meetings/week-11.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

- [ ] **PMP5-BA** · Fix bugs reported by the test team – Developer A modules  
  Epic: `PMP-5` · Owner: **A** · Jira key: `____`  
  - Every reported bug for own modules has a Jira bug/task, a fix PR and a regression test

- [ ] **PMP5-BB** · Fix bugs reported by the test team – Developer B modules  
  Epic: `PMP-5` · Owner: **B** · Jira key: `____`  
  - Every reported bug for own modules has a Jira bug/task, a fix PR and a regression test

- [ ] **PMP5-BC** · Fix bugs reported by the test team – Developer C modules  
  Epic: `PMP-5` · Owner: **C** · Jira key: `____`  
  - Every reported bug for own modules has a Jira bug/task, a fix PR and a regression test

- [ ] **M1-13** · Security sweep  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - No secrets in git history; API key only on backend; every child route uses access middleware (automated test lists routes); passwords hashed

- [ ] **M1-14** · E2E: login per role shows only own screens (M1)  
  Epic: `M1` · Owner: **A** · Jira key: `____`  
  - Parent, specialist, child each tested; green in CI

- [ ] **M3-07** · E2E: add event and see it in weekly view (M3)  
  Epic: `M3` · Owner: **B** · Jira key: `____`  
  - Green in CI

- [ ] **M5-05** · E2E: specialist adds and edits observation → 'edited' shown, child cannot see (M5)  
  Epic: `M5` · Owner: **C** · Jira key: `____`  
  - Green in CI

- [ ] **M6-05** · E2E: upload and download a document (M6)  
  Epic: `M6` · Owner: **B** · Jira key: `____`  
  - Green in CI

- [ ] **M7-06** · E2E: weekly statistics shown for selected week (M7)  
  Epic: `M7` · Owner: **A** · Jira key: `____`  
  - Green in CI

- [ ] **M3-08** · UI polish: empty, loading and error states; consistent layout  
  Epic: `M3` · Owner: **B** · Jira key: `____`  
  - Checked on all main screens

### Week 12

- [ ] **PMP5-03** · Test-team meeting notes – Week 12  
  Epic: `PMP-5` · Owner: **A** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 12
  - Notes committed as docs/meetings/week-12.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

- [ ] **M1-15** · Raise branch coverage to ≥ 60% and update CI gate  
  Epic: `M1` · Owner: **C** · Jira key: `____`  
  - Missing branch tests added; CI threshold set to 60%

- [ ] **M4-11** · Final README and clean-clone install test  
  Epic: `M4` · Owner: **B** · Jira key: `____`  
  - Prerequisites, install, .env, seed, run, test, demo accounts, AI mock/live switch; verified on a fresh machine/clone by a teammate

- [ ] **M8-09** · Release v1.0  
  Epic: `M8` · Owner: **C** · Jira key: `____`  
  - All tests green, coverage ≥ 60%, E2E for each of M1–M8, tag v1.0 + release notes

- [ ] **PMP6-01** · Write PMP-6: retrospective  
  Epic: `PMP-6` · Owner: **C** · Jira key: `____`  
  - What worked in Jira / what we would do differently; PMP-6 epic Done

- [ ] **PMP6-02** · Final report (incl. AI tool usage declaration) and WebOnline upload  
  Epic: `PMP-6` · Owner: **A** · Jira key: `____`  
  - Report covers process, architecture, testing results, coverage, AI tools used and how; demo video link included

- [ ] **PMP6-03** · Record demo video  
  Epic: `PMP-6` · Owner: **B** · Jira key: `____`  
  - Covers all M1–M8 with seed accounts; link added to final report

- [ ] **PMP6-PA** · Final peer review – Developer A  
  Epic: `PMP-6` · Owner: **A** · Jira key: `____`  
  - Peer review submitted

- [ ] **PMP6-PB** · Final peer review – Developer B  
  Epic: `PMP-6` · Owner: **B** · Jira key: `____`  
  - Peer review submitted

- [ ] **PMP6-PC** · Final peer review – Developer C  
  Epic: `PMP-6` · Owner: **C** · Jira key: `____`  
  - Peer review submitted

- [ ] **PMP6-04** · Presentation slides  
  Epic: `PMP-6` · Owner: **A** · Jira key: `____`  
  - Problem, architecture, demo plan, testing, project management, lessons learned

- [ ] **PMP6-05** · Live demo rehearsal and backup plan  
  Epic: `PMP-6` · Owner: **C** · Jira key: `____`  
  - Full rehearsal on presentation machine; fresh seed; mock mode fallback if AI is unreachable; each member can explain own code

### Week 13

- [ ] **PMP6-06** · Test-team meeting notes – Week 13  
  Epic: `PMP-6` · Owner: **B** · Jira key: `____`  
  - Meeting with SENG 440 test team held in Week 13
  - Notes committed as docs/meetings/week-13.md (attendees, decisions, action items, bugs reported)
  - Action items created as Jira tasks if needed

---

## Bonus backlog (no sprint)

**Goal:** Bonus – only after all M1–M8 pass the test team's tests  
**Ends with:** —

- [ ] **M3-B1** · Bonus: monthly schedule view  
  Epic: `M3` · Owner: **-** · Jira key: `____`  
  - Start ONLY after all M1–M8 pass the test team's tests
  - Has its own tests

- [ ] **M4-B1** · Bonus: recurring tasks  
  Epic: `M4` · Owner: **-** · Jira key: `____`  
  - Start ONLY after all M1–M8 pass the test team's tests
  - Has its own tests

- [ ] **M5-B1** · Bonus: full edit history for observations  
  Epic: `M5` · Owner: **-** · Jira key: `____`  
  - Start ONLY after all M1–M8 pass the test team's tests
  - Has its own tests

- [ ] **M6-B1** · Bonus: per-document sharing  
  Epic: `M6` · Owner: **-** · Jira key: `____`  
  - Start ONLY after all M1–M8 pass the test team's tests
  - Has its own tests

- [ ] **M8-B1** · Bonus: AI task suggestions (shown as suggestions, human approves)  
  Epic: `M8` · Owner: **-** · Jira key: `____`  
  - Start ONLY after all M1–M8 pass the test team's tests
  - Has its own tests

- [ ] **M4-B2** · Bonus: in-app notifications  
  Epic: `M4` · Owner: **-** · Jira key: `____`  
  - Start ONLY after all M1–M8 pass the test team's tests
  - Has its own tests
