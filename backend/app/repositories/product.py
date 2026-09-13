from typing import Optional

from sqlalchemy.orm import Session

from app.models.product import Product


class ProductRepository:
    def get_by_id(self, db: Session, product_id: str) -> Optional[Product]:
        return (
            db.query(Product)
            .filter(
                Product.id == product_id,
                Product.is_deleted.is_(False),
            )
            .first()
        )

    def get_by_slug(self, db: Session, slug: str) -> Optional[Product]:
        return (
            db.query(Product)
            .filter(
                Product.slug == slug,
                Product.is_deleted.is_(False),
            )
            .first()
        )

    def list(
        self,
        db: Session,
        *,
        active_only: bool = True,
        skip: int = 0,
        limit: int = 20,
    ) -> list[Product]:
        query = db.query(Product).filter(Product.is_deleted.is_(False))

        if active_only:
            query = query.filter(Product.is_active.is_(True))

        return (
            query.order_by(Product.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, db: Session, **kwargs) -> Product:
        product = Product(**kwargs)
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def update(self, db: Session, product: Product, **kwargs) -> Product:
        for field, value in kwargs.items():
            if value is not None:
                setattr(product, field, value)

        db.commit()
        db.refresh(product)
        return product

    def soft_delete(self, db: Session, product: Product) -> Product:
        product.is_deleted = True
        db.commit()
        db.refresh(product)
        return product


product_repository = ProductRepository()
