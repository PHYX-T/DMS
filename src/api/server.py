from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import os
import mimetypes
from pathlib import Path

from src.core.documents.validator import is_valid_document_id
from src.api.db import exists_document_by_code, fetch_code_options
from src.api.dto import parse_json_body, validate_document_payload
from src.api.repositories.documents import DocumentsRepository

ROOT_DIR = Path(__file__).resolve().parents[2]
UI_DIR = (ROOT_DIR / os.getenv("UI_DIR", "frontend/dist")).resolve()


class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status: int = 200, content_type: str = "application/json") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.end_headers()

    # In-memory duplicate ID set for demo purposes
    DUPLICATE_IDS = {"ABC-XY-ENG-PRO-001", "DEF-GH-OPS-SOP-002"}
    repo = DocumentsRepository()

    def _forbidden(self, message: str = "forbidden") -> None:
        self._set_headers(403, "application/json")
        self.wfile.write(json.dumps({"error": message}).encode("utf-8"))

    def _require_role(self, allowed: set[str]) -> bool:
        # Simple header-based RBAC stub: X-Role: Admin|Controller|QMS|Owner|End User
        role = self.headers.get("X-Role", "").strip()
        if not role or role not in allowed:
            self._forbidden("role not permitted")
            return False
        return True

    def _serve_file(self, file_path: Path) -> None:
        try:
            data = file_path.read_bytes()
        except Exception:
            self._set_headers(404, "text/plain")
            self.wfile.write(b"not found")
            return
        ctype, _ = mimetypes.guess_type(str(file_path))
        self._set_headers(200, ctype or "application/octet-stream")
        self.wfile.write(data)

    def do_GET(self):  # noqa: N802 (keep method name per BaseHTTPRequestHandler)
        parsed = urlparse(self.path)
        path = parsed.path or "/"

        # Support '/api/*' prefix by rewriting to bare endpoints for convenience
        if path.startswith("/api/"):
            path = path[4:] or "/"

        if path == "/health":
            self._set_headers(200, "text/plain")
            self.wfile.write(b"ok")
            return

        # Serve built UI at /ui and /ui/* if available
        if path == "/ui" or path.startswith("/ui/"):
            rel = path[len("/ui/") :] if path.startswith("/ui/") else "index.html"
            file_path = UI_DIR / (rel or "index.html")
            if file_path.is_dir() or not file_path.exists():
                file_path = UI_DIR / "index.html"
            return self._serve_file(file_path)

        if path == "/" or path == "":
            self._set_headers(200, "text/html; charset=utf-8")
            html = (
                """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <title>Specs-Kit DMS API</title>
                  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;margin:2rem;line-height:1.4} code{background:#f5f5f5;padding:.1rem .3rem;border-radius:.25rem}</style>
                </head>
                <body>
                  <h1>Specs-Kit DMS API</h1>
                  <p>Server is running. Useful endpoints:</p>
                  <ul>
                    <li><code>GET /health</code> → health check</li>
                    <li><code>GET /validate?id=ABC-XY-ENG-PRO-001</code> → validate document ID</li>
                    <li><code>GET /duplicate?id=ABC-XY-ENG-PRO-001</code> → duplicate check (DB-backed when configured)</li>
                    <li><code>GET /duplicates/add?id=ZZZ-ZZ-ZZZ-ZZZ-999</code> → add demo duplicate</li>
                    <li><code>GET /duplicates/clear</code> → clear demo duplicates</li>
                    <li><code>GET /documents?code=&lt;DOC_CODE&gt;</code> → fetch document by code</li>
                  </ul>
                  <p>Frontend UI (if built):</p>
                  <ul>
                    <li><code>GET /ui</code> → serve UI from <code>frontend/dist</code></li>
                  </ul>
                </body>
                </html>
                """
            ).encode("utf-8")
            self.wfile.write(html)
            return

        if path == "/validate":
            params = parse_qs(parsed.query)
            doc_id = params.get("id", [""])[0]
            valid = is_valid_document_id(doc_id)
            self._set_headers(200)
            body = json.dumps({"id": doc_id, "valid": valid}).encode("utf-8")
            self.wfile.write(body)
            return

        if path == "/codes":
            # Try DB-backed code lists; fallback to static seeds
            codes = fetch_code_options()
            if codes is None:
                codes = {
                    "companies": [
                        {"value": "ABC", "code": "ABC", "name": "Acme Base Company", "label": "ABC — Acme Base Company"},
                    ],
                    "subsidiaries": [
                        {"value": "HQ", "code": "HQ", "name": "Headquarters", "label": "HQ — Headquarters"},
                        {"value": "EU", "code": "EU", "name": "Europe", "label": "EU — Europe"},
                        {"value": "US", "code": "US", "name": "United States", "label": "US — United States"},
                    ],
                    "departments": [
                        {"value": "ENG", "code": "ENG", "name": "Engineering", "label": "ENG — Engineering"},
                        {"value": "OPS", "code": "OPS", "name": "Operations", "label": "OPS — Operations"},
                        {"value": "QMS", "code": "QMS", "name": "Quality Management", "label": "QMS — Quality Management"},
                    ],
                    "types": [
                        {"value": "PRO", "code": "PRO", "name": "Procedure", "label": "PRO — Procedure"},
                        {"value": "POL", "code": "POL", "name": "Policy", "label": "POL — Policy"},
                        {"value": "WRK", "code": "WRK", "name": "Work Instruction", "label": "WRK — Work Instruction"},
                    ],
                }
            self._set_headers(200)
            self.wfile.write(json.dumps(codes).encode("utf-8"))
            return

        if path == "/documents":
            params = parse_qs(parsed.query)
            code = params.get("code", [""])[0]
            if not is_valid_document_id(code):
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "invalid doc_code"}).encode("utf-8"))
                return
            doc = self.repo.get_by_code(code)
            if not doc:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "not found"}).encode("utf-8"))
                return
            self._set_headers(200)
            self.wfile.write(json.dumps(doc, default=str).encode("utf-8"))
            return

        if path == "/duplicate":
            params = parse_qs(parsed.query)
            doc_id = params.get("id", [""])[0]
            duplicate = False
            if is_valid_document_id(doc_id):
                # Prefer DB-backed check when available; fallback to in-memory set.
                db_result = exists_document_by_code(doc_id)
                if db_result is None:
                    duplicate = doc_id in self.DUPLICATE_IDS
                else:
                    duplicate = bool(db_result)
            else:
                duplicate = False
            self._set_headers(200)
            body = json.dumps({"id": doc_id, "duplicate": duplicate}).encode("utf-8")
            self.wfile.write(body)
            return

        if path == "/duplicates/add":
            params = parse_qs(parsed.query)
            doc_id = params.get("id", [""])[0]
            if doc_id:
                self.DUPLICATE_IDS.add(doc_id)
            self._set_headers(200)
            body = json.dumps({"added": bool(doc_id), "count": len(self.DUPLICATE_IDS)}).encode("utf-8")
            self.wfile.write(body)
            return

        if path == "/duplicates/clear":
            self.DUPLICATE_IDS.clear()
            self._set_headers(200)
            body = json.dumps({"cleared": True, "count": len(self.DUPLICATE_IDS)}).encode("utf-8")
            self.wfile.write(body)
            return

        # If UI exists, serve SPA fallback for unknown paths under UI root
        if UI_DIR.exists() and (UI_DIR / "index.html").exists():
            return self._serve_file(UI_DIR / "index.html")
        self._set_headers(404, "text/plain")
        self.wfile.write(b"not found")

    def do_POST(self):  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/documents":
            # RBAC: only Controller/Admin/QMS may create
            if not self._require_role({"Controller", "Admin", "QMS"}):
                return
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length > 0 else b"{}"
            payload = parse_json_body(raw)
            valid, errors, norm = validate_document_payload(payload)
            if not valid:
                self._set_headers(400)
                self.wfile.write(json.dumps({"errors": errors}).encode("utf-8"))
                return
            created = self.repo.create(norm)
            if not created:
                # Could be FK failure or unique violation; keep message generic.
                self._set_headers(409)
                self.wfile.write(json.dumps({"error": "conflict or invalid metadata"}).encode("utf-8"))
                return
            self._set_headers(201)
            self.wfile.write(json.dumps(created, default=str).encode("utf-8"))
            return

        self._set_headers(404, "text/plain")
        self.wfile.write(b"not found")


def main() -> None:
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    server = HTTPServer((host, port), Handler)
    print(f"API server listening on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
