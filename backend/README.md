NestJS backend for the Document Management & Control Application (DMS).

Highlights
- Security: OIDC SSO (Microsoft), RBAC + ABAC, signed file URLs, WORM audit, AV scan hook
- Compliance: ISO 9001 (7.5), GDPR notes (rights/retention), immutable audit
- Resilience: Health probes, DR RTO=4h / RPO=1h (backups & multi‑AZ storage), idempotency
- Performance: Search <2s typical, pagination by default, indexes defined
- Ops: Structured logs w/ trace IDs, rate‑limiting, OpenAPI 3.1

Module boundaries and responsibilities are documented inline in each module index file.

## DR Runbook (Hooks & Scripts)

Objectives
- RPO 1h: Hourly WAL archiving
- RTO 4h: Nightly DB snapshot + daily object/index snapshots; weekly restore test

Hooks in code
- BackupService schedules:
  - `walArchive()` hourly
  - `dbSnapshot()` nightly (02:00 UTC)
  - `objectStorageSnapshot()` (03:00 UTC)
  - `indexSnapshot()` (03:00 UTC)
  - `restoreTest()` weekly (Sunday 04:00 UTC) — restores to staging and verifies (stub)
- System `/status` returns last snapshot timestamps for FE banner

Scripts (stubs)
- `scripts/db_snapshot.sh` — use `pg_dump` or provider snapshot API
- `scripts/object_snapshot.sh` — mark object snapshot (S3 lifecycle/versioning recommended)
- `scripts/index_snapshot.sh` — use OpenSearch/ES snapshot API (SLM)

Terraform notes (optional)
- Use AWS RDS automated backups + PITR for WAL; S3 lifecycle for objects; OpenSearch SLM policies
- Multi‑AZ for DB and storage; VPC endpoints for S3/OpenSearch; private networking

