import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/wikigen"
)
DB_SEARCH_PATH = os.getenv("DB_SEARCH_PATH")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

if DB_SEARCH_PATH:

    @event.listens_for(engine, "connect")
    def _set_search_path(dbapi_connection, connection_record):
        with dbapi_connection.cursor() as cursor:
            cursor.execute(f"SET search_path TO {DB_SEARCH_PATH}")
        dbapi_connection.commit()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
