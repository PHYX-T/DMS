-- Core schema for DMS – PostgreSQL 15+
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('EndUser','DocumentOwner','DocumentController','QMS','Admin','ExternalAuditor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Delegations
CREATE TABLE IF NOT EXISTS delegations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role_scope TEXT NOT NULL CHECK (role_scope IN ('DocumentOwner','DocumentController')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  CHECK (ends_at > starts_at)
);

-- Codes (combined row for company/subsidiary/department/type) – can be split later if needed
CREATE TABLE IF NOT EXISTS codes (
  company_code TEXT NOT NULL CHECK (company_code ~ '^[A-Z]{3}$'),
  subsidiary_code TEXT NOT NULL CHECK (subsidiary_code ~ '^[A-Z]{2}$'),
  department_code TEXT NOT NULL CHECK (department_code ~ '^[A-Z]{3}$'),
  document_type_code TEXT NOT NULL CHECK (document_type_code ~ '^[A-Z]{3}$'),
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (company_code, subsidiary_code, department_code, document_type_code)
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Draft','OwnerApproval','Review','Approved','Published','Archived','Obsolete')),
  owner_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  controller_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  issue_date DATE NOT NULL,
  review_date DATE NOT NULL,
  retention_years INT NOT NULL DEFAULT 0 CHECK (retention_years >= 0),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  latest_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (review_date >= issue_date),
  CHECK (doc_id ~ '^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\d{3}$'),
  CHECK (version ~ '^\d+\.\d+$')
);
CREATE INDEX IF NOT EXISTS idx_documents_status_latest ON documents(status, latest_approved);
CREATE INDEX IF NOT EXISTS idx_documents_keywords_gin ON documents USING GIN (keywords);

-- Document files (one row per latest ingest; versions tracked via change_history)
CREATE TABLE IF NOT EXISTS document_files (
  document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  pdf_key TEXT,
  source_key TEXT,
  source_restricted BOOLEAN NOT NULL DEFAULT true
);

-- Document links (related documents)
CREATE TABLE IF NOT EXISTS document_links (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  related_doc_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, related_doc_id)
);

-- Change history (immutable log of version changes)
CREATE TABLE IF NOT EXISTS change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version TEXT NOT NULL CHECK (version ~ '^\d+\.\d+$'),
  action TEXT NOT NULL CHECK (action IN ('Created','Revised','Submitted','Approved','Rejected','Published','Archived','Restored','Accessed')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_change_history_doc_ts ON change_history(document_id, timestamp DESC);

-- Work items (tasks for approvals/reviews)
CREATE TABLE IF NOT EXISTS work_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('OwnerApproval','Review','Publish','Archive','Restore','CodesApprove')),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Open','InProgress','Completed','Rejected','Escalated')),
  sla_due_at TIMESTAMPTZ,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_work_items_assignee_status_sla ON work_items(assignee_id, status, sla_due_at);
CREATE INDEX IF NOT EXISTS idx_work_items_payload_gin ON work_items USING GIN (payload jsonb_path_ops);

-- Approvals
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision TEXT NOT NULL CHECK (decision IN ('Approved','Rejected')),
  comment TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (work_item_id, approver_id)
);

-- Audit log (WORM)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  ts TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log(ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_doc ON audit_log(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_context_gin ON audit_log USING GIN (context jsonb_path_ops);

-- Enforce append-only (WORM) via trigger
CREATE OR REPLACE FUNCTION audit_log_no_update_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only (WORM)';
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_audit_log_no_update ON audit_log;
CREATE TRIGGER trg_audit_log_no_update BEFORE UPDATE OR DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION audit_log_no_update_delete();

-- FTS index (optional Postgres fallback)
CREATE TABLE IF NOT EXISTS search_index (
  document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  title_tsv tsvector,
  meta_tsv tsvector,
  keywords TEXT[],
  last_indexed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_search_title_tsv ON search_index USING GIN (title_tsv);
CREATE INDEX IF NOT EXISTS idx_search_meta_tsv ON search_index USING GIN (meta_tsv);
CREATE INDEX IF NOT EXISTS idx_search_keywords_gin ON search_index USING GIN (keywords);

-- Reports cache
CREATE TABLE IF NOT EXISTS reports_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_value_gin ON reports_cache USING GIN (value jsonb_path_ops);

-- Backups
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_time TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  rpo_minutes INT NOT NULL,
  rto_minutes INT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_backups_snapshot_time ON backups(snapshot_time DESC);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_payload_gin ON notifications USING GIN (payload jsonb_path_ops);

-- Settings (key/value)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_settings_value_gin ON settings USING GIN (value jsonb_path_ops);

