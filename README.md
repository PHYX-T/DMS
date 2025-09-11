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

