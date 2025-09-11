# Repository Guidelines

## Project Structure & Modules
- Domain-first layout (per Specs.md):
  - `src/core/{documents,codes,workflows,rbac,audit}` – business logic and invariants.
  - `src/api/` – HTTP/API layer (controllers, DTO validation).
  - `src/search/` – indexing and queries (<2s target).
  - `src/notifications/` – email/in-app alerts for reviews/approvals.
  - `assets/` static files, `scripts/` utilities, `config/` runtime configs, `.github/workflows/` CI.
- Tests mirror `src/` under `tests/` (e.g., `tests/core/test_documents.*`).

## Architecture Overview
- Enforce document ID schema and metadata at the boundary; keep core pure.
- Persist immutable audit logs for every state change.
- Workflows: Draft → Review → Approved → Archived/Obsolete; minor/major revisions configurable.
- RBAC: End User, Owner, Controller, Admin, QMS; deny-by-default.

## Build, Test, and Development
- Use Make targets:
  - `make setup` install deps; `make run` start app; `make test` run suite; `make lint` format/lint; `make build` produce artifacts.
- Without Make: use stack defaults (`pytest`, `npm test`, `go test`, `cargo test`).

Environment
- `.env` supports `APP_ENV`, `HOST`, `PORT`. Server reads them at startup.
- Examples: `HOST=0.0.0.0`, `PORT=8080` for containerized runs.

## Coding Style & Naming
- Indentation: JS/TS 2 spaces; Python 4 spaces.
- Filenames: Python `snake_case`, web assets `kebab-case`, classes/types `PascalCase`.
- Tools: Prettier+ESLint (JS/TS), Black+Ruff (Python); commit only formatted code.

## Domain Conventions
- Document ID regex: `^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\d{3}$` (e.g., `ABC-XY-ENG-PRO-001`).
- Block uploads unless ID and mandatory metadata are valid; prevent duplicates.
- Store published PDF for end users; restrict source files.

## Testing Guidelines
- Mirror structure; name tests: `test_*.py`, `*.test.ts`, `*_test.go`.
- Coverage ≥ 80% on changed code; include edge cases and negative paths (validation, RBAC, workflow transitions, audit writes).

## Commits & Pull Requests
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Small, atomic commits with rationale.
- PRs: clear what/why, how tested, screenshots/logs for UI, breaking-change notes, linked issues (e.g., `Closes #123`).

## Security & Config
- Never commit secrets. Use `.env` and `config.example.yaml`; document required keys. Least-privilege tokens.
- Enforce input validation at API layer; immutable audit logs; prepare for SSO (Microsoft 365).
