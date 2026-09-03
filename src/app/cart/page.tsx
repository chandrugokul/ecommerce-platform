"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CartItem,
  getCart,
  getCartTotal,
  removeFromCart,
  updateCartQuantity,
} from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  function refreshCart() {
    setCart(getCart());
  }

  useEffect(() => {
    setMounted(true);
    refreshCart();

    window.addEventListener("cart-updated", refreshCart);

    return () => {
      window.removeEventListener("cart-updated", refreshCart);
    };
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fffaf7] px-4 py-10">
        <div className="mx-auto max-w-3xl text-center">
          Loading cart...
        </div>
      </main>
    );
  }

  const subtotal = getCartTotal();
  const delivery = subtotal > 0 ? 0 : 0;
  const total = subtotal + delivery;

  return (
    <main className="min-h-screen bg-[#fffaf7] px-4 py-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-bold text-orange-600"
          >
            ← Continue Shopping
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Your Cart
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review your items before checkout.
          </p>
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm">
            <div className="text-6xl">🛒</div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add some beautiful products to your cart.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">

            {/* Cart Items */}
            <div className="space-y-3">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">

                    {/* Image */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-orange-50">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">
                          🌸
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                        {item.category || "Handmade"}
                      </p>

                      <h2 className="mt-1 truncate text-base font-bold text-slate-900">
                        {item.name}
                      </h2>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>

                      {/* Quantity + Remove */}
                      <div className="mt-3 flex items-center justify-between">

                        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => {
                              updateCartQuantity(
                                item.id,
                                item.quantity - 1
                              );
                              refreshCart();
                            }}
                            className="px-3 py-2 font-bold text-slate-600 hover:bg-slate-50"
                          >
                            −
                          </button>

                          <span className="min-w-9 text-center text-sm font-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              updateCartQuantity(
                                item.id,
                                item.quantity + 1
                              );
                              refreshCart();
                            }}
                            className="px-3 py-2 font-bold text-slate-600 hover:bg-slate-50"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            removeFromCart(item.id);
                            refreshCart();
                          }}
                          className="text-xs font-bold text-red-500"
                        >
                          🗑️ Remove
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span className="font-semibold text-green-600">
                    FREE
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-bold">
                      Total
                    </span>

                    <span className="text-xl font-bold">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg"
              >
                Proceed to Checkout →
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                Secure checkout coming next
              </p>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}