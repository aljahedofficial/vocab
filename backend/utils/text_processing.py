import re
import io
import pdfplumber
from docx import Document
from collections import Counter

# Common English Stop Words
ENGLISH_STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'down', 'out', 'over', 'under',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'of'
}

# Common Bengali Stop Words (Placeholder)
BENGALI_STOP_WORDS = {
    'এবং', 'কিন্তু', 'অথবা', 'যদি', 'তবে', 'হয়', 'হয়ত', 'ছিল', 'করে', 'করা', 'হতে', 'থেকে'
}

def extract_text_from_pdf(content: bytes) -> str:
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(content: bytes) -> str:
    return content.decode("utf-8")

def tokenize_and_count(text: str) -> Counter:
    # Lowercase and remove punctuation
    text = text.lower()
    # Support both English and Bengali characters
    words = re.findall(r'[\w]+', text, re.UNICODE)
    
    # Filter out stop words and short particles
    filtered_words = [
        word for word in words 
        if word not in ENGLISH_STOP_WORDS 
        and word not in BENGALI_STOP_WORDS
        and len(word) > 1
    ]
    
    return Counter(filtered_words)
