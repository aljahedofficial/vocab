import os
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or "port" in DATABASE_URL:
    # Use a dummy sqlite URL if the env is missing or has placeholders
    DATABASE_URL = "sqlite:///./temp.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Supabase Configuration (for storage and direct API access)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or "your-" in SUPABASE_KEY:
    # Use a mock during testing if credentials aren't set
    from unittest.mock import MagicMock
    supabase = MagicMock()
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
