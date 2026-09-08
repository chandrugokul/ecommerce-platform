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

type PaymentMethod = "cod" | "upi";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");

  const [paymentReference, setPaymentReference] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  /*
   * CHANGE THIS TO YOUR REAL UPI ID
   */
  const UPI_ID = "YOUR-UPI-ID@upi";

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
  const deliveryCharge = 0;
  const total = subtotal + deliveryCharge;

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

    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      alert("Please fill in all delivery details.");
      return;
    }

    if (paymentMethod === "upi" && !paymentReference.trim()) {
      alert("Please enter your UPI payment reference / UTR number.");
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
          delivery_charge: deliveryCharge,
          total,

          status: "pending",

          payment_method: paymentMethod,

          payment_status:
            paymentMethod === "cod"
              ? "pending"
              : "verification_pending",

          payment_reference:
            paymentMethod === "upi"
              ? paymentReference.trim()
              : null,
        })
        .select("id")
        .single();

      if (error) {
        console.error("ORDER ERROR:", error);

        alert(`Order failed: ${error.message}`);
        return;
      }

      clearCart();

      router.push(`/order-success?orderId=${data.id}`);
      router.refresh();
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

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
            Enter your delivery and payment details.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 lg:grid-cols-[1fr_340px]"
        >

          {/* LEFT */}
          <div className="space-y-5">

            {/* Delivery */}
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
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10 digit mobile number"
                  required
                  maxLength={10}
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
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="6 digit pincode"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Payment Method
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose how you want to pay.
              </p>

              <div className="mt-5 space-y-3">

                {/* COD */}
                <label
                  className={`block cursor-pointer rounded-2xl border p-4 transition ${
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-4 w-4 accent-orange-500"
                    />

                    <div className="text-2xl">
                      💵
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        Cash on Delivery
                      </p>

                      <p className="text-xs text-slate-500">
                        Pay when your order arrives.
                      </p>
                    </div>

                  </div>
                </label>

                {/* UPI */}
                <label
                  className={`block cursor-pointer rounded-2xl border p-4 transition ${
                    paymentMethod === "upi"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="h-4 w-4 accent-orange-500"
                    />

                    <div className="text-2xl">
                      📱
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        UPI
                      </p>

                      <p className="text-xs text-slate-500">
                        Pay using Google Pay, PhonePe, Paytm or another UPI app.
                      </p>
                    </div>

                  </div>
                </label>

              </div>

              {/* UPI Details */}
              {paymentMethod === "upi" && (
                <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5">

                  <h3 className="font-bold text-slate-900">
                    Pay using UPI
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Scan the QR code or pay directly to the UPI ID below.
                  </p>

                  {/* QR */}
                  <div className="mt-5 flex justify-center">

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          `upi://pay?pa=${UPI_ID}&pn=NasreenDecor&am=${total}&cu=INR`
                        )}`}
                        alt="NasreenDecor UPI QR Code"
                        className="h-52 w-52"
                      />
                    </div>

                  </div>

                  <div className="mt-5 rounded-xl bg-white p-4 text-center">

                    <p className="text-xs font-semibold text-slate-500">
                      UPI ID
                    </p>

                    <p className="mt-1 break-all text-base font-bold text-slate-900">
                      {UPI_ID}
                    </p>

                    <p className="mt-3 text-lg font-black text-orange-600">
                      ₹{total.toLocaleString("en-IN")}
                    </p>

                  </div>

                  {/* Reference */}
                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-semibold">
                      UPI Reference / UTR Number *
                    </label>

                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) =>
                        setPaymentReference(e.target.value)
                      }
                      placeholder="Enter payment reference number"
                      required={paymentMethod === "upi"}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      After completing the UPI payment, enter the reference
                      number shown in your payment app.
                    </p>

                  </div>

                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    Your UPI payment will be verified by our team before the
                    order is marked as paid.
                  </div>

                </div>
              )}

            </section>

          </div>

          {/* RIGHT — SUMMARY */}
          <section className="h-fit rounded-2xl border border-orange-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">

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
                    ₹
                    {(
                      item.price * item.quantity
                    ).toLocaleString("en-IN")}
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
                  ₹{total.toLocaleString("en-IN")}
                </span>

              </div>

            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder
                ? "Placing Order..."
                : paymentMethod === "upi"
                  ? "I've Paid — Place Order →"
                  : "Place Order →"}
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              🔒 Secure checkout
            </p>

          </section>

        </form>
      </div>
    </main>
  );
}