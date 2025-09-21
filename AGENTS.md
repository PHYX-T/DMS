# Repository Guidelines

## Project Structure & Module Organization
- `src/core/{documents,codes,workflows,rbac,audit}` – pure domain logic and invariants.
- `src/api/` – HTTP layer (handlers, DTO validation, adapters).
- `migrations/` – PostgreSQL DDL/DML (`000*.sql`).
- `scripts/` – utilities (e.g., `migrate.sh`, `run-api.sh`).
- `assets/` – static assets and ERD (`assets/erd/`).
- `tests/` – mirrors `src/` (e.g., `tests/core/test_*.py`).
- `.env` – local config (`HOST`, `PORT`, `APP_ENV`, `DATABASE_URL`). Do not commit secrets.

## Build, Test, and Development Commands
- `make setup` – install deps when manifests exist.
- `make run` – best‑effort run (Python uses `python -m src.app`).
- `make run-api` – start API with `HOST`/`PORT` from `.env`.
- `make migrate-psql` – apply SQL migrations via `psql` (`DATABASE_URL` req.).
- `make test` – run tests (pytest).
- `make lint` / `make format` – Ruff checks, Black format.
- `make erd` – render Mermaid ERD (needs `mmdc`).
Example: `HOST=127.0.0.1 PORT=8000 python3 -m src.api.server`

## Coding Style & Naming Conventions
- Python: 4‑space indent; snake_case files/functions; PascalCase classes.
- Tools: Black (format), Ruff (lint). Commit only formatted code.
- Keep `src/core` side‑effect free; validate inputs at the API boundary.

## Testing Guidelines
- Framework: pytest. Name tests `tests/**/test_*.py`.
- Aim ≥ 80% coverage on changed code; include negative paths (validation, RBAC, workflow, audit).
- Run: `make test` or `pytest -q`.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Small, atomic commits with rationale.
- PRs: clear what/why, how tested, logs/screenshots if relevant, breaking‑change notes, and linked issues (e.g., `Closes #123`).

## Security & Configuration Tips
- Never commit secrets. Use `.env` locally; secret stores in prod.
- Database via `DATABASE_URL` (use `~/.pgpass` to avoid env passwords).
- Document ID policy: `^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\d{3}$` (e.g., `ABC-XY-ENG-PRO-001`).
- Audit logs are append‑only; RBAC is deny‑by‑default; workflow: Draft → Review → Approved → Archived/Obsolete.
