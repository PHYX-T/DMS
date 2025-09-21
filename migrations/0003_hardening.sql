-- Hardening migration: stricter nullability, version checks, audit immutability,
-- improved FK behavior, search index, and minimal RBAC tables.

-- 1) Enforce mandatory metadata on documents
ALTER TABLE documents ALTER COLUMN company_code SET NOT NULL;
ALTER TABLE documents ALTER COLUMN subsidiary_code SET NOT NULL;
ALTER TABLE documents ALTER COLUMN department_code SET NOT NULL;
ALTER TABLE documents ALTER COLUMN document_type_code SET NOT NULL;

-- 2) Version sanity checks (idempotent via catalog check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'documents' AND c.conname = 'documents_version_nonneg'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT documents_version_nonneg
      CHECK (version_major >= 1 AND version_minor >= 0);
  END IF;
END$$;

-- 3) Audit immutability: block UPDATE/DELETE on audit_logs
CREATE OR REPLACE FUNCTION audit_logs_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;

CREATE TRIGGER audit_logs_no_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();

CREATE TRIGGER audit_logs_no_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();

-- 4) Retain audit records if documents are deleted
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_document_id_fkey;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_document_id_fkey
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL;

-- 5) Expand audit action coverage
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_action_check
  CHECK (action IN ('Created','Revised','Approved','Archived','Obsoleted','Submitted','Rejected','Accessed'));

-- 6) Index keywords for search
CREATE INDEX IF NOT EXISTS idx_documents_keywords ON documents USING GIN (keywords);

-- 7) Minimal RBAC tables
CREATE TABLE IF NOT EXISTS roles (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  role_name TEXT REFERENCES roles(name) ON DELETE RESTRICT,
  PRIMARY KEY (user_id, role_name)
);

