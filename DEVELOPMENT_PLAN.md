# Development Plan & Checklists

## Scope & Goals
- ISO 9001:2015–aligned DMS for controlled documents, with ID schema `AAA-BB-CCC-DDD-XXX`, RBAC, workflows, search < 2s, immutable audit logs, and PDF publication with restricted sources.

## Milestones (Exit Criteria)
- M0 – Foundation [Completed]: Repo scaffolding, Makefile, basic API (`/health`, `/validate`), tests and CI smoke. Exit: green CI, coding standards in place.
- M1 – Domain Models: `Document`, `AuditLog`, `CodeList`; persistence stubs; validation rules. Exit: CRUD on dev DB, unit tests ≥80% for domain.
- M2 – Workflows & RBAC: Draft→Review→Approved→Archived/Obsolete; major/minor paths; role gates. Exit: API flows with state transitions + authorization tests.
- M3 – Document Handling: Upload, metadata validation, PDF publication, source storage (restricted), versioning, archiving. Exit: end-to-end happy path.
- M4 – Search & Reporting: Metadata index, keyword search, KPIs/reports. Exit: P95 search latency <2s on seeded dataset.
- M5 – Notifications & SSO: Review/expiry alerts, Microsoft 365 SSO. Exit: login via SSO in staging; emails in dev.
- M6 – Hardening & Release: Security review, perf tuning, backup/restore, runbooks. Exit: production release checklist complete.

## Architecture Tasks
- [ ] Define storage (e.g., Postgres + object storage for files) and create schema migrations (`migrations/`).
- [ ] Establish service layout: `src/core/{documents,codes,workflows,rbac,audit}`, `src/api`, `src/search`, `src/notifications`.
- [ ] Add configuration loader (env + YAML) and secrets handling.

## Data Model & Validation
- [ ] Document: ID, Title, Version, Status, Owner, Controller, Metadata, Files, ChangeHistory.
- [ ] AuditLog: ID, DocumentID, Action, User, Timestamp (append-only).
- [ ] CodeList: company, subsidiary, department, type.
- [ ] Enforce regex: `^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\d{3}$` and mandatory metadata.
- [ ] Prevent duplicate IDs at DB level (unique index) + API.

## API & Services
- [ ] Endpoints (initial): `/health`, `/validate`, `/duplicate` (dev stub).
- [ ] CRUD: `/documents` (create/upload, get, update, list with filters), `/codes`, `/reports`.
- [ ] Workflow: `/documents/{id}/submit`, `/approve`, `/reject`, `/archive`, version bump.
- [ ] AuthN/Z middleware with RBAC enforcement (End User, Owner, Controller, Admin, QMS).

## Document Handling
- [ ] Upload pipeline: store source securely; convert/publish PDF; attach metadata.
- [ ] Versioning: major/minor increments, latest flag, obsolete blocking.
- [ ] Archiving: move obsolete versions to restricted area; retain change history.

## Search & Reporting
- [ ] Index metadata/keywords; add full-text support where available.
- [ ] Filters: Company, Subsidiary, Department, Type, Status.
- [ ] Performance SLO: < 2s typical queries; add basic caching.
- [ ] Reports: pending reviews, overdue revisions, compliance KPIs (export PDF/Excel).

## RBAC & SSO
- [ ] Role matrix and permission checks per endpoint/action.
- [ ] Integrate Microsoft 365 SSO; map groups/claims to roles.
- [ ] Admin UI/API for role assignments.

## Notifications
- [ ] Events: review due, approvals pending, upcoming expiry.
- [ ] Channels: email (SMTP), in-app notifications; templates and throttling.

## Frontend (if applicable)
- [ ] Tech: Vue + Tailwind + HeadlessUI.
- [ ] Views: Dashboard (role-based), Search, Upload, Document View, Review Queue.
- [ ] Integrate API; show version, metadata, change history; prevent access to obsolete.

## Quality & CI/CD
- [ ] Tests: unit (≥80% for changed code), integration, e2e, regression.
- [ ] Add `requirements-dev.txt` and `make test|lint|format` to CI.
- [ ] Static checks: Ruff/Black (Python), ESLint/Prettier (web), secret scanning.
- [ ] Build: artifact creation; deploy to staging via workflow.

## Security & Compliance
- [ ] Input validation at API boundaries; centralized error handling.
- [ ] Secrets: `.env` + `.env.example`; never commit real secrets.
- [ ] Audit logs immutable; access logs retained per policy; backups tested.
- [ ] Data retention policy and GDPR considerations documented.

## Observability & Ops
- [ ] Structured logging with correlation IDs.
- [ ] Metrics: request latency, error rate, queue depth, indexing time.
- [ ] Alerts for SLO violations; runbooks for common incidents.

## Test Plan (Checklists)
- [ ] Validation: ID regex, mandatory metadata, duplicate prevention.
- [ ] Workflow: all transitions, major/minor paths, rejection, rollback safety.
- [ ] RBAC: deny-by-default; least-privilege checks per role.
- [ ] Search: relevance, filters, performance under load.
- [ ] Files: source vs. PDF access control; archiving; version surfacing.
- [ ] Reports: correctness of KPIs; export formats.
- [ ] Security: auth bypass attempts, injections, CSRF (if web), SSRF; dependency scan.

## Environments & Config
- Dev: `.env` (HOST, PORT, APP_ENV), local DB/storage.
- Staging: SSO enabled, near-prod config, seeded data.
- Prod: HA DB/storage, backups, monitoring, rotation of credentials.

## Definition of Done (per feature)
- [ ] Code, tests, and docs updated; CI green; coverage threshold met.
- [ ] Security/validation at boundaries; logs and metrics added.
- [ ] User docs (README/operational notes) and PR description with screenshots/logs.

## Quick Commands
- Setup: `make setup`
- Run API: `python3 -m src.app` (override with `.env` HOST/PORT)
- Tests: `make test` | Lint: `make lint` | Format: `make format`
