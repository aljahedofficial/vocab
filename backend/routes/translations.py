from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import UserTranslation, User
from ..schemas import UserTranslationCreate, UserTranslationResponse, SuggestionResponse, BatchTranslationRequest
from .auth import get_current_user
from deep_translator import GoogleTranslator

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

@router.post("/batch", response_model=List[UserTranslationResponse])
def batch_translate(
    request: BatchTranslationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    translator = GoogleTranslator(source='en', target='bn')
    new_translations = []

    # Filter out words already translated by this user
    existing_words = db.query(UserTranslation.word).filter(
        UserTranslation.user_id == current_user.id,
        UserTranslation.word.in_([w.lower() for w in request.words])
    ).all()
    existing_word_set = {w[0] for w in existing_words}

    words_to_translate = [w.lower() for w in request.words if w.lower() not in existing_word_set]

    if not words_to_translate:
        return []

    try:
        # Use translate_batch if the list is small enough, or chunk it
        # deep-translator's GoogleTranslator supports translate_batch
        try:
            translations = translator.translate_batch(words_to_translate)
        except Exception as e:
            print(f"Batch translation error: {e}")
            # Fallback to individual translation if batch fails
            translations = []
            for word in words_to_translate:
                try:
                    translations.append(translator.translate(word))
                except:
                    translations.append(None)

        for word, translated in zip(words_to_translate, translations):
            if translated:
                new_trans = UserTranslation(
                    user_id=current_user.id,
                    word=word,
                    translation=translated
                )
                db.add(new_trans)
                new_translations.append(new_trans)
        
        db.commit()
        for t in new_translations:
            db.refresh(t)
            
        return new_translations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation service failed: {str(e)}")
