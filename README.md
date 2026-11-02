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

If `npm ci` stops with `gyp ERR!` while building `better-sqlite3`, npm is trying to compile it
although the package already ships a prebuilt Windows binary. Fix it in one of these ways:

1. **Skip the native build** (quickest): delete `node_modules`, then run `npm ci --ignore-scripts`.
   The bundled prebuilt binary is used and `npm run seed`, `npm run dev` and `npm test` work.
2. Or install the C++ build tools: Visual Studio Build Tools with the
   "Desktop development with C++" workload, plus Python 3, then run `npm ci` again.
