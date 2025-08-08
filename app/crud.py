from sqlalchemy.orm import Session, joinedload
from . import models, schemas

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_telegram_id(db: Session, telegram_id: int):
    return db.query(models.User).filter(models.User.telegram_id == telegram_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Class CRUD
def get_classes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Class).options(
        joinedload(models.Class.creator),
        joinedload(models.Class.rsvps).joinedload(models.RSVP.user)
    ).offset(skip).limit(limit).all()

def create_class(db: Session, class_data: schemas.ClassCreate, creator_id: int):
    db_class = models.Class(**class_data.model_dump(), creator_id=creator_id)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def delete_class(db: Session, class_id: int):
    db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not db_class:
        return None
    db.delete(db_class)
    db.commit()
    return db_class

# RSVP CRUD
def create_or_update_rsvp(db: Session, class_id: int, user_id: int, status: str):
    db_rsvp = db.query(models.RSVP).filter(models.RSVP.class_id == class_id, models.RSVP.user_id == user_id).first()
    if db_rsvp:
        db_rsvp.status = status
    else:
        db_rsvp = models.RSVP(class_id=class_id, user_id=user_id, status=status)
        db.add(db_rsvp)
    db.commit()
    db.refresh(db_rsvp)
    return db_rsvp

def update_class(db: Session, class_id: int, update_data: schemas.ClassUpdate):
    db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not db_class:
        return None

    update_data_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_data_dict.items():
        setattr(db_class, key, value)

    db.commit()
    db.refresh(db_class)
    return db_class
