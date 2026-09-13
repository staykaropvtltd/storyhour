from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.repositories.cart import CartRepository
from app.repositories.product import ProductRepository


class CartService:
    """
    Business service layer for authenticated customer carts.
    """

    def __init__(
        self,
        cart_repo: Optional[CartRepository] = None,
        product_repo: Optional[ProductRepository] = None,
    ):
        self.cart_repo = cart_repo or CartRepository()
        self.product_repo = product_repo or ProductRepository()

    def get_or_create_cart(
        self,
        db: Session,
        user_id: str,
    ) -> Cart:
        return self.cart_repo.get_or_create_active_cart(
            db,
            user_id,
        )

    def get_cart_items(
        self,
        db: Session,
        cart: Cart,
    ) -> list[tuple[CartItem, Product]]:
        return self.cart_repo.list_items(
            db,
            cart.id,
        )

    def add_item(
        self,
        db: Session,
        user_id: str,
        product_id: str,
        quantity: int,
    ) -> tuple[Cart, CartItem]:
        product = self.product_repo.get_by_id(
            db,
            product_id,
        )

        if product is None or not product.is_active:
            raise ValueError("Product not found or inactive")

        cart = self.cart_repo.get_or_create_active_cart(
            db,
            user_id,
        )

        existing_item = self.cart_repo.get_item(
            db,
            cart.id,
            product_id,
        )

        if existing_item:
            item = self.cart_repo.update_item_quantity(
                db,
                existing_item,
                existing_item.quantity + quantity,
            )
            return cart, item

        deleted_item = self.cart_repo.get_any_item(
            db,
            cart.id,
            product_id,
        )

        if deleted_item:
            item = self.cart_repo.restore_item(
                db,
                deleted_item,
                quantity,
            )
            return cart, item

        item = self.cart_repo.create_item(
            db,
            cart.id,
            product_id,
            quantity,
        )

        return cart, item


    def update_item(
        self,
        db: Session,
        user_id: str,
        item_id: str,
        quantity: int,
    ) -> CartItem:
        cart = self.cart_repo.get_active_cart(
            db,
            user_id,
        )

        if cart is None:
            raise ValueError("Cart not found")

        item = self.cart_repo.get_item_by_id(
            db,
            cart.id,
            item_id,
        )

        if item is None:
            raise ValueError("Cart item not found")

        return self.cart_repo.update_item_quantity(
            db,
            item,
            quantity,
        )

    def remove_item(
        self,
        db: Session,
        user_id: str,
        item_id: str,
    ) -> None:
        cart = self.cart_repo.get_active_cart(
            db,
            user_id,
        )

        if cart is None:
            raise ValueError("Cart not found")

        item = self.cart_repo.get_item_by_id(
            db,
            cart.id,
            item_id,
        )

        if item is None:
            raise ValueError("Cart item not found")

        self.cart_repo.soft_delete_item(
            db,
            item,
        )

    def clear_cart(
        self,
        db: Session,
        user_id: str,
    ) -> None:
        cart = self.cart_repo.get_active_cart(
            db,
            user_id,
        )

        if cart is None:
            return

        items = self.cart_repo.list_items(
            db,
            cart.id,
        )

        for item, _product in items:
            self.cart_repo.soft_delete_item(
                db,
                item,
            )

    @staticmethod
    def calculate_totals(
        items: list[tuple[CartItem, Product]],
    ) -> tuple[Decimal, Decimal]:
        subtotal = sum(
            (
                product.price * item.quantity
                for item, product in items
            ),
            Decimal("0.00"),
        )

        return subtotal, subtotal


cart_service = CartService()
