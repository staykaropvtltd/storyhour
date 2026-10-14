import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * Pure cart calculation and state manipulation engine
 * matching the LibraryCartContext business logic.
 */
class CartEngine {
  constructor(initialItems = []) {
    this.items = [...initialItems];
  }

  addItem(product, quantity = 1) {
    if (!product || !product.id || typeof product.price !== "number") {
      return false;
    }
    const cleanQty = Math.max(1, Math.floor(quantity) || 1);
    const existingIndex = this.items.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += cleanQty;
    } else {
      this.items.push({
        id: product.id,
        title: product.title || "Untitled Product",
        price: Math.max(0, product.price),
        format: product.format || "Hardcover",
        type: product.type || "book",
        quantity: cleanQty,
      });
    }
    return true;
  }

  updateQuantity(id, quantity) {
    const cleanQty = Math.floor(quantity);
    if (cleanQty <= 0) {
      this.removeItem(id);
      return;
    }
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.quantity = cleanQty;
    }
  }

  removeItem(id) {
    this.items = this.items.filter((i) => i.id !== id);
  }

  clear() {
    this.items = [];
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    const raw = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    return Math.round(raw * 100) / 100;
  }

  formatPrice(amount, currency = "GBP") {
    if (currency === "GBP") {
      return `£${amount.toFixed(2)}`;
    }
    return `${amount.toFixed(2)} ${currency}`;
  }
}

describe("Shopping Cart Calculation & State Logic", () => {
  describe("Adding Items & Merging Quantities", () => {
    test("adds a single item with default quantity", () => {
      const cart = new CartEngine();
      const added = cart.addItem({ id: "book-1", title: "Ramayana Volume 1", price: 14.99 });

      assert.equal(added, true);
      assert.equal(cart.getItemCount(), 1);
      assert.equal(cart.getSubtotal(), 14.99);
      assert.equal(cart.formatPrice(cart.getSubtotal()), "£14.99");
    });

    test("increments quantity when adding an existing item", () => {
      const cart = new CartEngine();
      cart.addItem({ id: "book-1", title: "Ramayana Volume 1", price: 14.99 }, 1);
      cart.addItem({ id: "book-1", title: "Ramayana Volume 1", price: 14.99 }, 2);

      assert.equal(cart.items.length, 1);
      assert.equal(cart.items[0].quantity, 3);
      assert.equal(cart.getItemCount(), 3);
      assert.equal(cart.getSubtotal(), 44.97);
    });

    test("adds distinct items as separate lines in cart", () => {
      const cart = new CartEngine();
      cart.addItem({ id: "book-1", title: "Ramayana Hardcover", price: 29.99 }, 1);
      cart.addItem({ id: "audio-1", title: "Ramayana Audiobook Series", price: 12.50 }, 1);

      assert.equal(cart.items.length, 2);
      assert.equal(cart.getItemCount(), 2);
      assert.equal(cart.getSubtotal(), 42.49);
    });
  });

  describe("Quantity Updates & Item Removal", () => {
    test("updates quantity correctly", () => {
      const cart = new CartEngine();
      cart.addItem({ id: "item-1", title: "Collectors Box Set", price: 49.99 }, 1);

      cart.updateQuantity("item-1", 4);
      assert.equal(cart.items[0].quantity, 4);
      assert.equal(cart.getSubtotal(), 199.96);
    });

    test("removes item when quantity is updated to zero or negative", () => {
      const cart = new CartEngine();
      cart.addItem({ id: "item-1", title: "Item 1", price: 10 }, 2);

      cart.updateQuantity("item-1", 0);
      assert.equal(cart.items.length, 0);
      assert.equal(cart.getItemCount(), 0);

      cart.addItem({ id: "item-2", title: "Item 2", price: 10 }, 1);
      cart.updateQuantity("item-2", -5);
      assert.equal(cart.items.length, 0);
    });

    test("explicitly removes item via removeItem", () => {
      const cart = new CartEngine();
      cart.addItem({ id: "item-1", price: 15 }, 1);
      cart.addItem({ id: "item-2", price: 25 }, 1);

      cart.removeItem("item-1");
      assert.equal(cart.items.length, 1);
      assert.equal(cart.items[0].id, "item-2");
      assert.equal(cart.getSubtotal(), 25.00);
    });

    test("clears entire cart", () => {
      const cart = new CartEngine();
      cart.addItem({ id: "item-1", price: 10 }, 3);
      cart.addItem({ id: "item-2", price: 20 }, 2);

      cart.clear();
      assert.equal(cart.items.length, 0);
      assert.equal(cart.getItemCount(), 0);
      assert.equal(cart.getSubtotal(), 0.00);
    });
  });

  describe("Edge Cases & Input Sanitization", () => {
    test("rejects invalid products without id or price", () => {
      const cart = new CartEngine();
      assert.equal(cart.addItem(null), false);
      assert.equal(cart.addItem(undefined), false);
      assert.equal(cart.addItem({ title: "No ID", price: 10 }), false);
      assert.equal(cart.addItem({ id: "no-price" }), false);
      assert.equal(cart.items.length, 0);
    });

    test("floats and fractional quantities are normalized to integers", () => {
      const cart = new CartEngine();
      cart.addItem({ id: "item-1", price: 10 }, 2.9);
      assert.equal(cart.items[0].quantity, 2);
    });

    test("negative prices are clamped to 0 to prevent negative billing", () => {
      const cart = new CartEngine();
      cart.addItem({ id: "item-neg", price: -50 });
      assert.equal(cart.items[0].price, 0);
      assert.equal(cart.getSubtotal(), 0);
    });
  });
});
