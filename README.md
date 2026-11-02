# SENG 383 – AI-Assisted Child Development Platform

A web-based decision support platform where parents, specialists and children share one weekly
schedule, task list and record of observations. An AI component summarizes records per role.

> Work in progress – see [docs/BACKLOG.md](docs/BACKLOG.md) for the task list and
> [AGENTS.md](AGENTS.md) for project rules.

## Tech stack

React (Vite) · Node.js + Express · SQLite · JWT · Jest / Supertest / Vitest / Playwright · GitHub Actions

## Prerequisites

- **Node.js 22 LTS** (the version CI uses) and npm 10+. Check with `node -v`.
- Git.

## Setup

```
git clone https://github.com/secondlostgirl/383.git
cd 383
npm ci                      # installs server + client (npm workspaces)
cp .env.example .env        # Windows (cmd): copy .env.example .env
npm run seed                # creates server/data/app.sqlite with synthetic data
npm run dev                 # backend on http://localhost:3001, frontend on http://localhost:5173
```

Open http://localhost:5173. The backend health check is at http://localhost:3001/api/health.

### Windows troubleshooting: `npm ci` fails on `better-sqlite3`

If `npm ci` stops with `gyp ERR!` while building `better-sqlite3`, npm found no prebuilt binary
for your Node version and tried to compile it. Fix it in one of these ways:

1. **Use Node 22 LTS** (recommended). With [nvm-windows](https://github.com/coreybutler/nvm-windows):
   `nvm install 22` then `nvm use 22`, delete `node_modules`, and run `npm ci` again.
2. Or install the C++ build tools: Visual Studio Build Tools with the
   "Desktop development with C++" workload, plus Python 3, then run `npm ci` again.

## Running tests

```
npm test                         # server (Jest + Supertest) + client (Vitest)
npx playwright install chromium  # once, before the first E2E run
npm run test:e2e                 # Playwright, starts the app itself (AI_MODE=mock)
```

## Demo accounts

_TBD (M1-05)_
