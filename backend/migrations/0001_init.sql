-- PostgreSQL schema for DMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('EndUser','DocumentOwner','DocumentController','QMS','Admin','ExternalAuditor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS codes (
  kind TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (kind, value)
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Draft','Review','Approved','Archived','Obsolete')),
  owner_id UUID REFERENCES users(id),
  controller_id UUID REFERENCES users(id),
  company_code TEXT NOT NULL,
  subsidiary_code TEXT NOT NULL,
  department_code TEXT NOT NULL,
  type_code TEXT NOT NULL,
  issue_date DATE NOT NULL,
  review_date DATE NOT NULL,
  retention_policy TEXT NOT NULL CHECK (retention_policy IN ('WORM','STANDARD')),
  retention_months INT NOT NULL DEFAULT 0,
  retention_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  status TEXT NOT NULL,
  pdf_key TEXT,
  source_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_document_version ON document_versions(document_id, version);

-- WORM audit log (append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id TEXT,
  action TEXT NOT NULL,
  user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB
);
-- Disallow updates/deletes by revoking permissions; rely on app-level append-only.

-- Indexes for search
CREATE INDEX IF NOT EXISTS idx_documents_codes ON documents (company_code, subsidiary_code, department_code, type_code);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_review_date ON documents (review_date);

