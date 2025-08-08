from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Pydantic models for Users
class UserBase(BaseModel):
    telegram_id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# Pydantic models for Questions
class QuestionBase(BaseModel):
    text: str

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    user_id: int
    class_id: int
    user: User

    class Config:
        from_attributes = True

# Pydantic models for RSVPs
class RSVPBase(BaseModel):
    status: str

class RSVPCreate(RSVPBase):
    pass

class RsvpRequest(BaseModel):
    telegram_id: int
    status: str # "yes", "no", "tentative"
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None

class RSVP(RSVPBase):
    id: int
    user_id: int
    class_id: int
    user: User

    class Config:
        from_attributes = True

# Pydantic models for Classes
class ClassBase(BaseModel):
    topic: str
    description: str
    class_time: datetime

class ClassCreate(ClassBase):
    pass

class ClassCreateRequest(ClassBase):
    creator_telegram_id: int
    creator_first_name: str
    creator_last_name: Optional[str] = None
    creator_username: Optional[str] = None

class ClassUpdate(BaseModel):
    topic: Optional[str] = None
    description: Optional[str] = None
    class_time: Optional[datetime] = None

class ClassUpdateRequest(BaseModel):
    updater_telegram_id: int
    update_data: ClassUpdate

class Class(ClassBase):
    id: int
    creator_id: int
    creator: User
    rsvps: List[RSVP] = []
    questions: List[Question] = []

    class Config:
        from_attributes = True
