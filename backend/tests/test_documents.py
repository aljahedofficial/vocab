import pytest
from unittest.mock import patch, MagicMock
import io

def test_list_documents_empty(client):
    # Missing auth header should fail
    response = client.get("/documents/")
    assert response.status_code == 401

def test_upload_document_mock(client):
    # Mocking supabase storage upload
    with patch("backend.routes.documents.supabase.storage.from_") as mock_storage:
        mock_bucket = MagicMock()
        mock_storage.return_value = mock_bucket
        mock_bucket.upload.return_value = MagicMock(error=None)

        # First signup/login to get token
        email = "doc_test@example.com"
        client.post("/auth/signup", json={"email": email, "password": "password"})
        login_res = client.post("/auth/login", data={"username": email, "password": "password"})
        token = login_res.json()["access_token"]

        # Upload
        file_content = b"This is a test document with some words words."
        response = client.post(
            "/documents/upload",
            files={"file": ("test.txt", file_content, "text/plain")},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["filename"] == "test.txt"

def test_process_document_mock(client):
    with patch("backend.routes.documents.supabase.storage.from_") as mock_storage:
        # Mock download
        mock_bucket = MagicMock()
        mock_storage.return_value = mock_bucket
        mock_bucket.download.return_value = b"Hello world hello"
        mock_bucket.upload.return_value = MagicMock(error=None)

        # Login
        email = "proc_test@example.com"
        client.post("/auth/signup", json={"email": email, "password": "password"})
        login_res = client.post("/auth/login", data={"username": email, "password": "password"})
        token = login_res.json()["access_token"]

        # 1. Upload
        up_res = client.post(
            "/documents/upload",
            files={"file": ("test.txt", b"dummy", "text/plain")},
            headers={"Authorization": f"Bearer {token}"}
        )
        doc_id = up_res.json()["id"]

        # 2. Process
        proc_res = client.post(
            f"/documents/{doc_id}/process",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert proc_res.status_code == 200
        
        # 3. Verify frequencies
        words_res = client.get(
            f"/documents/{doc_id}/words",
            headers={"Authorization": f"Bearer {token}"}
        )
        data = {w["word"]: w["frequency"] for w in words_res.json()}
        assert data["hello"] == 2
        assert data["world"] == 1
