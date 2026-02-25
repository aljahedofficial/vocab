from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DocumentBase(BaseModel):
    filename: str
    file_type: str

class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    upload_date: datetime

    class Config:
        from_attributes = True

class WordFrequencyResponse(BaseModel):
    word: str
    frequency: int
    translation: Optional[str] = None

    class Config:
        from_attributes = True

class UserTranslationBase(BaseModel):
    word: str
    translation: str

class UserTranslationCreate(UserTranslationBase):
    pass

class UserTranslationResponse(UserTranslationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SuggestionResponse(BaseModel):
    word: str
    suggestions: List[str]
    is_common: bool
