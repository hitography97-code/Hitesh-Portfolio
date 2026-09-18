import json
import os
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
DATABASE = ROOT / "portfolio.db"


def initialize_database():
    with sqlite3.connect(DATABASE) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


class PortfolioHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/messages":
            self.send_error(404, "Endpoint not found")
            return

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(content_length))
            name = str(payload.get("name", "")).strip()
            email = str(payload.get("email", "")).strip()
            subject = str(payload.get("subject", "Portfolio enquiry")).strip()
            message = str(payload.get("message", "")).strip()

            if not name or not email or not message:
                self.send_json({"error": "Name, email and message are required."}, 400)
                return

            with sqlite3.connect(DATABASE) as connection:
                cursor = connection.execute(
                    """
                    INSERT INTO messages (name, email, subject, message)
                    VALUES (?, ?, ?, ?)
                    """,
                    (name, email, subject or "Portfolio enquiry", message),
                )
                connection.commit()
                message_id = cursor.lastrowid

            self.send_json({"message": "Message saved successfully.", "id": message_id}, 201)
        except (ValueError, json.JSONDecodeError):
            self.send_json({"error": "Invalid request data."}, 400)

    def do_GET(self):
        if self.path == "/api/messages":
            with sqlite3.connect(DATABASE) as connection:
                connection.row_factory = sqlite3.Row
                rows = connection.execute(
                    """
                    SELECT id, name, email, subject, message, created_at
                    FROM messages
                    ORDER BY created_at DESC
                    """
                ).fetchall()

            self.send_json({"messages": [dict(row) for row in rows]})
            return

        super().do_GET()

    def send_json(self, payload, status=200):
        response = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)


if __name__ == "__main__":
    initialize_database()
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer((host, port), PortfolioHandler)
    print(f"Portfolio server listening on port {port}")
    print(f"Database: {DATABASE}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()
