from fastapi import FastAPI, Depends
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
