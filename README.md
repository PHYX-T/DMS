# DMS – Document Management & Control

[![CI (Python)](https://github.com/PHYX-T/DMS/actions/workflows/ci-python.yml/badge.svg)](https://github.com/PHYX-T/DMS/actions/workflows/ci-python.yml)

ISO 9001:2015–aligned Document Management System (DMS) with controlled workflows, audit trails, and fast, metadata-driven retrieval.

## Quickstart
- Requirements: Python 3.11+
- Install tools: `make setup`
- Run API: `python3 -m src.app`
- Endpoints:
  - `GET /` – index page with links
  - `GET /health` – health check
  - `GET /validate?id=ABC-XY-ENG-PRO-001` – document ID validation
  - `GET /duplicate?id=<ID>` – duplicate check (in-memory demo)

## Development
- Format: `make format` (Black / Prettier)
- Lint: `make lint` (Ruff + Black check)
- Tests: `make test` (pytest)
- Configure env: copy `.env.example` → `.env`; set `HOST`/`PORT`.

## Project Structure
- `src/core/{documents,codes,workflows,rbac,audit}` – domain logic
- `src/api` – HTTP handlers
- `src/search` – indexing & queries
- `src/notifications` – email/in-app alerts
- `tests/` – mirrors `src/`

## Planning & Guidelines
- Architecture & checklists: see `DEVELOPMENT_PLAN.md`
- Contributor guide: see `AGENTS.md`

## Backlog Seeding
- Actions → run “Seed Backlog” to create milestones, labels, and issues from `.github/backlog.json`.

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

