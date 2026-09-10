"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CartItem, getCart, getCartTotal, clearCart } from "@/lib/cart";

// Replace with your actual merchant/personal UPI ID and business name
const STORE_UPI_ID = "YOUR_UPI_ID@okaxis"; 
const STORE_NAME = "Your Store";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Step state: 'details' -> 'upi_payment'
  const [step, setStep] = useState<"details" | "upi_payment">("details");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Standard NPCI UPI URI Scheme
  const upiUrl = `upi://pay?pa=${encodeURIComponent(STORE_UPI_ID)}&pn=${encodeURIComponent(
    STORE_NAME
  )}&am=${subtotal}&cu=INR&tn=Order%20Payment`;

  // QR Code generator URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUrl
  )}`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(STORE_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step 1: Validate address and proceed to UPI screen
  function handleProceedToPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !phone || !address || !city || !state || !pincode) {
      alert("Please fill in all delivery details.");
      return;
    }
    setStep("upi_payment");
  }

  // Step 2: Finalize and submit order after customer pays
  async function handleConfirmPayment() {
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
        payment_method: "upi",
        status: "pending_verification",
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
        {/* Navigation & Header */}
        <div className="mb-6">
          {step === "upi_payment" ? (
            <button
              type="button"
              onClick={() => setStep("details")}
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-orange-600 hover:text-orange-700"
            >
              ← Edit Delivery Details
            </button>
          ) : (
            <Link
              href="/cart"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-orange-600 hover:text-orange-700"
            >
              ← Back to Cart
            </Link>
          )}

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {step === "details" ? "Delivery Details" : "UPI Payment"}
          </h1>
          <p className="text-sm text-slate-600">
            {step === "details"
              ? "Enter your delivery address to proceed to payment."
              : `Complete the payment of ₹${subtotal.toLocaleString("en-IN")} via UPI.`}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Area */}
          <div>
            {step === "details" ? (
              <form onSubmit={handleProceedToPayment}>
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-slate-500">
                    All fields are required.
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Full Name *
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

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Mobile Number *
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

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Address *
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Flat no., Street, Area"
                        rows={3}
                        required
                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          City *
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
                          State *
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

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Pincode *
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

                  <button
                    type="submit"
                    className="mt-6 w-full rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 active:scale-[0.99]"
                  >
                    Continue to UPI Payment →
                  </button>
                </section>
              </form>
            ) : (
              /* UPI Payment Screen */
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Pay using UPI ID / QR
                    </h2>
                    <p className="text-xs text-slate-500">
                      Google Pay • PhonePe • Paytm • BHIM
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    Amount: ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center text-center">
                  {/* QR Code */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="h-44 w-44 rounded-lg object-contain"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Scan with any UPI application to pay directly
                  </p>

                  <div className="my-4 flex w-full items-center">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="px-3 text-xs font-medium text-slate-400">
                      OR PAY TO UPI ID
                    </span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>

                  {/* Copy UPI ID Box */}
                  <div className="flex w-full max-w-sm items-center justify-between rounded-xl border border-slate-300 bg-slate-50 p-2.5">
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {STORE_UPI_ID}
                    </span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-100 active:scale-95"
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Direct Mobile Deep-link */}
                  <a
                    href={upiUrl}
                    className="mt-4 block w-full max-w-sm rounded-xl border border-orange-200 bg-orange-50 py-3 text-center text-xs font-bold text-orange-700 transition hover:bg-orange-100"
                  >
                    Open Installed UPI App (Mobile Only)
                  </a>
                </div>

                {/* Verification Confirmation */}
                <div className="mt-8 rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs text-slate-600 text-center mb-3">
                    Once you have completed the payment in your UPI app, click below to confirm your order:
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={placingOrder}
                    className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {placingOrder ? "Verifying & Placing Order..." : "I Have Completed Payment →"}
                  </button>
                </div>
              </section>
            )}
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

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-xs font-medium text-slate-600">
                Payment Method: <span className="font-bold text-slate-900">UPI Only</span>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
