import types
from typing import Any

import pytest


def _fake_proc(stdout: str = "t\n", returncode: int = 0) -> Any:
    p = types.SimpleNamespace()
    p.stdout = stdout
    p.stderr = ""
    p.returncode = returncode
    return p


def test_exists_returns_none_when_no_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    from src.api.db import exists_document_by_code

    assert exists_document_by_code("ABC-XY-ENG-PRO-001") is None


def test_exists_true_on_psql_t(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgres://user@localhost:5432/db")

    def fake_run(args, capture_output, text, timeout):  # noqa: ARG001
        assert args[:2] == ["psql", "postgres://user@localhost:5432/db"]
        assert "-t" in args and "-A" in args and "-c" in args
        return _fake_proc(stdout="t\n")

    monkeypatch.setattr("subprocess.run", fake_run)
    from src.api.db import exists_document_by_code

    assert exists_document_by_code("ABC-XY-ENG-PRO-001") is True


def test_exists_false_on_psql_f(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgres://user@localhost:5432/db")

    def fake_run(args, capture_output, text, timeout):  # noqa: ARG001
        return _fake_proc(stdout="f\n")

    monkeypatch.setattr("subprocess.run", fake_run)
    from src.api.db import exists_document_by_code

    assert exists_document_by_code("ABC-XY-ENG-PRO-001") is False


def test_exists_none_on_nonzero_exit(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgres://user@localhost:5432/db")

    def fake_run(args, capture_output, text, timeout):  # noqa: ARG001
        return _fake_proc(stdout="", returncode=1)

    monkeypatch.setattr("subprocess.run", fake_run)
    from src.api.db import exists_document_by_code

    assert exists_document_by_code("ABC-XY-ENG-PRO-001") is None


def test_single_quote_escaping(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgres://user@localhost:5432/db")

    captured_sql = {}

    def fake_run(args, capture_output, text, timeout):  # noqa: ARG001
        # Find the SQL after '-c'
        idx = args.index("-c")
        captured_sql["sql"] = args[idx + 1]
        return _fake_proc(stdout="f\n")

    monkeypatch.setattr("subprocess.run", fake_run)
    from src.api.db import exists_document_by_code

    exists_document_by_code("ABC-XY-ENG-PRO-00'1")
    assert "''" in captured_sql["sql"]  # single quote doubled


def test_timeout_or_exception_returns_none(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgres://user@localhost:5432/db")

    def fake_run(*args, **kwargs):  # noqa: ANN001, D401
        raise TimeoutError

    monkeypatch.setattr("subprocess.run", fake_run)
    from src.api.db import exists_document_by_code

    assert exists_document_by_code("ABC-XY-ENG-PRO-001") is None

