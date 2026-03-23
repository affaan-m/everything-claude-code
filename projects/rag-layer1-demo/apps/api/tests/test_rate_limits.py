"""
Tests for rate limiting behavior.

Each test uses a unique X-Forwarded-For IP derived from the test's node ID so
that rate-limit counters don't bleed across tests within the same process.
The limiter key_func now prefers X-Forwarded-For (proxy-aware), so passing
this header in tests gives us full control over the rate-limit bucket.
"""
import hashlib

import pytest


def _unique_ip(test_id: str) -> str:
    """Deterministic unique IP per test — avoids counter bleed between tests."""
    h = int(hashlib.md5(test_id.encode()).hexdigest()[:6], 16)
    return f"10.{(h >> 16) & 0xFF}.{(h >> 8) & 0xFF}.{h & 0xFF}"


def test_register_rate_limit(client):
    ip = _unique_ip("test_register_rate_limit")
    headers = {"X-Forwarded-For": ip}

    # Exhaust the 5/minute limit (endpoint: POST /api/v1/auth/register)
    for i in range(5):
        client.post(
            "/api/v1/auth/register",
            json={"email": f"rl_reg_{i}_{ip.replace('.', '')}@example.com", "password": "password123"},
            headers=headers,
        )

    # 6th request from same IP must be rate-limited
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": f"rl_reg_overflow_{ip.replace('.', '')}@example.com", "password": "password123"},
        headers=headers,
    )
    assert resp.status_code == 429


def test_login_rate_limit(client, registered_user):
    ip = _unique_ip("test_login_rate_limit")
    headers = {"X-Forwarded-For": ip}

    # Exhaust the 10/minute limit with wrong-password attempts (endpoint: POST /api/v1/auth/login)
    for _ in range(10):
        client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "wrongpassword"},
            headers=headers,
        )

    # 11th request from same IP must be rate-limited
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
        headers=headers,
    )
    assert resp.status_code == 429


def test_documents_list_rate_limit(client, auth_headers, project):
    ip = _unique_ip("test_documents_list_rate_limit")
    headers = {**auth_headers, "X-Forwarded-For": ip}

    for _ in range(60):
        client.get(f"/api/v1/projects/{project['id']}/documents", headers=headers)

    resp = client.get(f"/api/v1/projects/{project['id']}/documents", headers=headers)
    assert resp.status_code == 429
