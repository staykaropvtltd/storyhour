from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic SQLAlchemy 2.x repository.

    Repositories manage persistence operations but do not own transactions.
    The service/application layer is responsible for commit/rollback.
    """

    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """Fetch a single record by primary key."""
        return db.get(self.model, id)

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[ModelType]:
        """Fetch paginated records with optional exact-match filters."""
        stmt = select(self.model)

        if filters:
            for field, value in filters.items():
                column = getattr(self.model, field, None)
                if column is not None and value is not None:
                    stmt = stmt.where(column == value)

        stmt = stmt.offset(skip).limit(limit)
        return list(db.scalars(stmt).all())

    def count(
        self,
        db: Session,
        filters: Optional[Dict[str, Any]] = None,
    ) -> int:
        """Count records matching optional exact-match filters."""
        stmt = select(func.count()).select_from(self.model)

        if filters:
            for field, value in filters.items():
                column = getattr(self.model, field, None)
                if column is not None and value is not None:
                    stmt = stmt.where(column == value)

        return db.scalar(stmt) or 0

    def create(
        self,
        db: Session,
        *,
        obj_in: Union[Dict[str, Any], Any],
    ) -> ModelType:
        """Create and flush a model instance without committing."""
        if isinstance(obj_in, dict):
            obj_data = obj_in
        elif hasattr(obj_in, "model_dump"):
            obj_data = obj_in.model_dump()
        else:
            obj_data = obj_in.dict()

        db_obj = self.model(**obj_data)
        db.add(db_obj)
        db.flush()
        db.refresh(db_obj)

        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[Dict[str, Any], Any],
    ) -> ModelType:
        """Update a model instance without committing."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        elif hasattr(obj_in, "model_dump"):
            update_data = obj_in.model_dump(exclude_unset=True)
        else:
            update_data = obj_in.dict(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        db.add(db_obj)
        db.flush()
        db.refresh(db_obj)

        return db_obj

    def remove(
        self,
        db: Session,
        *,
        id: Any,
    ) -> Optional[ModelType]:
        """Delete a record without committing."""
        obj = db.get(self.model, id)

        if obj is not None:
            db.delete(obj)
            db.flush()

        return obj
