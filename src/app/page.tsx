export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <h1 className="text-2xl font-black">
            Nasreen<span className="text-blue-600">Decor</span>
          </h1>

          <div className="flex gap-4 text-xl">
            <span>♡</span>
            <span>🛒</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl bg-blue-600 px-6 py-16 text-white">
          <p className="font-semibold">NEW COLLECTION</p>

          <h2 className="mt-3 text-4xl font-black md:text-6xl">
            Everything you need.
            <br />
            All in one place.
          </h2>

          <p className="mt-5 text-blue-100">
            Discover amazing products at great prices.
          </p>

          <button className="mt-7 rounded-xl bg-white px-6 py-3 font-bold text-blue-600">
            Shop Now →
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-5 text-2xl font-bold">Shop by Category</h2>

        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {[
            ["👕", "Men"],
            ["👗", "Women"],
            ["👟", "Shoes"],
            ["📱", "Electronics"],
            ["💄", "Beauty"],
            ["🏠", "Home"],
          ].map(([icon, name]) => (
            <div
              key={name}
              className="rounded-2xl bg-white p-5 text-center shadow-sm"
            >
              <div className="text-4xl">{icon}</div>
              <p className="mt-2 font-semibold">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Products */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>

          <span className="text-sm text-gray-500">
            {products?.length ?? 0} products
          </span>
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-6 text-red-600">
            Unable to load products from database.
          </div>
        ) : !products || products.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold">No products found</p>
            <p className="mt-2 text-gray-500">
              Add products to your Supabase database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* Product Image */}
                <div className="flex aspect-square items-center justify-center bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-7xl">🛍️</span>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <p className="mb-1 text-xs font-semibold uppercase text-blue-600">
                    {product.category || "Product"}
                  </p>

                  <h3 className="font-bold">{product.name}</h3>

                  {product.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {product.description}
                    </p>
                  )}

                  <p className="mt-2 text-lg font-black">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <button className="mt-4 w-full rounded-xl bg-black py-3 font-semibold text-white">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-10 bg-gray-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-black">
            Nasreen<span className="text-blue-400">Decor</span>
          </h2>

          <p className="mt-2 text-gray-400">
            Your modern e-commerce platform.
          </p>
        </div>
      </footer>
    </main>
  );
}