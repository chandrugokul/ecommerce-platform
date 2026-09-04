export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "./AddToCartButton";
import CartIcon from "./CartIcon";

export default async function HomePage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const productList = products || [];

  const categories = [
    "All",
    "Flowers",
    "Gifts",
    "Home Decor",
    "Women",
    "Men",
  ];

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-900">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-[#fffaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xl">
              🌸
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                NasreenDecor
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-orange-500">
                Handmade with love
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-white"
              aria-label="Search"
            >
              🔍
            </button>

            <CartIcon<Link
  href="/cart"
  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-white"
  aria-label="Shopping cart"
>
  🛒

  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
    0
  </span>
</Link>/>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-8">

        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-100 via-rose-50 to-amber-50">

          <div className="grid items-center md:grid-cols-2">

            <div className="px-6 py-10 md:px-10 md:py-16">

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
                Handmade Collection
              </p>

              <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
                Beautiful things,
                <br />
                made with love.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 md:text-base">
                Discover handmade flowers, thoughtful gifts and beautiful
                home decor made specially for your loved ones.
              </p>

              <div className="mt-7 flex gap-3">
                <a
                  href="#products"
                  className="rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg"
                >
                  Shop Collection
                </a>

                <a
                  href="#categories"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700"
                >
                  Explore
                </a>
              </div>

            </div>

            <div className="hidden h-full min-h-[320px] items-center justify-center md:flex">
              <div className="text-center">
                <div className="text-[120px]">🌻</div>
                <p className="text-sm font-semibold text-orange-700">
                  Handmade • Unique • Special
                </p>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-5">

        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Explore
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Shop by category
            </h2>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold ${
                index === 0
                  ? "bg-slate-900 text-white"
                  : "border border-orange-100 bg-white text-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-7xl px-4 py-8">

        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Our Collection
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Latest products
            </h2>
          </div>

          <span className="text-sm text-slate-500">
            {productList.length} items
          </span>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Unable to load products.
          </div>
        )}

        {productList.length === 0 && !error && (
          <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center">
            <div className="text-5xl">🌸</div>

            <h3 className="mt-4 text-lg font-bold">
              Collection coming soon
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Beautiful handmade products will appear here.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">

          {productList.map((product) => {
            const stock = Number(product.stock_quantity || 0);

            return (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-orange-50">

                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🌸
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm"
                    aria-label="Add to wishlist"
                  >
                    ♡
                  </button>

                  {/* Stock */}
                  {stock === 0 ? (
                    <span className="absolute bottom-2 left-2 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">
                      OUT OF STOCK
                    </span>
                  ) : stock <= 5 ? (
                    <span className="absolute bottom-2 left-2 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white">
                      ONLY {stock} LEFT
                    </span>
                  ) : (
                    <span className="absolute bottom-2 left-2 rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-bold text-white">
                      IN STOCK
                    </span>
                  )}

                </div>

                {/* Product Info */}
                <div className="p-3.5">

                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                    {product.category || "Handmade"}
                  </p>

                  <h3 className="line-clamp-1 text-sm font-bold text-slate-900">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2">

                    <p className="text-lg font-bold text-slate-900">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>

                    <AddToCartButton
  product={{
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image_url: product.image_url,
    category: product.category,
  }}
  disabled={stock === 0}
/>

                  </div>

                </div>

              </article>
            );
          })}

        </div>

      </section>

      {/* Trust section */}
      <section className="border-y border-orange-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-3 px-4 py-7 text-center">

          <div>
            <div className="text-2xl">💝</div>
            <p className="mt-2 text-xs font-bold text-slate-800">
              Made with Love
            </p>
          </div>

          <div>
            <div className="text-2xl">✨</div>
            <p className="mt-2 text-xs font-bold text-slate-800">
              Unique Designs
            </p>
          </div>

          <div>
            <div className="text-2xl">📦</div>
            <p className="mt-2 text-xs font-bold text-slate-800">
              Carefully Packed
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-4 py-10 text-white">

        <div className="mx-auto max-w-7xl">

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
              🌸
            </div>

            <div>
              <p className="font-bold">NasreenDecor</p>
              <p className="text-xs text-slate-400">
                Handmade with love
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
            Handmade flowers, gifts and decor created to make every moment
            special.
          </p>

          <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-500">
            © 2026 NasreenDecor. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}