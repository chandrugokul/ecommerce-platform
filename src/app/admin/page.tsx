import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    { count: productCount },
    { data: orders },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("id,total,status"),
  ]);

  const totalOrders = orders?.length || 0;

  const revenue =
    orders?.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    ) || 0;

  const pendingOrders =
    orders?.filter((order) => order.status === "pending").length || 0;

  const menu = [
    {
      title: "Products",
      description: "Manage products, prices, images and stock.",
      icon: "🛍️",
      href: "/admin/products",
    },
    {
      title: "Orders",
      description: "View and manage customer orders.",
      icon: "📦",
      href: "/admin/orders",
    },
    {
      title: "Customers",
      description: "View customers and their order history.",
      icon: "👥",
      href: "/admin/customers",
    },
    {
      title: "Categories",
      description: "Manage your product categories.",
      icon: "🏷️",
      href: "/admin/categories",
    },
    {
      title: "Inventory",
      description: "Monitor stock and low-stock products.",
      icon: "📊",
      href: "/admin/inventory",
    },
    {
      title: "Settings",
      description: "Manage your store settings.",
      icon: "⚙️",
      href: "/admin/settings",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fffaf7] px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
              NasreenDecor
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your complete store from one place.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-bold text-slate-700"
          >
            View Store →
          </Link>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="text-2xl">📦</div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              Total Orders
            </p>

            <p className="mt-1 text-2xl font-black">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="text-2xl">🛍️</div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              Products
            </p>

            <p className="mt-1 text-2xl font-black">
              {productCount || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="text-2xl">⏳</div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              Pending Orders
            </p>

            <p className="mt-1 text-2xl font-black">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="text-2xl">💰</div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              Revenue
            </p>

            <p className="mt-1 text-2xl font-black">
              ₹{revenue.toLocaleString("en-IN")}
            </p>
          </div>

        </section>

        {/* Management */}
        <section className="mt-8">

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Management
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Store Management
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {menu.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                    {item.icon}
                  </div>

                  <span className="text-lg text-slate-300 transition group-hover:text-orange-500">
                    →
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

              </Link>
            ))}

          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8 rounded-3xl bg-slate-900 p-6 text-white">

          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
            Quick Actions
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Manage your store
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">

            <Link
              href="/admin/products"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900"
            >
              + Add Product
            </Link>

            <Link
              href="/admin/orders"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-white"
            >
              View Orders
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}