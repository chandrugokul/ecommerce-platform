export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DeleteProductButton from "./DeleteProductButton";

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-5">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            Failed to load products: {error.message}
          </div>
        </div>
      </main>
    );
  }

  const productList = products || [];

  const totalProducts = productList.length;

  const inStock = productList.filter(
    (product) => Number(product.stock_quantity || 0) > 5
  ).length;

  const lowStock = productList.filter(
    (product) =>
      Number(product.stock_quantity || 0) > 0 &&
      Number(product.stock_quantity || 0) <= 5
  ).length;

  const outOfStock = productList.filter(
    (product) => Number(product.stock_quantity || 0) === 0
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-semibold text-blue-600">
              STORE ADMIN
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Products
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your products and inventory
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            + Add Product
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              In Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-green-800">
              {inStock}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-700">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              {lowStock}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-red-800">
              {outOfStock}
            </p>
          </div>

        </div>

        {/* Product section */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your Products
            </h2>

            <p className="text-sm text-slate-500">
              {totalProducts} products in your store
            </p>
          </div>
        </div>

        {/* Empty state */}
        {productList.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mb-3 text-5xl">📦</div>

            <h3 className="text-lg font-bold text-slate-900">
              No products yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first product to start selling.
            </p>

            <Link
              href="/admin/products/new"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
            >
              + Add Product
            </Link>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {productList.map((product) => {
            const stock = Number(product.stock_quantity || 0);

            const stockStatus =
              stock === 0
                ? "Out of Stock"
                : stock <= 5
                ? "Low Stock"
                : "In Stock";

            const stockClass =
              stock === 0
                ? "bg-red-100 text-red-700"
                : stock <= 5
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700";

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                {/* Image */}
                <div className="relative h-56 w-full bg-slate-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🛍️
                    </div>
                  )}

                  {/* Stock badge */}
                  <div
                    className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold ${stockClass}`}
                  >
                    {stockStatus}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">

                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                        {product.category || "General"}
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        {product.name}
                      </h3>
                    </div>

                    <p className="whitespace-nowrap text-lg font-bold text-slate-900">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-500">
                      Available Stock
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        stock === 0
                          ? "text-red-600"
                          : stock <= 5
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {stock} units
                    </span>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-500">
                      {product.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">

                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      ✏️ Edit
                    </Link>

                    <DeleteProductButton id={product.id} />

                  </div>
                </div>
              </article>
            );
          })}

        </div>
      </div>
    </main>
  );
}