import os
import importlib


def test_is_valid_document_id_defaults():
    # Ensure default regex is used
    os.environ.pop("DOCUMENT_ID_REGEX", None)
    validator = importlib.import_module("src.core.documents.validator")
    assert validator.is_valid_document_id("ABC-XY-ENG-PRO-001") is True
    assert validator.is_valid_document_id("abc-xy-eng-pro-001") is False
    assert validator.is_valid_document_id("ABC-XYZ-ENG-PRO-001") is False  # too many letters in 2nd block
    assert validator.is_valid_document_id("ABC-XY-ENG-PR-001") is False    # too few letters in 4th block
    assert validator.is_valid_document_id("ABC-XY-ENG-PRO-1") is False     # too few digits


def test_is_valid_document_id_with_override(monkeypatch):
    # Override to allow 4-digit sequence
    monkeypatch.setenv("DOCUMENT_ID_REGEX", r"^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\d{4}$")
    validator = importlib.import_module("src.core.documents.validator")
    importlib.reload(validator)
    assert validator.is_valid_document_id("ABC-XY-ENG-PRO-0001") is True
    assert validator.is_valid_document_id("ABC-XY-ENG-PRO-001") is False


def test_is_duplicate_id():
    from src.core.documents.validator import is_duplicate_id

    existing = {"ABC-XY-ENG-PRO-001", "DEF-GH-OPS-SOP-002"}
    assert is_duplicate_id("ABC-XY-ENG-PRO-001", existing) is True
    assert is_duplicate_id("ZZZ-ZZ-ZZZ-ZZZ-999", existing) is False

