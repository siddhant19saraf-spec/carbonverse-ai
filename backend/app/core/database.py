from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

_database_url = settings.sqlalchemy_database_url
_is_sqlite = _database_url.startswith("sqlite")

engine = create_engine(
    _database_url,
    pool_pre_ping=not _is_sqlite,
    **({} if _is_sqlite else {"pool_size": 10, "max_overflow": 20}),
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
