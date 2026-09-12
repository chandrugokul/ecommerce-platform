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

// Store Configuration
const STORE_NAME = "NasreenDecor";
const STORE_MOBILE_NUMBER = "9787074631";
const STORE_UPI_ID = "sn5036031-4@okicici";
const STORE_SLUG = "nasreendecor-main";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Delivery details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Payment method & UTR
  const [paymentMethod, setPaymentMethod] =
    useState<"upi" | "cod">("upi");

  const [utrNumber, setUtrNumber] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [copied, setCopied] = useState<"id" | "phone" | null>(null);
  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  const subtotal = getCartTotal(cart);
  const deliveryCharge = 0;
  const total = subtotal + deliveryCharge;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fffaf7] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-600">
            Add some products before checkout.
          </p>

          <Link
            href="/"
            className="inline-block mt-6 rounded-lg bg-orange-500 px-6 py-3 text-white font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  const upiUrl = `upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(
    STORE_NAME
  )}&am=${total}&cu=INR`;

  const qrCodeUrl =
    `https://api.qrserver.com/v1/create-qr-code/` +
    `?size=220x220&data=${encodeURIComponent(upiUrl)}`;

  const copyToClipboard = (
    text: string,
    type: "id" | "phone"
  ) => {
    navigator.clipboard.writeText(text);
    setCopied(type);

    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };
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

    const cleanPhone = phone.trim();

    if (!/^\d{10}$/.test(cleanPhone)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const cleanPincode = pincode.trim();

    if (!/^\d{6}$/.test(cleanPincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    const cleanUtr = utrNumber.trim();

    if (paymentMethod === "upi") {
      if (!/^\d{12}$/.test(cleanUtr)) {
        alert(
          "Please enter a valid 12-digit numeric UPI Reference / UTR Number."
        );
        return;
      }
    }

    if (placingOrder) return;

    setPlacingOrder(true);

    try {
      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id, store_name, slug")
        .eq("slug", STORE_SLUG)
        .single();

      if (storeError || !store) {
        console.error("STORE ERROR:", storeError);
        alert(
          "Store information could not be loaded. Please try again."
        );
        return;
      }

      const { data: customer, error: customerError } =
        await supabase
          .from("customers")
          .upsert(
            {
              store_id: store.id,
              name: name.trim(),
              phone: cleanPhone,
              address: address.trim(),
              city: city.trim(),
              state: state.trim(),
              pincode: cleanPincode,
            },
            {
              onConflict: "store_id,phone",
            }
          )
          .select("id")
          .single();

      if (customerError || !customer) {
        console.error("CUSTOMER ERROR:", customerError);

        alert(
          `Customer creation failed: ${
            customerError?.message ||
            "Unable to create customer"
          }`
        );

        return;
      }

      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          store_id: store.id,
          customer_id: customer.id,

          customer_name: name.trim(),
          customer_phone: cleanPhone,

          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: cleanPincode,

          items: cart,

          subtotal: subtotal,
          delivery_charge: deliveryCharge,
          total: total,

          payment_method: paymentMethod,

          utr_number:
            paymentMethod === "upi"
              ? cleanUtr
              : null,

          status:
            paymentMethod === "cod"
              ? "pending"
              : "pending_verification",
        });

      if (orderError) {
        console.error("ORDER ERROR:", orderError);
        alert(`Order failed: ${orderError.message}`);
        return;
      }

      clearCart();

      router.push("/order-success");
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900"
          >
            <span>Nasreen</span>
            <span className="text-blue-600">Decor</span>
          </Link>

          <Link
            href="/cart"
            className="text-sm font-semibold text-gray-700"
          >
            ← Back to Cart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Delivery Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Door No, Street, Area"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Payment Method
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`rounded-xl border-2 p-4 text-left ${
                    paymentMethod === "upi"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="font-bold text-gray-900">
                    UPI Payment
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Pay using UPI and enter the UTR number
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`rounded-xl border-2 p-4 text-left ${
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="font-bold text-gray-900">
                    Cash on Delivery
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Pay when your order is delivered
                  </div>
                </button>
              </div>

              {paymentMethod === "upi" && (
                <div className="mt-6 rounded-xl bg-gray-50 p-5">
                  <h3 className="font-bold text-gray-900">
                    Pay using UPI
                  </h3>

                  <div className="mt-4 text-center">
                    <img
                      src={qrCodeUrl}
                      alt="UPI Payment QR Code"
                      className="mx-auto h-[220px] w-[220px] rounded-lg border bg-white p-2"
                    />
                  </div>

                  <div className="mt-5 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        UPI ID
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 rounded-lg border bg-white px-3 py-3 text-sm font-medium break-all">
                          {STORE_UPI_ID}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              STORE_UPI_ID,
                              "id"
                            )
                          }
                          className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
                        >
                          {copied === "id"
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        Store Mobile
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 rounded-lg border bg-white px-3 py-3 text-sm font-medium">
                          {STORE_MOBILE_NUMBER}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              STORE_MOBILE_NUMBER,
                              "phone"
                            )
                          }
                          className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
                        >
                          {copied === "phone"
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      UPI Reference / UTR Number
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={utrNumber}
                      onChange={(e) =>
                        setUtrNumber(e.target.value)
                      }
                      placeholder="Enter 12-digit UTR number"
                      maxLength={12}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                      Complete the UPI payment first, then enter
                      the reference number shown in your payment
                      app.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="mt-5 rounded-xl bg-green-50 p-4">
                  <p className="font-semibold text-green-800">
                    Cash on Delivery selected
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    You can pay the delivery person when your
                    order arrives.
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-gray-900">
                    ₹
                    {(
                      Number(item.price) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-gray-200" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-medium">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Delivery
                </span>

                <span className="font-medium text-green-600">
                  {deliveryCharge === 0
                    ? "FREE"
                    : `₹${deliveryCharge.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-gray-200" />

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                Total
              </span>

              <span className="text-xl font-bold text-orange-600">
                ₹{total.toFixed(2)}
              </span>
            </div>
            <button
              type="submit"
              disabled={placingOrder}
              className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder
                ? "Placing Order..."
                : `Place Order • ₹${total.toFixed(2)}`}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              By placing this order, you confirm that your
              delivery details are correct.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}
