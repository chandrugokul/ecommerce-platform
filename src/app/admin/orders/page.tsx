import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#fffaf7] px-4 py-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer orders and delivery status.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Unable to load orders.
          </div>
        )}

        {!error && (!orders || orders.length === 0) && (
          <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center">
            <div className="text-5xl">📦</div>

            <h2 className="mt-4 text-xl font-bold">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Customer orders will appear here.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-900">
                      Order #{order.id}
                    </h2>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      {order.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold">
                    {order.customer_name}
                  </p>

                  <p className="text-sm text-slate-500">
                    📞 {order.customer_phone}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {order.address}, {order.city}, {order.state} -{" "}
                    {order.pincode}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    ₹{Number(order.total).toLocaleString("en-IN")}
                  </p>
                </div>

              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">

                <h3 className="text-sm font-bold">
                  Products
                </h3>

                <div className="mt-3 space-y-2">
                  {Array.isArray(order.items) &&
                    order.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            {item.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="text-sm font-bold">
                          ₹
                          {(
                            Number(item.price) * Number(item.quantity)
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