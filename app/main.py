from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Serve static files for the frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse('static/index.html')

# API Endpoints
@app.post("/api/classes/", response_model=schemas.Class)
def create_class_endpoint(class_req: schemas.ClassCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new class. This endpoint will also create a new user if the
    creator's telegram_id is not found in the database.
    """
    user = crud.get_user_by_telegram_id(db, telegram_id=class_req.creator_telegram_id)
    if not user:
        user_in = schemas.UserCreate(
            telegram_id=class_req.creator_telegram_id,
            first_name=class_req.creator_first_name,
            last_name=class_req.creator_last_name,
            username=class_req.creator_username,
        )
        user = crud.create_user(db=db, user=user_in)

    class_in = schemas.ClassCreate(
        topic=class_req.topic,
        description=class_req.description,
        class_time=class_req.class_time
    )
    return crud.create_class(db=db, class_data=class_in, creator_id=user.id)


@app.get("/api/classes/", response_model=List[schemas.Class])
def read_classes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all classes.
    """
    classes = crud.get_classes(db, skip=skip, limit=limit)
    return classes

@app.post("/api/classes/{class_id}/rsvp", response_model=schemas.RSVP)
def rsvp_to_class(class_id: int, rsvp_req: schemas.RsvpRequest, db: Session = Depends(get_db)):
    """
    RSVP to a class. Creates or updates an RSVP.
    """
    user = crud.get_user_by_telegram_id(db, telegram_id=rsvp_req.telegram_id)
    if not user:
        # For simplicity, we create the user if they don't exist.
        # In a real app, you might want more robust user handling.
        user_in = schemas.UserCreate(
            telegram_id=rsvp_req.telegram_id,
            first_name=rsvp_req.first_name,
            last_name=rsvp_req.last_name,
            username=rsvp_req.username,
        )
        user = crud.create_user(db=db, user=user_in)

    # Check if class exists
    class_ = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")

    return crud.create_or_update_rsvp(db=db, class_id=class_id, user_id=user.id, status=rsvp_req.status)

@app.put("/api/classes/{class_id}", response_model=schemas.Class)
def update_class_endpoint(class_id: int, update_req: schemas.ClassUpdateRequest, db: Session = Depends(get_db)):
    """
    Update a class's topic, description, or time.
    Only the user who created the class can update it.
    """
    db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")

    # Ownership check
    user = crud.get_user_by_telegram_id(db, telegram_id=update_req.updater_telegram_id)
    if not user or db_class.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this class")

    updated_class = crud.update_class(db=db, class_id=class_id, update_data=update_req.update_data)
    if updated_class is None:
        raise HTTPException(status_code=404, detail="Class not found during update")
    return updated_class

@app.delete("/api/classes/{class_id}")
def delete_class_endpoint(class_id: int, deleter_telegram_id: int, db: Session = Depends(get_db)):
    """
    Delete a class. Only the user who created the class can delete it.
    """
    db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")

    # Ownership check
    user = crud.get_user_by_telegram_id(db, telegram_id=deleter_telegram_id)
    if not user or db_class.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this class")

    deleted_class = crud.delete_class(db=db, class_id=class_id)
    if deleted_class is None:
        raise HTTPException(status_code=404, detail="Class not found during delete")
    return {"status": "deleted", "class_id": class_id}
