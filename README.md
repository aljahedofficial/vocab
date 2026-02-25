# Word Frequency Dashboard 🚀

A comprehensive tool for analyzing vocabulary frequency in documents (PDF, DOCX, TXT), managing translations, and visualizing data.

## Features
- **Smart Analysis**: Extract word frequencies with automatic tokenization.
- **Translation System**: Global dictionary with Bangla meanings and auto-suggestions.
- **Visual Insights**: Interactive Bar and Pie charts for vocabulary distribution.
- **Multi-format Export**: Download results as CSV, Excel, or PDF.
- **Secure Auth**: JWT-based authentication with bcrypt security.
- **Modern UI**: Clean, premium dashboard built with React and Tailwind CSS 4.0.

## Tech Stack
- **Frontend**: Vite, React, Recharts, Tailwind CSS 4.0, Lucide React.
- **Backend**: FastAPI (Python), SQLAlchemy, Pytest.
- **Database**: PostgreSQL (Neon/Supabase) & Supabase Storage.

## Documentation
- [Architecture & Structure](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Setup Instructions

### 1. Prerequisite
- Python 3.12+
- Node.js 18+
- Docker (Optional)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set .env variables (see .env.example)
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Running with Docker
```bash
cd backend
docker build -t vocab-backend .
docker run -p 8000:8000 vocab-backend
```

## Testing
```bash
cd backend
python -m pytest
```

---
Built with ❤️ by Antigravity for Aljahed Official.
