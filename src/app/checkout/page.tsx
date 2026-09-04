"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import {
  CartItem,
  getCart,
  getCartTotal,
clearCart,
} from "@/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf7]">
        <p className="text-sm font-semibold text-slate-500">
          Loading checkout...
        </p>
      </main>
    );
  }

  const subtotal = getCartTotal();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf7] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
          <div className="text-6xl">🛒</div>

          <h1 className="mt-5 text-2xl font-bold">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add products before proceeding to checkout.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!name || !phone || !address || !city || !state || !pincode) {
    return;
  }

  setPlacingOrder(true);

  try {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        items: cart,
        subtotal,
        delivery_charge: 0,
        total: subtotal,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      alert("Unable to place order. Please try again.");
      return;
    }

    clearCart();

    router.push(`/order-success?orderId=${data.id}`);
  } catch (error) {
    console.error(error);
    alert("Something went wrong. Please try again.");
  } finally {
    setPlacingOrder(false);
  }
}

  return (
    <main className="min-h-screen bg-[#fffaf7] px-4 py-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="text-sm font-bold text-orange-600"
          >
            ← Back to Cart
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Checkout
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Enter your delivery details.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 lg:grid-cols-[1fr_340px]"
        >

          {/* Customer Details */}
          <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">

            <h2 className="text-lg font-bold text-slate-900">
              Delivery Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Where should we deliver your order?
            </p>

            {/* Name */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Full Name *
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Phone */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Mobile Number *
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter mobile number"
                required
                pattern="[0-9]{10}"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Address */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Address *
              </label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat / Street / Area"
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* City / State */}
            <div className="mt-5 grid grid-cols-2 gap-3">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  City *
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  State *
                </label>

                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

            </div>

            {/* Pincode */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Pincode *
              </label>

              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6 digit pincode"
                required
                pattern="[0-9]{6}"
                maxLength={6}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

          </section>

          {/* Order Summary */}
          <section className="h-fit rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">

            <h2 className="text-lg font-bold">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-orange-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        🌸
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-bold">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}

            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">
                  Delivery
                </span>

                <span className="font-semibold text-green-600">
                  FREE
                </span>
              </div>

              <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
                <span className="font-bold">
                  Total
                </span>

                <span className="text-xl font-bold">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

            </div>

            <button
  type="submit"
  disabled={placingOrder}
  className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
>
  {placingOrder ? "Placing Order..." : "Place Order →"}
</button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Secure checkout
            </p>

          </section>

        </form>
      </div>
    </main>
  );
}