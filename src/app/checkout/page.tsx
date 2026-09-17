"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  CartItem,
  getCart,
  clearCart,
} from "@/lib/cart";

const STORE_NAME = "NasreenDecor";
const STORE_MOBILE_NUMBER = "9787074631";
const STORE_UPI_ID = "sn5036031-4@okicici";
const STORE_SLUG = "nasreendecor-main";

type PaymentMethod = "upi" | "cod";
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

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [utr, setUtr] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const currentCart = getCart();
    setCart(currentCart);
    setMounted(true);
  }, []);
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryCharge = 0;
  const total = subtotal + deliveryCharge;

  const qrData = `upi://pay?pa=${encodeURIComponent(
    STORE_UPI_ID
  )}&pn=${encodeURIComponent(
    STORE_NAME
  )}&am=${total.toFixed(2)}&cu=INR`;

  function validateForm() {
    if (!name.trim()) {
      alert("Please enter your name.");
      return false;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!address.trim()) {
      alert("Please enter your address.");
      return false;
    }

    if (!city.trim()) {
      alert("Please enter your city.");
      return false;
    }

    if (!state.trim()) {
      alert("Please enter your state.");
      return false;
    }

    const cleanPincode = pincode.replace(/\D/g, "");

    if (cleanPincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return false;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return false;
    }

    if (paymentMethod === "upi") {
      const cleanUtr = utr.replace(/\D/g, "");

      if (cleanUtr.length !== 12) {
        alert("Please enter a valid 12-digit UTR number.");
        return false;
      }
    }

    return true;
  }
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setPlacingOrder(true);

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const cleanPincode = pincode.replace(/\D/g, "");
      const cleanUtr = utr.replace(/\D/g, "");

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id, store_name, slug")
        .eq("slug", STORE_SLUG)
        .eq("status", "active")
        .single();

      if (storeError || !store) {
        console.error("Store error:", storeError);

        alert(
          `Store not found: ${
            storeError?.message || "Unknown error"
          }`
        );

        return;
      }

      const { data: orderId, error: orderError } =
        await supabase.rpc("place_order", {
          p_store_id: store.id,
          p_name: name.trim(),
          p_phone: cleanPhone,
          p_address: address.trim(),
          p_city: city.trim(),
          p_state: state.trim(),
          p_pincode: cleanPincode,
          p_items: cart,
          p_subtotal: subtotal,
          p_delivery_charge: deliveryCharge,
          p_total: total,
          p_payment_method: paymentMethod,
          p_utr_number:
            paymentMethod === "upi"
              ? cleanUtr
              : null,
        });

      if (orderError) {
        console.error("Order error:", orderError);

        alert(`Order failed: ${orderError.message}`);

        return;
      }

      if (!orderId) {
        alert("Order could not be created.");

        return;
      }

      clearCart();

      router.push("/order-success");
    } catch (error) {
      console.error("Checkout error:", error);

      alert(
        "Something went wrong while placing your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }
  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fffaf7] flex items-center justify-center">
        <p className="text-slate-600">
          Loading checkout...
        </p>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf7]">
        <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-xl font-black text-slate-900"
            >
              Nasreen
              <span className="text-orange-500">
                Decor
              </span>
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </header>

        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-5xl">
              🛒
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              Your cart is empty
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add some products before going to checkout.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#fffaf7]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-black text-slate-900"
          >
            Nasreen
            <span className="text-orange-500">
              Decor
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm font-bold text-slate-700 hover:text-orange-500"
          >
            ← Continue Shopping
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            NasreenDecor
          </p>

          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter your delivery details and select your payment method.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* DELIVERY DETAILS */}
            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Delivery Details
              </h2>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Address
                  </label>

                  <textarea
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    placeholder="House / Flat / Street / Area"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      City
                    </label>

                    <input
                      type="text"
                      value={city}
                      onChange={(e) =>
                        setCity(e.target.value)
                      }
                      placeholder="City"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      State
                    </label>

                    <input
                      type="text"
                      value={state}
                      onChange={(e) =>
                        setState(e.target.value)
                      }
                      placeholder="State"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Pincode
                  </label>

                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) =>
                      setPincode(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="6-digit pincode"
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            </section>
            {/* PAYMENT */}
            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Payment Method
              </h2>

              <div className="mt-5 grid gap-3">
                {/* UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "upi"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      📱
                    </div>

                    <div>
                      <p className="font-black text-slate-900">
                        UPI Payment
                      </p>

                      <p className="text-xs text-slate-500">
                        Pay using UPI QR and enter UTR number
                      </p>
                    </div>

                    <div className="ml-auto">
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          paymentMethod === "upi"
                            ? "border-orange-500 bg-orange-500"
                            : "border-slate-300"
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      💵
                    </div>

                    <div>
                      <p className="font-black text-slate-900">
                        Cash on Delivery
                      </p>

                      <p className="text-xs text-slate-500">
                        Pay when your order is delivered
                      </p>
                    </div>

                    <div className="ml-auto">
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          paymentMethod === "cod"
                            ? "border-orange-500 bg-orange-500"
                            : "border-slate-300"
                        }`}
                      />
                    </div>
                  </div>
                </button>
              </div>

              {/* UPI DETAILS */}
              {paymentMethod === "upi" && (
                <div className="mt-5 rounded-3xl bg-slate-50 p-5">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">
                      Scan & Pay
                    </p>

                    <div className="mx-auto mt-4 flex h-56 w-56 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          qrData
                        )}`}
                        alt="UPI Payment QR Code"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                      UPI ID
                    </p>

                    <p className="font-black text-slate-900">
                      {STORE_UPI_ID}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Amount: ₹{total.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      UTR / Transaction Number
                    </label>

                    <input
                      type="text"
                      value={utr}
                      onChange={(e) =>
                        setUtr(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="Enter 12-digit UTR number"
                      maxLength={12}
                      inputMode="numeric"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      After completing the UPI payment, enter
                      the transaction UTR number above.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
          {/* RIGHT SIDE */}
          <aside className="h-fit lg:sticky lg:top-24">
            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4">
                {cart.map((item) => (
                  <div
                    key={String(item.id)}
                    className="flex gap-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">
                          🛍️
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm font-black text-slate-900">
                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-slate-100" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-slate-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span className="font-bold text-green-600">
                    FREE
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-black text-slate-900">
                      Total
                    </span>

                    <span className="text-xl font-black text-orange-500">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={placingOrder}
                className={`mt-6 w-full rounded-2xl px-5 py-4 text-sm font-black text-white transition ${
                  placingOrder
                    ? "cursor-not-allowed bg-slate-400"
                    : "bg-slate-900 hover:bg-slate-700"
                }`}
              >
                {placingOrder
                  ? "Placing Order..."
                  : paymentMethod === "upi"
                  ? "Confirm UPI Order"
                  : "Place COD Order"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                By placing this order, you confirm that the
                delivery details provided above are correct.
              </p>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}