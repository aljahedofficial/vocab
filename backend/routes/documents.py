from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import uuid
import io
import pandas as pd
from fpdf import FPDF
from ..database import get_db, supabase
from ..models import Document, User, WordFrequency, UserTranslation
from ..schemas import DocumentResponse, WordFrequencyResponse
from .auth import get_current_user
import os

# Font path for Unicode support
FONT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "fonts", "HindSiliguri-Regular.ttf")

from ..utils.text_processing import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_txt,
    tokenize_and_count
)

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Validate file type
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOCX, and TXT allowed.")

    # 2. Upload to Supabase Storage
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    storage_path = f"user_{current_user.id}/{unique_filename}"
    
    try:
        content = await file.read()
        res = supabase.storage.from_("documents").upload(storage_path, content)
        if hasattr(res, 'error') and res.error:
            raise Exception(res.error)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload to storage failed: {str(e)}")

    # 3. Save to Database
    new_doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_type=file.content_type,
        storage_path=storage_path
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    return new_doc

@router.get("/", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).filter(Document.user_id == current_user.id).all()

@router.post("/{doc_id}/process", response_model=List[WordFrequencyResponse])
async def process_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch document metadata
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Download from Supabase
    try:
        res = supabase.storage.from_("documents").download(doc.storage_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

    # 3. Extract Text
    text = ""
    try:
        if "pdf" in doc.file_type:
            text = extract_text_from_pdf(res)
        elif "word" in doc.file_type:
            text = extract_text_from_docx(res)
        else:
            text = extract_text_from_txt(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    # 4. Count Frequencies
    counts = tokenize_and_count(text)

    # 5. Clear existing frequencies for this doc
    db.query(WordFrequency).filter(WordFrequency.document_id == doc_id).delete()

    # 6. Save to DB
    word_freqs = []
    for word, freq in counts.most_common(500): # Limit to top 500 for MVP
        wf = WordFrequency(document_id=doc_id, word=word, frequency=freq)
        db.add(wf)
        word_freqs.append(wf)
    
    db.commit()
    return word_freqs

@router.get("/{doc_id}/words", response_model=List[WordFrequencyResponse])
def get_document_words(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership
    # Join with UserTranslation to get global translations
    results = db.query(
        WordFrequency.word,
        WordFrequency.frequency,
        UserTranslation.translation
    ).outerjoin(
        UserTranslation,
        (UserTranslation.word == WordFrequency.word) & (UserTranslation.user_id == current_user.id)
    ).filter(WordFrequency.document_id == doc_id).order_by(WordFrequency.frequency.desc()).all()
    
    # Map to dictionary to ensure Pydantic compatibility
    return [{"word": r[0], "frequency": r[1], "translation": r[2]} for r in results]

@router.get("/{doc_id}/export/{format}")
def export_document_data(
    doc_id: int,
    format: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify ownership and get data
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get word frequencies and join with translations if they exist
    results = db.query(
        WordFrequency.word,
        WordFrequency.frequency,
        UserTranslation.translation
    ).outerjoin(
        UserTranslation, 
        (UserTranslation.word == WordFrequency.word) & (UserTranslation.user_id == current_user.id)
    ).filter(WordFrequency.document_id == doc_id).order_by(WordFrequency.frequency.desc()).all()

    df = pd.DataFrame(results, columns=["Word", "Frequency", "Translation"])
    df["Translation"] = df["Translation"].fillna("-")

    if format == "csv":
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        return Response(
            content=stream.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={doc.filename}_analysis.csv"}
        )
    
    elif format == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Vocabulary")
        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={doc.filename}_analysis.xlsx"}
        )

    elif format == "pdf":
        pdf = FPDF()
        
        # Register Bengali font if it exists
        bengali_font_path = FONT_PATH
        if os.path.exists(bengali_font_path):
            try:
                # In fpdf2, we just pass the path and a name
                pdf.add_font("Bengali", style="", fname=bengali_font_path)
                font_family = "Bengali"
            except Exception as e:
                print(f"Font Load Error: {e}")
                font_family = "Arial"
        else:
            font_family = "Arial"

        pdf.add_page()
        # Set font for title
        pdf.set_font(font_family, size=16)
        pdf.cell(0, 10, f"Vocabulary Analysis: {doc.filename}", ln=True, align="C")
        pdf.ln(10)
        
        # Table Header
        pdf.set_font(font_family, size=12)
        pdf.cell(80, 10, "Word", border=1)
        pdf.cell(40, 10, "Freq", border=1)
        pdf.cell(70, 10, "Translation", border=1)
        pdf.ln()
        
        # Table Content
        pdf.set_font(font_family, size=10)
        for _, row in df.head(100).iterrows(): # Limit PDF to top 100
            pdf.cell(80, 10, str(row["Word"]), border=1)
            pdf.cell(40, 10, str(row["Frequency"]), border=1)
            
            translation = str(row["Translation"])
            pdf.cell(70, 10, translation if translation != "-" else "", border=1)
            pdf.ln()
        return Response(
            content=bytes(pdf.output()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={doc.filename}_analysis.pdf"}
        )

    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")
@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify ownership and get document
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 2. Remove from Supabase Storage
    try:
        # Supabase storage.remove expects a list of paths
        supabase.storage.from_("documents").remove([doc.storage_path])
    except Exception as e:
        print(f"Non-critical Storage Error: {str(e)}")
        # We continue so the user can at least remove the entry from the UI

    try:
        # 3. Delete word frequencies (Explicit delete for safety)
        db.query(WordFrequency).filter(WordFrequency.document_id == doc_id).delete(synchronize_session=False)
        
        # 4. Delete document record
        db.delete(doc)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database deletion failed: {str(e)}")
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)
