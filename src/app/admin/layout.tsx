import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Products", href: "/admin/products", icon: "🛍️" },
  { name: "Orders", href: "/admin/orders", icon: "📦" },
  { name: "Customers", href: "/admin/customers", icon: "👥" },
  { name: "Categories", href: "/admin/categories", icon: "🏷️" },
  { name: "Inventory", href: "/admin/inventory", icon: "📋" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fffaf7]">

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-orange-100 bg-white lg:block">

        <div className="flex h-full flex-col">

          {/* Logo */}
          <Link
            href="/admin"
            className="flex items-center gap-3 border-b border-orange-100 px-6 py-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xl">
              🌸
            </div>

            <div>
              <p className="font-bold text-slate-900">
                NasreenDecor
              </p>

              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                Admin
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
              >
                <span className="text-lg">
                  {item.icon}
                </span>

                {item.name}
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="border-t border-orange-100 p-4">

            <Link
              href="/"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              🏠
              View Store
            </Link>

            <Link
              href="/admin/login"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              🚪
              Logout
            </Link>

          </div>

        </div>
      </aside>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 border-b border-orange-100 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">

          <Link
            href="/admin"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
              🌸
            </div>

            <div>
              <p className="text-sm font-bold">
                NasreenDecor
              </p>

              <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500">
                Admin
              </p>
            </div>
          </Link>

          <Link
            href="/admin/login"
            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
          >
            Logout
          </Link>

        </div>

        {/* Mobile Navigation */}
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-orange-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {children}
      </div>

    </div>
  );
}