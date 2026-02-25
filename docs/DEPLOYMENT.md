# Deployment Guide: VocabDash

Follow these steps to deploy your application for free using Render (Backend) and Vercel (Frontend).

## 1. Prerequisites
- GitHub repositories created and code pushed.
- Sign up for a free account on [Render.com](https://render.com).
- Sign up for a free account on [Vercel](https://vercel.com).
- A running PostgreSQL database (e.g., [Neon.tech](https://neon.tech)) and [Supabase](https://supabase.com) project.

## 2. Backend Deployment (Render.com)
1. Log in to Render and click **New > Web Service**.
2. Connect your GitHub repository.
3. Select the `backend` folder as the **Root Directory**.
4. **Runtime Settings**:
   - **Language**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   Add the following in the Render Dashboard:
   - `DATABASE_URL`: Your Neon/PostgreSQL connection string.
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_KEY`: Your Supabase Service Role or Anon Key.
   - `SECRET_KEY`: A secure random string for JWT signing.

## 3. Frontend Deployment (Vercel)
1. Log in to Vercel and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure the **Root Directory** to `frontend`.
4. **Framework Preset**: `Vite`.
5. **Environment Variables**:
   Add these in Vercel settings:
   - `VITE_API_URL`: The URL provided by Render (e.g., `https://vocab-backend.onrender.com`).
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
6. Click **Deploy**.

## 4. Post-Deployment (CORS)
Once you have your Vercel URL, update `backend/main.py` (or set an environment variable) to include your frontend URL in the `allow_origins` list of the `CORSMiddleware` setup.

---
**Note**: Ensure that all secrets are kept out of your code and only placed in the respective hosting platform's environment settings.
