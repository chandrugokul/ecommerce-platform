"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  store_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("CUSTOMERS ERROR:", error);
        setError(error.message);
        return;
      }

      setCustomers(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customers
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Manage customers for your store.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex w-fit items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Customers
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {customers.length}
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-gray-600">
              Loading customers...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Unable to load customers
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadCustomers}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && customers.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              No customers yet
            </h2>

            <p className="mt-2 text-gray-500">
              Customers will appear here when they place an order.
            </p>
          </div>
        )}

        {!loading && !error && customers.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                      Phone
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                      Address
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                      Pincode
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-orange-50/40"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {customer.name}
                        </p>

                        {customer.email && (
                          <p className="mt-1 text-xs text-gray-500">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {customer.phone || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="max-w-xs">
                        {customer.address || "-"}
                        {customer.city && `, ${customer.city}`}
                        {customer.state && `, ${customer.state}`}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {customer.pincode || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(
                        customer.created_at
                      ).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}