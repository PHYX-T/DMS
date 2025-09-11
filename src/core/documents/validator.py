import os
import re
from typing import Iterable


# Default regex for document IDs: AAA-BB-CCC-DDD-XXX (where XXX is numeric)
DEFAULT_ID_REGEX = r"^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\d{3}$"


def _get_id_pattern() -> re.Pattern[str]:
    pattern = os.getenv("DOCUMENT_ID_REGEX", DEFAULT_ID_REGEX)
    return re.compile(pattern)


def is_valid_document_id(doc_id: str) -> bool:
    """Return True if the document ID matches the required schema.

    The pattern can be overridden with the environment variable
    `DOCUMENT_ID_REGEX` if needed; otherwise the default is used.
    """
    if not isinstance(doc_id, str):
        return False
    return bool(_get_id_pattern().match(doc_id))


def is_duplicate_id(doc_id: str, existing_ids: Iterable[str]) -> bool:
    """Return True if `doc_id` exists within `existing_ids` (case-sensitive)."""
    return doc_id in set(existing_ids)

