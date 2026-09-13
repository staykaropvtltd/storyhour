from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.product import ProductRepository


class ProductService:
    """
    Business service layer for Product operations.
    """

    def __init__(self, product_repo: Optional[ProductRepository] = None):
        self.product_repo = product_repo or ProductRepository()

    def get_product_by_id(
        self,
        db: Session,
        product_id: str,
    ) -> Optional[Product]:
        return self.product_repo.get_by_id(db, product_id)

    def get_product_by_slug(
        self,
        db: Session,
        slug: str,
    ) -> Optional[Product]:
        return self.product_repo.get_by_slug(db, slug)

    def list_products(
        self,
        db: Session,
        *,
        active_only: bool = True,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Product]:
        return self.product_repo.list(
            db,
            active_only=active_only,
            skip=skip,
            limit=limit,
        )

    def create_product(
        self,
        db: Session,
        **data,
    ) -> Product:
        return self.product_repo.create(db, **data)

    def update_product(
        self,
        db: Session,
        product: Product,
        **data,
    ) -> Product:
        return self.product_repo.update(db, product, **data)

    def delete_product(
        self,
        db: Session,
        product: Product,
    ) -> Product:
        return self.product_repo.soft_delete(db, product)


product_service = ProductService()
