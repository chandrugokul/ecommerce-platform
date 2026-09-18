"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: number;
  business_name: string;
};

type Store = {
  id: number;
  client_id: number;
  store_name: string;
  slug: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  status: "active" | "inactive";
};

export default function ClientStoresPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);

    const { data: clientData, error: clientError } =
      await supabase
        .from("clients")
        .select("id, business_name")
        .order("business_name");

    if (clientError) {
      alert(`Failed to load clients: ${clientError.message}`);
      setLoading(false);
      return;
    }

    const { data: storeData, error: storeError } =
      await supabase
        .from("stores")
        .select(
          "id, client_id, store_name, slug, city, state, phone, status"
        )
        .order("created_at", { ascending: false });

    if (storeError) {
      alert(`Failed to load stores: ${storeError.message}`);
      setLoading(false);
      return;
    }

    setClients(clientData || []);
    setStores(storeData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addStore() {
    if (!clientId) {
      alert("Please select a client.");
      return;
    }

    if (!storeName.trim()) {
      alert("Please enter the store name.");
      return;
    }

    if (!slug.trim()) {
      alert("Please enter a store slug.");
      return;
    }

    setSaving(true);

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const { error } = await supabase
      .from("stores")
      .insert({
        client_id: Number(clientId),
        store_name: storeName.trim(),
        slug: cleanSlug,
        city: city.trim() || null,
        state: state.trim() || null,
        phone: phone.trim() || null,
        status: "active",
      });

    if (error) {
      console.error(error);
      alert(`Failed to create store: ${error.message}`);
      setSaving(false);
      return;
    }

    setClientId("");
    setStoreName("");
    setSlug("");
    setCity("");
    setState("");
    setPhone("");

    await loadData();

    setSaving(false);

    alert("Store created successfully.");
  }

  function getClientName(clientId: number) {
    const client = clients.find(
      (item) => item.id === clientId
    );

    return client?.business_name || "Unknown Client";
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">
            Client Stores
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage stores for each client.
          </p>
        </div>

        {/* CREATE STORE */}
        <section className="mb-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">
            Create New Store
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Client *
              </label>

              <select
                value={clientId}
                onChange={(e) =>
                  setClientId(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="">
                  Select Client
                </option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.business_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Store Name *
              </label>

              <input
                type="text"
                value={storeName}
                onChange={(e) =>
                  setStoreName(e.target.value)
                }
                placeholder="Example: ABC Fashion Main Store"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Store Slug *
              </label>

              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value)
                }
                placeholder="abc-fashion"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <p className="mt-1 text-xs text-slate-400">
                Example: abc-fashion
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                placeholder="City"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                State
              </label>

              <input
                type="text"
                value={state}
                onChange={(e) =>
                  setState(e.target.value)
                }
                placeholder="State"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Store phone"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

          </div>

          <button
            type="button"
            onClick={addStore}
            disabled={saving}
            className="mt-5 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:bg-slate-400"
          >
            {saving
              ? "Creating Store..."
              : "+ Create Store"}
          </button>
        </section>

        {/* STORE LIST */}
        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">
              All Stores
            </h2>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
              {stores.length} Stores
            </span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading stores...
            </div>
          ) : stores.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No stores found.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-3">
                      Client
                    </th>

                    <th className="px-3 py-3">
                      Store
                    </th>

                    <th className="px-3 py-3">
                      Slug
                    </th>

                    <th className="px-3 py-3">
                      Location
                    </th>

                    <th className="px-3 py-3">
                      Phone
                    </th>

                    <th className="px-3 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stores.map((store) => (
                    <tr
                      key={store.id}
                      className="border-b border-slate-50"
                    >
                      <td className="px-3 py-4 font-bold text-slate-900">
                        {getClientName(store.client_id)}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-700">
                        {store.store_name}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-500">
                        {store.slug}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {[store.city, store.state]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {store.phone || "-"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            store.status === "active"
                              ? "bg-green-50 text-green-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {store.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}