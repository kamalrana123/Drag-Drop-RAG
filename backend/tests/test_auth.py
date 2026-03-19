import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_register_and_login(client):
    payload = {"email": "test@example.com", "password": "secret123"}

    r = await client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data

    r2 = await client.post("/api/v1/auth/login", json=payload)
    assert r2.status_code == 200
    assert "access_token" in r2.json()


@pytest.mark.asyncio
async def test_me_requires_auth(client):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 403  # No bearer token
