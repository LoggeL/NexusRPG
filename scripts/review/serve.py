#!/usr/bin/env python3
"""Kleiner Review-Server: Figuren-Review-Seite + fertige Spiel-Assets + Feedback-Speicher.

Aufruf: python3 scripts/review/serve.py [port]   (Standard 5210, nur 127.0.0.1; öffentlich über cloudflared)
Ausgeliefert wird NUR: / (output/review/characters/index.html), /assets/{photos,portraits,sprites,cut,props}/…
Feedback: GET/POST /api/feedback ↔ output/review/feedback.json
"""
from __future__ import annotations

import json
import mimetypes
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[2]
PAGE = ROOT / "output/review/characters/index.html"
FEEDBACK = ROOT / "output/review/feedback.json"
ASSETS = (ROOT / "game/public/assets").resolve()
ALLOWED = {"photos", "portraits", "sprites", "cut", "props"}
mimetypes.add_type("image/webp", ".webp")


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, body: bytes, ctype: str, cache: bool = False) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "public, max-age=300" if cache else "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        path = unquote(urlparse(self.path).path)
        if path in ("/", "/index.html"):
            return self._send(200, PAGE.read_bytes(), "text/html; charset=utf-8")
        if path == "/api/feedback":
            data = FEEDBACK.read_bytes() if FEEDBACK.exists() else b'{"votes":{},"notes":{}}'
            return self._send(200, data, "application/json")
        parts = path.strip("/").split("/")
        if len(parts) >= 3 and parts[0] == "assets" and parts[1] in ALLOWED:
            f = (ASSETS / "/".join(parts[1:])).resolve()
            if f.is_file() and ASSETS in f.parents:
                return self._send(200, f.read_bytes(), mimetypes.guess_type(f.name)[0] or "application/octet-stream", True)
        self._send(404, b"nicht gefunden", "text/plain; charset=utf-8")

    def do_POST(self) -> None:  # noqa: N802
        if urlparse(self.path).path != "/api/feedback":
            return self._send(404, b"", "text/plain")
        n = int(self.headers.get("Content-Length", 0))
        if n > 1_000_000:
            return self._send(413, b"zu gross", "text/plain")
        try:
            data = json.loads(self.rfile.read(n))
            clean = {"votes": {str(k): v for k, v in dict(data.get("votes", {})).items() if v in ("ok", "redo")},
                     "notes": {str(k): str(v)[:4000] for k, v in dict(data.get("notes", {})).items()}}
        except Exception:
            return self._send(400, b"ungueltig", "text/plain")
        FEEDBACK.parent.mkdir(parents=True, exist_ok=True)
        FEEDBACK.write_text(json.dumps(clean, indent=2, ensure_ascii=False))
        self._send(200, b'{"ok":true}', "application/json")

    def log_message(self, fmt: str, *args) -> None:
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5210
    print(f"Review-Server auf http://127.0.0.1:{port}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
