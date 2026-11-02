# SENG 383 – AI-Assisted Child Development Platform

A web-based decision support platform where parents, specialists and children share one weekly
schedule, task list and record of observations. An AI component summarizes records per role.

> Work in progress – see [docs/BACKLOG.md](docs/BACKLOG.md) for the task list and
> [AGENTS.md](AGENTS.md) for project rules.

## Tech stack

React (Vite) · Node.js + Express · SQLite · JWT · Jest / Supertest / Vitest / Playwright · GitHub Actions

## Prerequisites

_TBD (M4-02)_

## Setup

_TBD (M4-02)_

## Running tests

```
npm test                         # server (Jest + Supertest) + client (Vitest)
npx playwright install chromium  # once, before the first E2E run
npm run test:e2e                 # Playwright, starts the app itself (AI_MODE=mock)
```

## Demo accounts

`npm run seed` resets the database and creates these synthetic accounts.
All of them use the password **`Demo1234!`**.

| Role | Email | Notes |
|---|---|---|
| Parent | `elif.parent@demo.test` | Parent of Deniz |
| Parent | `murat.parent@demo.test` | Parent of Ece |
| Child | `deniz.child@demo.test` | Deniz Demir |
| Child | `ece.child@demo.test` | Ece Kaya |
| Specialist | `selin.specialist@demo.test` | Speech therapist, linked to Deniz |
| Specialist | `can.specialist@demo.test` | Physiotherapist, linked to Ece |
| Specialist | `zeynep.specialist@demo.test` | Not linked to any child |

Events, tasks and observations are dated relative to the week you run the seed, so the
current week always has data.
