"""Authentication helpers: password hashing, JWT, role checks, rate limiting."""
from __future__ import annotations

import hashlib
import hmac
import os
import re
import time
from collections import defaultdict, deque

import jwt

ROLES = ("patient", "clinician", "admin")
PBKDF2_ITERATIONS = 310_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iters, salt_hex, hash_hex = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(iters))
        return hmac.compare_digest(dk.hex(), hash_hex)
    except (ValueError, TypeError):
        return False


def password_problems(password: str) -> list[str]:
    """Return a list of human-readable problems; empty list means acceptable."""
    problems = []
    if len(password) < 10:
        problems.append("at least 10 characters")
    if not re.search(r"[a-z]", password) or not re.search(r"[A-Z]", password):
        problems.append("upper and lower case letters")
    if not re.search(r"\d", password):
        problems.append("a digit")
    return problems


def create_token(username: str, role: str, secret: str, ttl_seconds: int = 3600) -> str:
    if role not in ROLES:
        raise ValueError("unknown role")
    now = int(time.time())
    return jwt.encode({"sub": username, "role": role, "iat": now, "exp": now + ttl_seconds}, secret, algorithm="HS256")


def decode_token(token: str, secret: str) -> dict:
    """Raises jwt.InvalidTokenError (incl. expiry) on any problem."""
    return jwt.decode(token, secret, algorithms=["HS256"], options={"require": ["exp", "sub", "role"]})


class RateLimiter:
    """Sliding-window limiter, in-memory (use Redis when running several workers)."""

    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque] = defaultdict(deque)

    def allow(self, key: str, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        q = self._hits[key]
        while q and now - q[0] > self.window:
            q.popleft()
        if len(q) >= self.limit:
            return False
        q.append(now)
        return True
