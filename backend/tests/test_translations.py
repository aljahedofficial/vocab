import pytest
from uuid import uuid4

def test_save_translation(client):
    # 1. Signup/Login
    email = f"trans_{uuid4()}@example.com"
    client.post("/auth/signup", json={"email": email, "password": "password"})
    login_res = client.post("/auth/login", data={"username": email, "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Save translation
    payload = {
        "word": "government",
        "translation": "সরকার"
    }
    response = client.post("/translations/", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["word"] == "government"
    assert response.json()["translation"] == "সরকার"

def test_get_translation_suggestions(client):
    # This endpoint returning a Schema: { word, suggestions, is_common }
    response = client.get("/translations/suggestions/government")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["suggestions"], list)
    assert "সরকার" in data["suggestions"]

def test_fetch_user_translations(client):
    # 1. Setup Auth
    email = f"fetch_{uuid4()}@example.com"
    client.post("/auth/signup", json={"email": email, "password": "password"})
    login_res = client.post("/auth/login", data={"username": email, "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Save a few
    client.post("/translations/", json={"word": "test", "translation": "পরীক্ষা"}, headers=headers)
    
    # 3. Get list
    response = client.get("/translations/user", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["word"] == "test"
