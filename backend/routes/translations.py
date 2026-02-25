from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import UserTranslation, User
from ..schemas import UserTranslationCreate, UserTranslationResponse, SuggestionResponse
from .auth import get_current_user

router = APIRouter(prefix="/translations", tags=["Translations"])

# Basic dictionary for common suggestions (free/local approach)
COMMON_DICTIONARY = {
    "government": ["সরকার", "প্রশাসন"],
    "election": ["নির্বাচন"],
    "people": ["জনগণ", "মানুষ"],
    "development": ["উন্নয়ন"],
    "country": ["দেশ"],
    "policy": ["নীতি", "নীতিমালা"],
    "system": ["পদ্ধতি", "ব্যবস্থা"],
    "process": ["প্রক্রিয়া"],
    "provide": ["প্রদান করা"],
    "support": ["সমর্থন", "সাহায্য"],
}

@router.post("/", response_model=UserTranslationResponse)
def save_translation(
    translation: UserTranslationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if a translation already exists for this word
    existing = db.query(UserTranslation).filter(
        UserTranslation.user_id == current_user.id,
        UserTranslation.word == translation.word.lower()
    ).first()

    if existing:
        existing.translation = translation.translation
        db.commit()
        db.refresh(existing)
        return existing

    new_trans = UserTranslation(
        user_id=current_user.id,
        word=translation.word.lower(),
        translation=translation.translation
    )
    db.add(new_trans)
    db.commit()
    db.refresh(new_trans)
    return new_trans

@router.get("/user", response_model=List[UserTranslationResponse])
def get_user_translations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(UserTranslation).filter(UserTranslation.user_id == current_user.id).all()

@router.get("/suggestions/{word}", response_model=SuggestionResponse)
def get_suggestions(word: str):
    word_lower = word.lower()
    suggestions = COMMON_DICTIONARY.get(word_lower, [])
    return {
        "word": word,
        "suggestions": suggestions,
        "is_common": len(suggestions) > 0
    }
