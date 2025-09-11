-- Initial schema for DMS (PostgreSQL)
-- Safe to run on a new database. Assumes default public schema.

-- Code lists
CREATE TABLE IF NOT EXISTS company_codes (
  code CHAR(3) PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subsidiary_codes (
  code CHAR(2) PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS department_codes (
  code CHAR(3) PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS document_type_codes (
  code CHAR(3) PRIMARY KEY,
  name TEXT NOT NULL
);

-- Users (lightweight; integrate SSO later)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  doc_code VARCHAR(20) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  version_major INTEGER NOT NULL DEFAULT 1,
  version_minor INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(16) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Review','Approved','Archived','Obsolete')),
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  controller_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  company_code CHAR(3) REFERENCES company_codes(code) ON DELETE RESTRICT,
  subsidiary_code CHAR(2) REFERENCES subsidiary_codes(code) ON DELETE RESTRICT,
  department_code CHAR(3) REFERENCES department_codes(code) ON DELETE RESTRICT,
  document_type_code CHAR(3) REFERENCES document_type_codes(code) ON DELETE RESTRICT,
  issue_date DATE,
  review_date DATE,
  keywords TEXT[],
  description TEXT,
  pdf_path TEXT,
  source_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT documents_doc_code_format CHECK (doc_code ~ '^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-[0-9]{3}$')
);

-- Helpful indexes for filtering
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_code);
CREATE INDEX IF NOT EXISTS idx_documents_department ON documents(department_code);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type_code);
CREATE INDEX IF NOT EXISTS idx_documents_issue_date ON documents(issue_date);

-- Audit Log (append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('Created','Revised','Approved','Archived','Accessed')),
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::JSONB
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_document ON audit_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_at ON audit_logs(at);

-- Optional: trigger to update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

