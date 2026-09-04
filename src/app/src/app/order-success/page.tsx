import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-4">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
          Order Confirmed
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Thank You! 🎉
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          Your order has been placed successfully.
          We will contact you shortly to confirm your order and delivery.
        </p>

        <Link
          href="/"
          className="mt-7 block w-full rounded-xl bg-slate-900 px-5 py-4 text-center text-sm font-bold text-white"
        >
          Continue Shopping →
        </Link>

      </div>
    </main>
  );
}