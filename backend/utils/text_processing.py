import re
import io
import pdfplumber
from docx import Document
from collections import Counter

# Comprehensive English Stop Words (Extended)
ENGLISH_STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'down', 'out', 'over', 'under',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'of', 'has', 'have', 'had',
    'be', 'been', 'being', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could',
    'may', 'might', 'must', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'any',
    'as', 'because', 'before', 'below', 'between', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'don', 'just', 'shouldn', 'now'
}

# Date Related Words (Months, Days)
DATE_WORDS = {
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
    'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'today', 'yesterday', 'tomorrow', 'date'
}

# Web & Meta Noise
WEB_NOISE = {
    'http', 'https', 'www', 'com', 'edu', 'gov', 'org', 'net', 'mail', 'email', 'gmail', 'hotmail', 'outlook',
    'aljahedofficial', 'phone', 'mobile', 'cell', 'fax'
}

# Bengali Stop Words
BENGALI_STOP_WORDS = {
    'এবং', 'কিন্তু', 'অথবা', 'যদি', 'তবে', 'হয়', 'হয়ত', 'ছিল', 'করে', 'করা', 'হতে', 'থেকে', 'ও', 'আর'
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
    # Lowercase and remove punctuation (keeps only letters and spaces)
    text = text.lower()
    
    # Regex for words: Support both English and Bengali characters
    # Note: re.UNICODE helps with Bengali. We only keep alphabetic words.
    words = re.findall(r'[a-z\u0980-\u09ff]{2,}', text) # Minimum 2 letters to start, will filter more below
    
    filtered_words = []
    for word in words:
        # 1. Skip if contains any numbers
        if any(char.isdigit() for char in word):
            continue
            
        # 2. Skip if <= 2 characters (as requested)
        if len(word) <= 2:
            continue
            
        # 3. Skip English/Bengali stop words
        if word in ENGLISH_STOP_WORDS or word in BENGALI_STOP_WORDS:
            continue
            
        # 4. Skip Date/Web noise
        if word in DATE_WORDS or word in WEB_NOISE:
            continue
            
        filtered_words.append(word)
    
    return Counter(filtered_words)
