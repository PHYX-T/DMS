from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import os

from src.core.documents.validator import is_valid_document_id


class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status: int = 200, content_type: str = "application/json") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.end_headers()

    # In-memory duplicate ID set for demo purposes
    DUPLICATE_IDS = {"ABC-XY-ENG-PRO-001", "DEF-GH-OPS-SOP-002"}

    def do_GET(self):  # noqa: N802 (keep method name per BaseHTTPRequestHandler)
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._set_headers(200, "text/plain")
            self.wfile.write(b"ok")
            return

        if parsed.path == "/" or parsed.path == "":
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
                    <li><code>GET /duplicate?id=ABC-XY-ENG-PRO-001</code> → duplicate check (in-memory)</li>
                    <li><code>GET /duplicates/add?id=ZZZ-ZZ-ZZZ-ZZZ-999</code> → add demo duplicate</li>
                    <li><code>GET /duplicates/clear</code> → clear demo duplicates</li>
                  </ul>
                </body>
                </html>
                """
            ).encode("utf-8")
            self.wfile.write(html)
            return

        if parsed.path == "/validate":
            params = parse_qs(parsed.query)
            doc_id = params.get("id", [""])[0]
            valid = is_valid_document_id(doc_id)
            self._set_headers(200)
            body = json.dumps({"id": doc_id, "valid": valid}).encode("utf-8")
            self.wfile.write(body)
            return

        if parsed.path == "/duplicate":
            params = parse_qs(parsed.query)
            doc_id = params.get("id", [""])[0]
            duplicate = doc_id in self.DUPLICATE_IDS
            self._set_headers(200)
            body = json.dumps({"id": doc_id, "duplicate": duplicate}).encode("utf-8")
            self.wfile.write(body)
            return

        if parsed.path == "/duplicates/add":
            params = parse_qs(parsed.query)
            doc_id = params.get("id", [""])[0]
            if doc_id:
                self.DUPLICATE_IDS.add(doc_id)
            self._set_headers(200)
            body = json.dumps({"added": bool(doc_id), "count": len(self.DUPLICATE_IDS)}).encode("utf-8")
            self.wfile.write(body)
            return

        if parsed.path == "/duplicates/clear":
            self.DUPLICATE_IDS.clear()
            self._set_headers(200)
            body = json.dumps({"cleared": True, "count": len(self.DUPLICATE_IDS)}).encode("utf-8")
            self.wfile.write(body)
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
