Entity‑Relationship Diagram (ERD)

This schema maps the DMS domain to PostgreSQL tables and aligns to ISO 9001:2015 (Clause 7.5): controlled documents, history, approvals, and audit.

See existing Mermaid diagram (high‑level) at `assets/erd/dms_erd.mmd` in the repo. Suggested additions:
- Add `work_items`, `approvals`, and `delegations` to show workflow lifecycles and delegation paths
- Show `audit_log` as append‑only (WORM) linked to `documents` and `users`
- Include `document_files` and `document_links` for storage and relations
- Optionally include `search_index` (FTS fallback), `reports_cache`, and `backups` as auxiliary tables

Indexes & Constraints summary
- documents: UNIQUE(doc_id), CHECK(regex & version pattern & review_date>=issue_date), INDEX(status,latest_approved), GIN(keywords)
- work_items: INDEX(assignee_id,status,sla_due_at), GIN(payload)
- audit_log: INDEX(ts), INDEX(document_id), INDEX(actor_id), GIN(context); trigger prevents UPDATE/DELETE
- search_index: GIN(title_tsv), GIN(meta_tsv), GIN(keywords)

