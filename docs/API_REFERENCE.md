# VocabDash API Reference

The backend provides a RESTful API built with FastAPI. Interactive documentation is available at `/docs` (Swagger) when the server is running.

## Authentication

### POST `/auth/signup`
Creates a new user account.
- **Body**: `{ "email": "user@example.com", "password": "password" }`
- **Response**: User object.

### POST `/auth/login`
Authenticates a user and returns a token.
- **Body**: Form data (`username`, `password`).
- **Response**: `{ "access_token": "...", "token_type": "bearer" }`

---

## Documents

### GET `/documents/`
Lists all documents uploaded by the current user.
- **Auth**: Required.
- **Response**: List of document objects.

### POST `/documents/upload`
Uploads a document to storage.
- **Auth**: Required.
- **Body**: Multipart file (PDF, DOCX, TXT).
- **Response**: Document metadata.

### POST `/documents/{doc_id}/process`
Triggers word frequency analysis for a document.
- **Auth**: Required.
- **Response**: List of word frequency counts.

### GET `/documents/{doc_id}/words`
Retrieves word frequency data for a document.
- **Auth**: Required.
- **Response**: List of `{ "word": "...", "frequency": N, "translation": "..." }`

### GET `/documents/{doc_id}/export/{format}`
Downloads analysis results.
- **Formats**: `csv`, `excel`, `pdf`.
- **Auth**: Required.
- **Response**: File download.

---

## Translations

### POST `/translations/`
Saves or updates a custom translation for a word.
- **Auth**: Required.
- **Body**: `{ "word": "...", "translation": "..." }`
- **Response**: Saved translation object.

### GET `/translations/user`
Lists all translations saved by the current user.
- **Auth**: Required.
- **Response**: List of translations.

### GET `/translations/suggestions/{word}`
Get translated suggestions for a word.
- **Response**: `{ "word": "...", "suggestions": [...], "is_common": bool }`
