from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String, nullable=True)
    username = Column(String, nullable=True)

    classes = relationship("Class", back_populates="creator")
    rsvps = relationship("RSVP", back_populates="user")
    questions = relationship("Question", back_populates="user")

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, index=True)
    description = Column(String)
    class_time = Column(DateTime)
    creator_id = Column(Integer, ForeignKey("users.id"))

    creator = relationship("User", back_populates="classes")
    rsvps = relationship("RSVP", back_populates="class_")
    questions = relationship("Question", back_populates="class_")


class RSVP(Base):
    __tablename__ = "rsvps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    status = Column(String) # "yes", "no", "tentative"

    user = relationship("User", back_populates="rsvps")
    class_ = relationship("Class", back_populates="rsvps")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    text = Column(String)

    user = relationship("User", back_populates="questions")
    class_ = relationship("Class", back_populates="questions")
