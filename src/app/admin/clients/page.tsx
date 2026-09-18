"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: number;
  business_name: string;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive";
  created_at: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);

  async function loadClients() {
    setLoading(true);

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Clients error:", error);
      alert(`Failed to load clients: ${error.message}`);
      setLoading(false);
      return;
    }

    setClients(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function addClient() {
    if (!businessName.trim()) {
      alert("Please enter the business name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("clients")
      .insert({
        business_name: businessName.trim(),
        owner_name: ownerName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        status: "active",
      });

    if (error) {
      console.error("Add client error:", error);
      alert(`Failed to add client: ${error.message}`);
      setSaving(false);
      return;
    }

    setBusinessName("");
    setOwnerName("");
    setEmail("");
    setPhone("");

    await loadClients();

    setSaving(false);

    alert("Client added successfully.");
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">
            Clients
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage all businesses using your e-commerce platform.
          </p>
        </div>

        {/* ADD CLIENT */}
        <section className="mb-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">
            Add New Client
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Business Name *
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(e) =>
                  setBusinessName(e.target.value)
                }
                placeholder="Example: ABC Fashion"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Owner Name
              </label>

              <input
                type="text"
                value={ownerName}
                onChange={(e) =>
                  setOwnerName(e.target.value)
                }
                placeholder="Owner name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="client@example.com"
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
                placeholder="Mobile number"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

          </div>

          <button
            type="button"
            onClick={addClient}
            disabled={saving}
            className="mt-5 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? "Adding Client..." : "+ Add Client"}
          </button>
        </section>

        {/* CLIENT LIST */}
        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">
              All Clients
            </h2>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
              {clients.length} Clients
            </span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading clients...
            </div>
          ) : clients.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No clients found.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-3">
                      Business
                    </th>

                    <th className="px-3 py-3">
                      Owner
                    </th>

                    <th className="px-3 py-3">
                      Email
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
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-slate-50"
                    >
                      <td className="px-3 py-4 font-bold text-slate-900">
                        {client.business_name}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {client.owner_name || "-"}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {client.email || "-"}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {client.phone || "-"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            client.status === "active"
                              ? "bg-green-50 text-green-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {client.status}
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