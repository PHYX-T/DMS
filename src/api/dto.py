import json
from typing import Dict, List, Tuple

from src.core.documents.validator import is_valid_document_id


AllowedRole = {"End User", "Owner", "Controller", "Admin", "QMS"}


def validate_document_payload(payload: Dict) -> Tuple[bool, List[str], Dict]:
    """Validate and normalize incoming document creation payload.

    Required fields:
      - doc_code: matches document ID regex
      - title: non-empty string
      - company_code: 3 uppercase letters
      - subsidiary_code: 2 uppercase letters
      - department_code: 3 uppercase letters
      - document_type_code: 3 uppercase letters

    Returns (valid, errors, normalized_payload)
    """
    errors: List[str] = []
    norm: Dict = {}

    if not isinstance(payload, dict):
        return False, ["payload must be a JSON object"], {}

    # doc_code
    doc_code = payload.get("doc_code")
    if not isinstance(doc_code, str) or not is_valid_document_id(doc_code):
        errors.append("doc_code must match required schema")
    else:
        norm["doc_code"] = doc_code

    # title
    title = payload.get("title")
    if not isinstance(title, str) or not title.strip():
        errors.append("title is required")
    else:
        norm["title"] = title.strip()

    # codes
    def _upper_str(key: str, length: int) -> None:
        val = payload.get(key)
        if not isinstance(val, str) or len(val.strip()) != length or not val.strip().isalpha() or not val.strip().isupper():
            errors.append(f"{key} must be {length} uppercase letters")
        else:
            norm[key] = val.strip()

    _upper_str("company_code", 3)
    _upper_str("subsidiary_code", 2)
    _upper_str("department_code", 3)
    _upper_str("document_type_code", 3)

    # Optional fields
    for key in ("issue_date", "review_date"):
        if key in payload and payload[key] is not None:
            norm[key] = payload[key]

    if "keywords" in payload and payload["keywords"] is not None:
        if not isinstance(payload["keywords"], list) or not all(isinstance(k, str) for k in payload["keywords"]):
            errors.append("keywords must be a list of strings")
        else:
            norm["keywords"] = payload["keywords"]

    if "description" in payload and payload["description"] is not None:
        if not isinstance(payload["description"], str):
            errors.append("description must be a string")
        else:
            norm["description"] = payload["description"]

    return len(errors) == 0, errors, norm


def parse_json_body(raw: bytes) -> Dict:
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return {}

