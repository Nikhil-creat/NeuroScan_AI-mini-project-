"""Tiny SQLite layer (swap for PostgreSQL + SQLAlchemy in production)."""
from __future__ import annotations

import json
import sqlite3
import threading
import time
from pathlib import Path


class Database:
    def __init__(self, path: str | Path):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        with self._lock, self._conn:
            self._conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS users(
                  username TEXT PRIMARY KEY, pw_hash TEXT NOT NULL, role TEXT NOT NULL, created REAL NOT NULL);
                CREATE TABLE IF NOT EXISTS cases(
                  id TEXT PRIMARY KEY, owner TEXT NOT NULL, created REAL NOT NULL, status TEXT NOT NULL,
                  priority TEXT NOT NULL, prediction TEXT NOT NULL, result TEXT NOT NULL,
                  heatmap_b64 TEXT, review TEXT);
                """
            )

    # users
    def create_user(self, username: str, pw_hash: str, role: str) -> bool:
        try:
            with self._lock, self._conn:
                self._conn.execute("INSERT INTO users VALUES (?,?,?,?)", (username, pw_hash, role, time.time()))
            return True
        except sqlite3.IntegrityError:
            return False

    def get_user(self, username: str):
        with self._lock:
            return self._conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()

    # cases
    def add_case(self, case_id: str, owner: str, status: str, priority: str, prediction: dict, result: dict, heatmap_b64):
        with self._lock, self._conn:
            self._conn.execute(
                "INSERT INTO cases VALUES (?,?,?,?,?,?,?,?,NULL)",
                (case_id, owner, time.time(), status, priority, json.dumps(prediction), json.dumps(result), heatmap_b64),
            )

    def get_case(self, case_id: str):
        with self._lock:
            return self._conn.execute("SELECT * FROM cases WHERE id=?", (case_id,)).fetchone()

    def list_cases(self, owner: str | None = None):
        with self._lock:
            if owner:
                return self._conn.execute("SELECT * FROM cases WHERE owner=? ORDER BY created DESC", (owner,)).fetchall()
            return self._conn.execute(
                "SELECT * FROM cases ORDER BY (priority='high') DESC, created DESC"
            ).fetchall()

    def set_review(self, case_id: str, status: str, review: dict) -> None:
        with self._lock, self._conn:
            self._conn.execute("UPDATE cases SET status=?, review=? WHERE id=?", (status, json.dumps(review), case_id))
