#!/usr/bin/env python3
"""Mesa Dos static server.

Why this exists instead of "python3 -m http.server":

Cloudflare sits in front of this origin and, with no Cache-Control from the
server, it applies its own default edge TTL (4 hours) to .css/.js. That meant a
deploy could sit invisible behind a stale stylesheet for hours. This server
sends "no-cache, must-revalidate" with a Last-Modified timestamp, so the edge
has to ask the origin and an edit on disk is live on the next request.

No dependencies, intentionally. Run: python3 serve.py
"""
import os
import sys
import http.server
import socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("MEALS_PORT", "8101"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, must-revalidate, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        sys.stderr.write("mesa dos on http://127.0.0.1:%d\n" % PORT)
        httpd.serve_forever()
