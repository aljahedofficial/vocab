import pytest
import uuid

def test_signup(client):
    email = f"test_{uuid.uuid4()}@example.com"
    response = client.post(
        "/auth/signup",
        json={"email": email, "password": "testpassword123"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == email

def test_login(client):
    # 1. Signup
    email = f"test_{uuid.uuid4()}@example.com"
    client.post(
        "/auth/signup",
        json={"email": email, "password": "testpassword123"}
    )
    
    # 2. Login
    response = client.post(
        "/auth/login",
        data={"username": email, "password": "testpassword123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_invalid_login(client):
    response = client.post(
        "/auth/login",
        data={"username": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"
