# DMS – Document Management & Control

[![CI (Python)](https://github.com/PHYX-T/DMS/actions/workflows/ci-python.yml/badge.svg)](https://github.com/PHYX-T/DMS/actions/workflows/ci-python.yml)
[![Seed Backlog](https://github.com/PHYX-T/DMS/actions/workflows/seed-backlog.yml/badge.svg)](https://github.com/PHYX-T/DMS/actions/workflows/seed-backlog.yml)
[![Close Milestone](https://github.com/PHYX-T/DMS/actions/workflows/close-milestone.yml/badge.svg)](https://github.com/PHYX-T/DMS/actions/workflows/close-milestone.yml)
[![Kickoff Milestone Issues](https://github.com/PHYX-T/DMS/actions/workflows/kickoff-milestone-issues.yml/badge.svg)](https://github.com/PHYX-T/DMS/actions/workflows/kickoff-milestone-issues.yml)

ISO 9001:2015–aligned Document Management System (DMS) with controlled workflows, audit trails, and fast, metadata-driven retrieval.

## Web UI (Vue 3 + Vite)

- Location: `web/`
- Run (with mock API):
  - Terminal A: `cd web && npm ci && npm run mock-api` (starts on 8000)
  - Terminal B: `cd web && npm run dev` (Vite on 5173; proxies `/api` → 8000)
- Build/Preview: `cd web && npm run build && npm run preview`
- Tests:
  - Unit (Vitest): `cd web && npm test -- --run`
  - E2E (Cypress): `cd web && npm run cy:open` (or `cy:run`)
  - A11y (Pa11y): `cd web && ./scripts/a11y.sh` (after `npm run preview`)
  - Lighthouse CI: `cd web && npm run lhci`
- PWA Shell: basic Service Worker registered (offline shell + cache)
- Telemetry: opt‑in, admin‑visible charts in Admin → Settings

### Design System

- Tokens: `web/src/design/tokens.ts`, CSS vars in `web/src/design/theme.css`, base in `web/src/design/base.css`
- Themes: Light/Dark/High‑contrast via `applyTheme(theme, density)`; persisted across sessions
- Density: Comfortable/Compact via `[data-density]` + helpers (`dense-px`, `dense-py`, `dense-input`)
- Elevation: `.e1`–`.e4` utilities; focus ring honors tokens
- Components: in `web/src/components/ui` and `web/src/components/data` with examples in `*.stories.ts`
- Usage:
  ```ts
  import { tokens, applyTheme } from '@/design/tokens'
  applyTheme('dark', 'compact') // runtime switch
  ```

### Routing & Guards

- File: `web/src/app/router/index.ts`
- Public: `/login`, `/status`, `/help`; Auth guard for others; role meta (`requiredRoles`) + toast on deny
- Dashboard is role‑aware; External Auditor approved‑only enforced in Document View

### Mock API & Seeds

- Start: `cd web && npm run mock-api`
- Endpoints:
  - `/codes/:kind` (ETag/304), `/users`, `/documents?code=` or `/documents/:id`, `/files/pdf/:id?v=`, `/search`, `/audit`
- Seeds: 60+ documents with diverse codes/status/versions/retention; 6+ users (one per role + delegation extras); code list conflicts

### CI

- GitHub Actions: `.github/workflows/ci.yml` runs unit, e2e, a11y, and Lighthouse budgets (Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95)
- Budgets: `web/budgets.json`; LH config: `web/lighthouserc.js`

## Quickstart
- Requirements: Python 3.11+
- Optional: PostgreSQL for database development
- Install tools: `make setup`
- Run API: `python3 -m src.app`
- Endpoints:
  - `GET /` – index page with links
  - `GET /health` – health check
  - `GET /validate?id=ABC-XY-ENG-PRO-001` – document ID validation
- `GET /duplicate?id=<ID>` – duplicate check (DB-backed when `DATABASE_URL` is set; falls back to in-memory demo)

## Development
- Format: `make format` (Black / Prettier)
- Lint: `make lint` (Ruff + Black check)
- Tests: `make test` (pytest)
- Configure env: copy `.env.example` → `.env`; set `HOST`/`PORT`.

### Frontend (Vue + Vite)
- Location: `frontend/`
- Dev server: `make run-frontend` (proxies `/api` to `http://127.0.0.1:8000`)
- Build: `make build-frontend` (outputs to `frontend/dist/`)
- API base: use `import.meta.env.VITE_API_BASE` (defaults to `/api`)
- Role picker: header dropdown persists to localStorage; Upload uses this for `X-Role` header

Serve UI from Python API (single port)
- Build the frontend: `make build-frontend`
- Start API: `python3 -m src.api.server` (or `make run-api`)
- Open UI at: `http://127.0.0.1:8000/ui`
- Notes: the API also accepts `/api/*` paths (rewritten server-side) for convenience.

## Project Structure
- `src/core/{documents,codes,workflows,rbac,audit}` – domain logic
- `src/api` – HTTP handlers
- `src/search` – indexing & queries
- `src/notifications` – email/in-app alerts
- `tests/` – mirrors `src/`
- `migrations/` – SQL schema and seeds (PostgreSQL)

## Planning & Guidelines
- Architecture & checklists: see `DEVELOPMENT_PLAN.md`
- Contributor guide: see `AGENTS.md`

## Backlog Seeding
- Actions → run “Seed Backlog” to create milestones, labels, and issues from `.github/backlog.json`.

## Database Schema & Migrations
- Location: `migrations/`
  - `0001_init.sql` – tables for code lists, users, documents (with regex check and status), audit_logs, and helpful indexes.
  - `0002_seed_codes.sql` – example data for code lists.
- Apply with psql:
  - Export `DATABASE_URL` (e.g., `export DATABASE_URL=postgres://user:pass@localhost:5432/dms_dev`)
  - Run: `make migrate-psql`

## Workflows
- CI (Python): Lint (Ruff), format (Black), and run tests (Pytest) on pushes/PRs to `main`.
- Seed Backlog: Creates milestones/labels/issues from `.github/backlog.json` (manual trigger).
- Close Milestone: Closes a milestone by title; default is “M0 – Foundation” (manual trigger).
- Kickoff Milestone Issues: Creates only the issues for a selected milestone; default “M1 – Domain Models” (manual trigger).
- Auto‑Add Issues to Project: New issues are auto-added to a GitHub Project (see setup below).

Setup for Auto‑Add Issues
- Create a GitHub Project (Projects v2) under your user or org.
- In repo Settings → Variables → Actions, add `PROJECT_V2_NUMBER` with the project number from the URL.
- New issues will be added to that project automatically.

## Session Summary (What We Set Up)
- Repo scaffolding with domain-first structure and `AGENTS.md` contributor guide.
- Python minimal API server with endpoints: `/`, `/health`, `/validate`, `/duplicate`, `/duplicates/*`.
- Document ID validator (`src/core/documents/validator.py`) and pytest unit tests.
- Makefile targets: `setup`, `run`, `test`, `lint`, `format`, `build`, `clean`.
- Environment/config: `.env.example`, `.env` (HOST/PORT), `config/config.example.yaml`, lightweight `.env` loader.
- GitHub: issue templates, backlog (`.github/backlog.json`), seeding workflow, and Python CI (Ruff, Black format, Pytest).
- Planning: `DEVELOPMENT_PLAN.md` with milestones and detailed checklists.
- Pushed to GitHub and merged existing `info` file from remote `main`.

## TODOs (Short Term)
- Persistence: choose DB (e.g., Postgres), add migrations and data access layer.
- API: implement `/documents` CRUD, workflow routes (submit/approve/reject/archive), and error handling.
- RBAC: middleware enforcing roles (End User, Owner, Controller, Admin, QMS).
- Duplicate checks: replace in-memory set with DB uniqueness and queries.
- Upload pipeline: secure source storage, PDF publication for end users.
- Search: index metadata/keywords, add filters; target <2s latency.
- CI/CD: add DB service for integration tests; consider coverage upload.
- Ops: add Dockerfile and container run scripts; document HOST/PORT for containers.
- Security: secret scanning, input validation at boundaries, audit log write path.

## API Endpoints (Current)
- `GET /health` – health check
- `GET /validate?id=<DOC_CODE>` – document ID validation
- `GET /duplicate?id=<DOC_CODE>` – duplicate check (DB-backed when `DATABASE_URL` is set; fallback in-memory)
- `GET /documents?code=<DOC_CODE>` – fetch a document by `doc_code`
- `POST /documents` – create a document
  - Headers: `X-Role` must be `Controller`, `Admin`, or `QMS`
  - Body requires: `doc_code`, `title`, `company_code`, `subsidiary_code`, `department_code`, `document_type_code`
