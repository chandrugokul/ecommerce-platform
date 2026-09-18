import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function getStatusBadge(status: string) {
  const s = status?.toLowerCase() || "";
  switch (s) {
    case "completed":
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "processing":
    case "shipped":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-amber-50 text-amber-800 border-amber-200";
  }
}

export default async function AdminOrdersPage() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-stone-50/60 px-4 py-8 antialiased">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
            NaareenDecor Admin
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 md:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage customer orders and delivery status.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            Unable to load orders. Please try again.
          </div>
        )}

        {/* Empty State */}
        {!error && (!orders || orders.length === 0) && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="text-4xl">📦</div>
            <h2 className="mt-3 text-base font-bold text-slate-900">
              No orders yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Customer orders will appear here once placed.
            </p>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              {/* Card Top: Order Meta & Total */}
              <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Order #{order.id}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:text-right gap-2">
                  <span className="text-xs text-slate-500 font-medium sm:hidden">Total:</span>
                  <div>
                    <p className="text-xl font-black text-slate-900">
                      ₹{Number(order.total || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs font-medium text-slate-600">
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Details */}
              <div className="pt-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Customer
                    </p>
                    <p className="mt-1 font-bold text-slate-900 text-base">
                      {order.customer_name || "Guest Customer"}
                    </p>
                    {order.customer_phone && (
                      <p className="mt-1 flex items-center font-medium text-slate-700">
                        <span className="mr-1.5 text-slate-400">📞</span>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="hover:text-orange-600 hover:underline"
                        >
                          {order.customer_phone}
                        </a>
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Delivery Address
                    </p>
                    <p className="mt-1 font-normal text-slate-700 leading-relaxed">
                      {[order.address, order.city, order.state]
                        .filter(Boolean)
                        .join(", ")}
                      {order.pincode ? ` - ${order.pincode}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="mt-5 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                  Ordered Items
                </p>

                <div className="divide-y divide-slate-200/70">
                  {Array.isArray(order.items) &&
                    order.items.map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.name || "Item"}
                          </p>
                          <p className="text-xs font-medium text-slate-600">
                            Qty: <span className="text-slate-800 font-bold">{item.quantity}</span>
                          </p>
                        </div>

                        <p className="font-bold text-slate-900">
                          ₹
                          {(
                            Number(item.price || 0) * Number(item.quantity || 1)
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
