export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              Products
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your store products
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
          >
            + Add Product
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 p-5 text-red-600">
            Failed to load products: {error.message}
          </div>
        )}

        {/* Product count */}
        <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <p className="mt-1 text-3xl font-black">
            {products?.length ?? 0}
          </p>
        </div>

        {/* Empty state */}
        {!error && (!products || products.length === 0) && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-6xl">🛍️</div>

            <h2 className="mt-4 text-xl font-bold">
              No products yet
            </h2>

            <p className="mt-2 text-gray-500">
              Add your first product to your store.
            </p>

            <Link
              href="/admin/products/new"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
            >
              Add Product
            </Link>
          </div>
        )}

        {/* Products */}
        {products && products.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >

                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-7xl">
                      🛍️
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">

                  <p className="text-xs font-bold uppercase text-blue-600">
                    {product.category || "Uncategorized"}
                  </p>

                  <h2 className="mt-1 text-lg font-bold">
                    {product.name}
                  </h2>

                  <p className="mt-2 text-xl font-black">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {product.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-xl border border-gray-300 py-3 text-center font-semibold"
                    >
                      ✏️ Edit
                    </Link>

                    <button
                      disabled
                      className="rounded-xl bg-gray-100 py-3 font-semibold text-gray-400"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}