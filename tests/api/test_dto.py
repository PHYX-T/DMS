from src.api.dto import validate_document_payload


def test_validate_document_payload_success():
    payload = {
        "doc_code": "ABC-XY-ENG-PRO-001",
        "title": "Quality procedure",
        "company_code": "ABC",
        "subsidiary_code": "XY",
        "department_code": "ENG",
        "document_type_code": "PRO",
        "keywords": ["iso", "qms"],
        "description": "Test",
    }
    ok, errs, norm = validate_document_payload(payload)
    assert ok is True
    assert errs == []
    assert norm["doc_code"] == payload["doc_code"]
    assert norm["title"] == "Quality procedure"


def test_validate_document_payload_errors():
    payload = {
        "doc_code": "bad",
        "title": "",
        "company_code": "ab1",
        "subsidiary_code": "xyz",
        "department_code": "e1",
        "document_type_code": "p",
        "keywords": "nope",
        "description": 123,
    }
    ok, errs, norm = validate_document_payload(payload)
    assert ok is False
    # Ensure multiple error messages captured
    assert any("doc_code" in e for e in errs)
    assert any("title" in e for e in errs)
    assert any("company_code" in e for e in errs)
    assert any("subsidiary_code" in e for e in errs)
    assert any("department_code" in e for e in errs)
    assert any("document_type_code" in e for e in errs)
    assert any("keywords" in e for e in errs)
    assert any("description" in e for e in errs)
    assert norm == {}

