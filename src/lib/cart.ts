export type CartItem = {
  id: number | string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  quantity: number;
};

const CART_KEY = "nasreendecor-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(CART_KEY);

    if (!saved) {
      return [];
    }

    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">) {
  const cart = getCart();

  const existing = cart.find(
    (cartItem) => String(cartItem.id) === String(item.id)
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...item,
      quantity: 1,
    });
  }

  saveCart(cart);
}

export function updateCartQuantity(
  id: number | string,
  quantity: number
) {
  const cart = getCart();

  const item = cart.find(
    (cartItem) => String(cartItem.id) === String(id)
  );

  if (!item) return;

  if (quantity <= 0) {
    removeFromCart(id);
    return;
  }

  item.quantity = quantity;

  saveCart(cart);
}

export function removeFromCart(id: number | string) {
  const cart = getCart().filter(
    (item) => String(item.id) !== String(id)
  );

  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce(
    (total, item) => total + item.quantity,
    0
  );
}

export function getCartTotal() {
  return getCart().reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}