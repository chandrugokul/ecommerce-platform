"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Client = {
  id: number;
  business_name: string;
};

type Store = {
  id: number;
  client_id: number;
  store_name: string;
  status: "active" | "inactive";
};

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
  const [clients, setClients] = useState<Client[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [clientId, setClientId] = useState("");
  const [storeId, setStoreId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load Clients and Stores
   */
  async function loadClientsAndStores() {
    const { data: clientData, error: clientError } =
      await supabase
        .from("clients")
        .select("id, business_name")
        .order("business_name");

    if (clientError) {
      throw new Error(
        `Failed to load clients: ${clientError.message}`
      );
    }

    const { data: storeData, error: storeError } =
      await supabase
        .from("stores")
        .select(
          "id, client_id, store_name, status"
        )
        .eq("status", "active")
        .order("store_name");

    if (storeError) {
      throw new Error(
        `Failed to load stores: ${storeError.message}`
      );
    }

    setClients(clientData || []);
    setStores(storeData || []);

    /*
     * Select first client/store automatically
     */
    if (clientData && clientData.length > 0) {
      const firstClient = clientData[0];

      setClientId(String(firstClient.id));

      const firstStore = (storeData || []).find(
        (store) =>
          store.client_id === firstClient.id
      );

      if (firstStore) {
        setStoreId(String(firstStore.id));
      }
    }
  }

  /*
   * Load Customers for selected Store
   */
  async function loadCustomers(
    selectedStoreId?: string
  ) {
    setLoading(true);
    setError("");

    try {
      const currentStoreId =
        selectedStoreId || storeId;

      if (!currentStoreId) {
        setCustomers([]);
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq(
          "store_id",
          Number(currentStoreId)
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "CUSTOMERS ERROR:",
          error
        );

        setError(error.message);
        return;
      }

      setCustomers(data || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Initial Load
   */
  useEffect(() => {
    async function initialize() {
      setLoading(true);
      setError("");

      try {
        await loadClientsAndStores();
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load clients and stores."
        );
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  /*
   * Load customers after initial store selection
   */
  useEffect(() => {
    if (storeId) {
      loadCustomers(storeId);
    }
  }, [storeId]);

  /*
   * Client Change
   */
  function handleClientChange(
    e: ChangeEvent<HTMLSelectElement>
  ) {
    const selectedClientId = e.target.value;

    setClientId(selectedClientId);

    const clientStores = stores.filter(
      (store) =>
        String(store.client_id) ===
        selectedClientId
    );

    if (clientStores.length > 0) {
      const firstStore = clientStores[0];

      setStoreId(String(firstStore.id));
    } else {
      setStoreId("");
      setCustomers([]);
    }
  }

  /*
   * Store Change
   */
  function handleStoreChange(
    e: ChangeEvent<HTMLSelectElement>
  ) {
    const selectedStoreId = e.target.value;

    setStoreId(selectedStoreId);

    if (!selectedStoreId) {
      setCustomers([]);
      return;
    }

    loadCustomers(selectedStoreId);
  }

  /*
   * Stores for selected Client
   */
  const filteredStores = stores.filter(
    (store) =>
      String(store.client_id) ===
      String(clientId)
  );

  /*
   * Selected Store
   */
  const selectedStore = stores.find(
    (store) =>
      String(store.id) ===
      String(storeId)
  );

  /*
   * Selected Client
   */
  const selectedClient = clients.find(
    (client) =>
      String(client.id) ===
      String(clientId)
  );

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <div className="mx-auto max-w-7xl px-4 py-6">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="mb-1 text-sm font-bold text-orange-600">
              STORE ADMIN
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Customers
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Manage customers for each client store.
            </p>

          </div>

          <Link
            href="/admin"
            className="inline-flex w-fit items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            ← Dashboard
          </Link>

        </div>

        {/* Client & Store */}
        <div className="mb-6 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Client & Store
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Client */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Client *
              </label>

              <select
                value={clientId}
                onChange={
                  handleClientChange
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-orange-400 focus:bg-white"
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

            {/* Store */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Store *
              </label>

              <select
                value={storeId}
                onChange={
                  handleStoreChange
                }
                disabled={!clientId}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >

                <option value="">
                  {!clientId
                    ? "Select a client first"
                    : filteredStores.length === 0
                    ? "No stores found"
                    : "Select Store"}
                </option>

                {filteredStores.map(
                  (store) => (
                    <option
                      key={store.id}
                      value={store.id}
                    >
                      {store.store_name}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* Selected Store */}
          {selectedStore && (
            <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3">

              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                Viewing Customers For
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {selectedClient?.business_name}
              </p>

              <p className="text-sm text-gray-600">
                {selectedStore.store_name}
              </p>

            </div>
          )}

        </div>

        {/* Statistics */}
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

        {/* Error */}
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
              onClick={() =>
                loadCustomers(storeId)
              }
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border bg-white p-8 text-center">

            <p className="text-gray-600">
              Loading customers...
            </p>

          </div>
        )}

        {/* No Store */}
        {!loading &&
          !error &&
          !storeId && (
            <div className="rounded-xl border bg-white p-10 text-center">

              <div className="mb-3 text-4xl">
                🏪
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Select a store
              </h2>

              <p className="mt-2 text-gray-500">
                Select a client and store to view customers.
              </p>

            </div>
          )}

        {/* No Customers */}
        {!loading &&
          !error &&
          storeId &&
          customers.length === 0 && (
            <div className="rounded-xl border bg-white p-10 text-center">

              <div className="mb-3 text-4xl">
                👥
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                No customers yet
              </h2>

              <p className="mt-2 text-gray-500">
                Customers will appear here when they place an order.
              </p>

            </div>
          )}

        {/* Customer Table */}
        {!loading &&
          !error &&
          storeId &&
          customers.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">

              <div className="border-b border-orange-100 px-5 py-4">

                <h2 className="font-bold text-gray-900">
                  Customer List
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {customers.length} customer
                  {customers.length === 1
                    ? ""
                    : "s"} in this store
                </p>

              </div>

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

                    {customers.map(
                      (customer) => (
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
                            {customer.phone ||
                              "-"}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-700">

                            <div className="max-w-xs">

                              {customer.address ||
                                "-"}

                              {customer.city &&
                                `, ${customer.city}`}

                              {customer.state &&
                                `, ${customer.state}`}

                            </div>

                          </td>

                          <td className="px-4 py-4 text-sm text-gray-700">
                            {customer.pincode ||
                              "-"}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-500">

                            {new Date(
                              customer.created_at
                            ).toLocaleDateString(
                              "en-IN"
                            )}

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

      </div>
    </div>
  );
}