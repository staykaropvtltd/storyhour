from typing import Optional

from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem
from app.models.product import Product


class CartRepository:
    def get_active_cart(
        self,
        db: Session,
        user_id: str,
    ) -> Optional[Cart]:
        return (
            db.query(Cart)
            .filter(
                Cart.user_id == user_id,
                Cart.status == "active",
                Cart.is_deleted.is_(False),
            )
            .first()
        )

    def get_cart_by_id(
        self,
        db: Session,
        cart_id: str,
    ) -> Optional[Cart]:
        return (
            db.query(Cart)
            .filter(
                Cart.id == cart_id,
                Cart.is_deleted.is_(False),
            )
            .first()
        )

    def create_cart(
        self,
        db: Session,
        user_id: str,
    ) -> Cart:
        cart = Cart(
            user_id=user_id,
            status="active",
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)
        return cart

    def get_or_create_active_cart(
        self,
        db: Session,
        user_id: str,
    ) -> Cart:
        cart = self.get_active_cart(db, user_id)

        if cart:
            return cart

        return self.create_cart(db, user_id)

    def get_item(
        self,
        db: Session,
        cart_id: str,
        product_id: str,
    ) -> Optional[CartItem]:
        return (
            db.query(CartItem)
            .filter(
                CartItem.cart_id == cart_id,
                CartItem.product_id == product_id,
                CartItem.is_deleted.is_(False),
            )
            .first()
        )

    def get_any_item(
        self,
        db: Session,
        cart_id: str,
        product_id: str,
    ) -> Optional[CartItem]:
        return (
            db.query(CartItem)
            .filter(
                CartItem.cart_id == cart_id,
                CartItem.product_id == product_id,
            )
            .first()
        )

    def restore_item(
        self,
        db: Session,
        item: CartItem,
        quantity: int,
    ) -> CartItem:
        item.is_deleted = False
        item.deleted_at = None
        item.quantity = quantity
        db.commit()
        db.refresh(item)
        return item

    def get_item_by_id(
        self,
        db: Session,
        cart_id: str,
        item_id: str,
    ) -> Optional[CartItem]:
        return (
            db.query(CartItem)
            .filter(
                CartItem.id == item_id,
                CartItem.cart_id == cart_id,
                CartItem.is_deleted.is_(False),
            )
            .first()
        )

    def list_items(
        self,
        db: Session,
        cart_id: str,
    ) -> list[tuple[CartItem, Product]]:
        return (
            db.query(CartItem, Product)
            .join(Product, Product.id == CartItem.product_id)
            .filter(
                CartItem.cart_id == cart_id,
                CartItem.is_deleted.is_(False),
                Product.is_deleted.is_(False),
            )
            .order_by(CartItem.created_at.asc())
            .all()
        )

    def create_item(
        self,
        db: Session,
        cart_id: str,
        product_id: str,
        quantity: int,
    ) -> CartItem:
        item = CartItem(
            cart_id=cart_id,
            product_id=product_id,
            quantity=quantity,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_item_quantity(
        self,
        db: Session,
        item: CartItem,
        quantity: int,
    ) -> CartItem:
        item.quantity = quantity
        db.commit()
        db.refresh(item)
        return item

    def soft_delete_item(
        self,
        db: Session,
        item: CartItem,
    ) -> CartItem:
        item.is_deleted = True
        db.commit()
        db.refresh(item)
        return item

    def soft_delete_cart(
        self,
        db: Session,
        cart: Cart,
    ) -> Cart:
        cart.is_deleted = True
        db.commit()
        db.refresh(cart)
        return cart
