# Use official Python runtime as a parent image
FROM python:3.14-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Ensure core dependencies are installed (in case requirements.txt is missing some)
RUN pip install --no-cache-dir fastapi uvicorn python-multipart pydantic sqlalchemy psycopg2-binary python-jose[cryptography] bcrypt python-dotenv pdfplumber python-docx fpdf2 pandas openpyxl supabase==2.4.0

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
