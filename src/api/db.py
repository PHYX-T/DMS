import os
import subprocess
from typing import Optional, Dict, List


def _get_database_url() -> Optional[str]:
    """Return the DATABASE_URL if set and non-empty."""
    url = os.getenv("DATABASE_URL", "").strip()
    return url or None


def exists_document_by_code(doc_code: str, timeout_sec: float = 2.0) -> Optional[bool]:
    """Check existence of a document by `doc_code` using the psql CLI.

    Returns:
      - True/False when the query succeeds
      - None if DATABASE_URL isn't set, psql isn't available, or any error occurs

    Notes:
      - This implementation avoids adding Python DB client dependencies by
        invoking the `psql` CLI with `DATABASE_URL`.
      - Caller should validate/sanitize `doc_code` before passing it here.
    """
    db_url = _get_database_url()
    if not db_url:
        return None

    # Simple escaping: double any single quotes to prevent SQL injection.
    # Upstream should also validate the ID format before calling this.
    safe_doc = doc_code.replace("'", "''")
    sql = (
        "SELECT EXISTS(SELECT 1 FROM documents WHERE doc_code = '" + safe_doc + "');"
    )

    try:
        # Use -t (tuples only) and -A (unaligned) to get a clean 't' or 'f' output.
        proc = subprocess.run(
            ["psql", db_url, "-t", "-A", "-c", sql],
            capture_output=True,
            text=True,
            timeout=timeout_sec,
        )
    except Exception:
        return None

    if proc.returncode != 0:
        return None

    # Output is typically 't' or 'f' with possibly surrounding whitespace/newlines.
    out = proc.stdout.strip().splitlines()
    if not out:
        return None
    val = out[-1].strip().lower()
    if val in ("t", "true"):
        return True
    if val in ("f", "false"):
        return False
    return None


def fetch_code_options(timeout_sec: float = 2.0) -> Optional[Dict[str, List[Dict[str, str]]]]:
    """Fetch code lists from the database and return label/value pairs.

    Returns None if DATABASE_URL is missing or any error occurs.
    """
    db_url = _get_database_url()
    if not db_url:
        return None
    # Compose a single SQL that returns JSON with all code tables
    sql = (
        "WITH cc AS (SELECT code, name FROM company_codes ORDER BY code), "
        " sc AS (SELECT code, name FROM subsidiary_codes ORDER BY code), "
        " dc AS (SELECT code, name FROM department_codes ORDER BY code), "
        " tc AS (SELECT code, name FROM document_type_codes ORDER BY code) "
        " SELECT json_build_object("
        "   'companies', (SELECT json_agg(json_build_object('value', code, 'code', code, 'name', name, 'label', code || ' — ' || name)) FROM cc),"
        "   'subsidiaries', (SELECT json_agg(json_build_object('value', code, 'code', code, 'name', name, 'label', code || ' — ' || name)) FROM sc),"
        "   'departments', (SELECT json_agg(json_build_object('value', code, 'code', code, 'name', name, 'label', code || ' — ' || name)) FROM dc),"
        "   'types', (SELECT json_agg(json_build_object('value', code, 'code', code, 'name', name, 'label', code || ' — ' || name)) FROM tc)"
        ") AS result;"
    )
    try:
        proc = subprocess.run(
            ["psql", db_url, "-t", "-A", "-q", "-c", sql],
            capture_output=True,
            text=True,
            timeout=timeout_sec,
        )
    except Exception:
        return None
    if proc.returncode != 0:
        return None
    out = proc.stdout.strip().splitlines()
    if not out:
        return None
    try:
        data = json.loads(out[-1])
        if isinstance(data, dict) and "result" in data:
            return data["result"]
        if isinstance(data, dict):
            return data
    except Exception:
        return None
    return None
