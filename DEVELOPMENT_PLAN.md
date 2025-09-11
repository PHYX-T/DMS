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
- [ ] Choose primary DB (Postgres) and file storage (S3-compatible) strategy.
- [ ] Create schema migrations in `migrations/` and migration runner.
- [ ] Establish services: `src/core/{documents,codes,workflows,rbac,audit}`, `src/api`, `src/search`, `src/notifications`.
- [ ] Config loader (env + YAML), config validation, and secrets handling.
- [ ] Define error model and centralized exception handling in API.
- [ ] Add feature flags scaffolding (optional) and configuration docs.

## Data Model & Validation
- [ ] Document entity with constraints: unique ID, status enum, version rules.
- [ ] AuditLog append-only table; trigger or guard to prevent updates/deletes.
- [ ] CodeList tables and admin CRUD.
- [ ] Enforce regex `^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\d{3}$` + mandatory metadata fields.
- [ ] API-level validation schemas (DTOs) and helpful error messages.
- [ ] DB unique indexes for document ID and code lists; foreign keys.

## API & Services
- [ ] Health + info endpoints.
- [ ] Documents API: create/read/update/list with filters & pagination.
- [ ] Upload endpoints (source + PDF publish) with size/type validation.
- [ ] Workflow endpoints: submit, approve, reject, archive; version bump.
- [ ] Codes API: manage code lists (CRUD) with permissions.
- [ ] Reports API: KPIs and exports.
- [ ] AuthN (SSO later) placeholders; RBAC middleware and permission checks.
- [ ] Audit logging on all state-changing operations.

## Document Handling
- [ ] Storage adapters: local dev, S3-compatible prod; signed URLs for downloads.
- [ ] Upload: antivirus scan stub, checksum, max size, MIME/type validation.
- [ ] Publish PDF: conversion pipeline; store PDF in public bucket/area.
- [ ] Restrict source access; ensure ACL separation.
- [ ] Versioning rules: major/minor, latest pointer, obsolete/access blocking.
- [ ] Auto-archive obsolete versions on new approvals.

## Search & Reporting
- [ ] Pick search approach (DB FTS or external engine) and index strategy.
- [ ] Implement index build and incremental updates on document changes.
- [ ] Search API: query string + filters; relevance ranking; pagination/sorting.
- [ ] Performance harness with seeded dataset; meet P95 < 2s.
- [ ] Reports: pending reviews, overdue revisions, KPIs; export PDF/Excel.
- [ ] Cache layer for repeated queries; cache invalidation.

## RBAC & SSO
- [ ] Role matrix and permission checks per endpoint/action; deny-by-default.
- [ ] Microsoft 365 SSO integration (OpenID Connect); callback endpoints.
- [ ] Claims-to-roles mapping and role override controls.
- [ ] Admin UI/API for role assignments; audit role changes.

## Notifications
- [ ] Events: review due, approvals pending, upcoming expiry; event bus abstraction.
- [ ] SMTP setup; email templates; throttling and digest options.
- [ ] In-app notifications feed; mark-as-read endpoints.

## Frontend (if applicable)
- [ ] Bootstrap Vue + Tailwind project and CI.
- [ ] Auth integration and route guards with roles.
- [ ] Dashboard per role (Controllers, QMS, End Users).
- [ ] Search with filters and pagination; empty/error states.
- [ ] Upload form with code autosuggest and validation.
- [ ] Document view with embedded PDF, metadata, version history.
- [ ] Review queue UI for approve/reject; comments.
- [ ] Reports UI and exports.

## Quality & CI/CD
- [ ] Unit, integration, and e2e tests; coverage reports and thresholds.
- [ ] CI jobs for backend, frontend; matrix for Python versions if needed.
- [ ] Secret scanning and dependency audit jobs.
- [ ] Build artifacts (Docker images); push to registry; staging deploy.
- [ ] Add CI status badges and PR checks.

## Security & Compliance
- [ ] Input validation at API boundaries; sanitize logs; consistent error codes.
- [ ] Security headers and CORS config.
- [ ] Secrets: `.env` + `.env.example`; vault in prod; key rotation policy.
- [ ] Audit logs immutable; retention policies; backup/restore drills.
- [ ] GDPR/data retention documentation and DSR procedures.

## Observability & Ops
- [ ] Structured logs with correlation IDs; trace IDs for workflows.
- [ ] Metrics: latency, errors, workflow durations, indexing times.
- [ ] Dashboards and alerts for SLOs; on-call rota.
- [ ] Runbooks for common incidents (DB down, storage issues, email failures).

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
