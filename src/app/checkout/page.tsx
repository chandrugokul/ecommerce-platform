"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CartItem, getCart, getCartTotal, clearCart } from "@/lib/cart";

// Store Configuration
const STORE_UPI_ID = "sn5036031-4@okicici";
const STORE_NAME = "NasreenDecor";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Delivery form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500">
          Loading checkout...
        </p>
      </main>
    );
  }

  const subtotal = getCartTotal();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">🛒</div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Your cart is empty
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Add products before proceeding to checkout.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // NPCI Standard UPI Intent Link
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(STORE_UPI_ID)}&pn=${encodeURIComponent(
    STORE_NAME
  )}&am=${subtotal}&cu=INR&tn=Payment%20to%20${encodeURIComponent(STORE_NAME)}`;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !phone || !address || !city || !state || !pincode) {
      alert("Please fill in all delivery details.");
      return;
    }

    setPlacingOrder(true);

    try {
      const { error } = await supabase.from("orders").insert({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        items: cart,
        subtotal: subtotal,
        delivery_charge: 0,
        total: subtotal,
        payment_method: paymentMethod,
        status: paymentMethod === "cod" ? "pending" : "pending_verification",
      });

      if (error) {
        console.error("ORDER ERROR:", error);
        alert(`Order failed: ${error.message}`);
        return;
      }

      clearCart();
      router.push("/order-success");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-orange-600 hover:text-orange-700"
          >
            ← Back to Cart
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Checkout
          </h1>
          <p className="text-sm text-slate-600">
            Enter your delivery details and choose how you want to pay.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_360px]"
        >
          <div className="space-y-6">
            {/* Delivery Details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">
                Delivery Information
              </h2>
              <p className="text-xs text-slate-500">
                Where should we deliver your order?
              </p>

              <div className="mt-5 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chandru Manoharan"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    required
                    pattern="[0-9]{10}"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Flat no., Street name, Area"
                    rows={3}
                    required
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Chennai"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit PIN code"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method Selector */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">
                Payment Method
              </h2>
              <p className="text-xs text-slate-500">
                Choose UPI or Cash on Delivery
              </p>

              <div className="mt-4 space-y-3">
                {/* Direct UPI Intent Option */}
                <label
                  className={`flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                    paymentMethod === "upi"
                      ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="mt-0.5 h-4 w-4 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          Direct UPI App Intent
                        </span>
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">
                          Instant App Launch
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Launches Google Pay, PhonePe, Paytm, or BHIM directly to pay {STORE_NAME}.
                      </p>
                    </div>
                  </div>

                  {/* Direct Launch Button */}
                  {paymentMethod === "upi" && (
                    <div className="mt-4 border-t border-orange-200/60 pt-3">
                      <a
                        href={upiIntentUrl}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-center text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
                      >
                        <span>📲 Tap to Pay ₹{subtotal.toLocaleString("en-IN")} via UPI App</span>
                      </a>
                      <p className="mt-2 text-center text-[11px] text-slate-500">
                        Paying to: <span className="font-mono font-semibold text-slate-700">{STORE_UPI_ID}</span> ({STORE_NAME})
                      </p>
                    </div>
                  )}
                </label>

                {/* Cash on Delivery Option */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-0.5 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        Cash on Delivery (COD)
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        Cash
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Pay with cash directly when your package arrives.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-base font-bold text-slate-900">
              Order Summary
            </h2>

            <div className="mt-4 divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-100 bg-slate-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-base">
                        🌸
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="mt-6 w-full rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder
                ? "Placing Order..."
                : paymentMethod === "cod"
                ? `Place Order (COD) • ₹${subtotal.toLocaleString("en-IN")}`
                : `Confirm Order (UPI Paid) • ₹${subtotal.toLocaleString("en-IN")}`}
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              🔒 Safe & encrypted checkout
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
