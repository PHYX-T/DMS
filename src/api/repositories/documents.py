import os
import json
from typing import Any, Dict, Optional


try:
    import psycopg  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    psycopg = None  # type: ignore

import subprocess


def _db_url() -> Optional[str]:
    url = os.getenv("DATABASE_URL", "").strip()
    return url or None


def _psql_json(sql: str, timeout: float = 2.0) -> Optional[Any]:
    db = _db_url()
    if not db:
        return None
    try:
        proc = subprocess.run(
            ["psql", db, "-t", "-A", "-q", "-c", sql],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except Exception:
        return None
    if proc.returncode != 0:
        return None
    out = proc.stdout.strip()
    if not out:
        return None
    try:
        return json.loads(out.splitlines()[-1])
    except Exception:
        return None


def _escape(val: str) -> str:
    return val.replace("'", "''")


class DocumentsRepository:
    def __init__(self) -> None:
        self.db_url = _db_url()
        self.use_psycopg = bool(psycopg and self.db_url)

    def get_by_code(self, doc_code: str) -> Optional[Dict[str, Any]]:
        if not self.db_url:
            return None
        if self.use_psycopg:
            try:
                with psycopg.connect(self.db_url) as conn:  # type: ignore
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            SELECT id, doc_code, title, status,
                                   version_major, version_minor,
                                   company_code, subsidiary_code, department_code, document_type_code,
                                   issue_date, review_date, keywords, description,
                                   created_at, updated_at
                            FROM documents WHERE doc_code = %s
                            """,
                            (doc_code,),
                        )
                        row = cur.fetchone()
                        if not row:
                            return None
                        cols = [d[0] for d in cur.description]
                        return dict(zip(cols, row))
            except Exception:
                return None
        # psql fallback returns JSON
        sdoc = _escape(doc_code)
        sql = f"""
        SELECT COALESCE(
          row_to_json(t), 'null'::json
        ) FROM (
          SELECT id, doc_code, title, status,
                 version_major, version_minor,
                 company_code, subsidiary_code, department_code, document_type_code,
                 issue_date, review_date, keywords, description,
                 created_at, updated_at
          FROM documents WHERE doc_code = '{sdoc}'
        ) t;
        """
        data = _psql_json(sql)
        return data if isinstance(data, dict) else None

    def create(self, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.db_url:
            return None
        fields = (
            "doc_code", "title", "company_code", "subsidiary_code",
            "department_code", "document_type_code", "issue_date", "review_date",
            "keywords", "description"
        )
        data = {k: payload.get(k) for k in fields}

        if self.use_psycopg:
            try:
                with psycopg.connect(self.db_url, autocommit=True) as conn:  # type: ignore
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            INSERT INTO documents (
                              doc_code, title, company_code, subsidiary_code,
                              department_code, document_type_code,
                              issue_date, review_date, keywords, description
                            ) VALUES (%(doc_code)s, %(title)s, %(company_code)s, %(subsidiary_code)s,
                                      %(department_code)s, %(document_type_code)s,
                                      %(issue_date)s, %(review_date)s, %(keywords)s, %(description)s)
                            RETURNING id, doc_code, title, status, version_major, version_minor,
                                      company_code, subsidiary_code, department_code, document_type_code,
                                      issue_date, review_date, keywords, description,
                                      created_at, updated_at
                            """,
                            data,
                        )
                        row = cur.fetchone()
                        cols = [d[0] for d in cur.description]
                        doc = dict(zip(cols, row))
                        # audit
                        cur.execute(
                            "INSERT INTO audit_logs(document_id, action, user_id, data) VALUES (%s, 'Created', NULL, %s)",
                            (doc["id"], json.dumps({"doc_code": doc["doc_code"]})),
                        )
                        return doc
            except Exception:
                return None

        # psql fallback with JSON result and audit write
        s = {k: (None if data[k] is None else _escape(str(data[k]))) for k in data}
        sql = f"""
        WITH ins AS (
          INSERT INTO documents (
            doc_code, title, company_code, subsidiary_code,
            department_code, document_type_code,
            issue_date, review_date, keywords, description
          ) VALUES (
            '{s['doc_code']}', '{s['title']}', '{s['company_code']}', '{s['subsidiary_code']}',
            '{s['department_code']}', '{s['document_type_code']}',
            {('NULL' if s['issue_date'] is None else "'" + s['issue_date'] + "'")},
            {('NULL' if s['review_date'] is None else "'" + s['review_date'] + "'")},
            {('NULL' if data['keywords'] is None else "'" + _escape(json.dumps(data['keywords'])) + "'::jsonb")},
            {('NULL' if s['description'] is None else "'" + s['description'] + "'")}
          ) RETURNING *
        )
        , aud AS (
          INSERT INTO audit_logs(document_id, action, user_id, data)
          SELECT id, 'Created', NULL, json_build_object('doc_code', doc_code)
          FROM ins RETURNING 1
        )
        SELECT row_to_json(ins) FROM ins;
        """
        res = _psql_json(sql)
        return res if isinstance(res, dict) else None

