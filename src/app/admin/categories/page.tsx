"use client";

import { ChangeEvent, useEffect, useState } from "react";
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

type Category = {
  id: number;
  store_id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

export default function CategoriesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [clientId, setClientId] = useState("");
  const [storeId, setStoreId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      alert(
        `Failed to load clients: ${clientError.message}`
      );
      return;
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
      alert(
        `Failed to load stores: ${storeError.message}`
      );
      return;
    }

    setClients(clientData || []);
    setStores(storeData || []);

    /*
     * Automatically select first client/store
     * when available.
     */
    if (clientData && clientData.length > 0) {
      setClientId(String(clientData[0].id));

      const firstStore = (storeData || []).find(
        (store) =>
          store.client_id === clientData[0].id
      );

      if (firstStore) {
        setStoreId(String(firstStore.id));
      }
    }
  }

  /*
   * Load Categories for selected Store
   */
  async function loadCategories(
    selectedStoreId?: string
  ) {
    setLoading(true);

    const currentStoreId =
      selectedStoreId || storeId;

    if (!currentStoreId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq(
        "store_id",
        Number(currentStoreId)
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      alert(
        `Failed to load categories: ${error.message}`
      );
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  /*
   * Initial Load
   */
  useEffect(() => {
    async function initialize() {
      setLoading(true);

      await loadClientsAndStores();

      setLoading(false);
    }

    initialize();
  }, []);

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

      loadCategories(
        String(firstStore.id)
      );
    } else {
      setStoreId("");
      setCategories([]);
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

    loadCategories(selectedStoreId);
  }

  /*
   * Create Slug
   */
  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /*
   * Add Category
   */
  async function addCategory() {
    if (!clientId) {
      alert("Please select a client.");
      return;
    }

    if (!storeId) {
      alert("Please select a store.");
      return;
    }

    if (!name.trim()) {
      alert("Enter category name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("categories")
      .insert({
        store_id: Number(storeId),
        name: name.trim(),
        slug: makeSlug(name),
        description:
          description.trim() || null,
        is_active: true,
      });

    if (error) {
      console.error(error);

      alert(
        `Failed to add category: ${error.message}`
      );
    } else {
      setName("");
      setDescription("");

      await loadCategories(storeId);
    }

    setSaving(false);
  }

  /*
   * Toggle Category
   */
  async function toggleCategory(
    category: Category
  ) {
    const { error } = await supabase
      .from("categories")
      .update({
        is_active: !category.is_active,
      })
      .eq("id", category.id)
      .eq(
        "store_id",
        Number(storeId)
      );

    if (error) {
      alert(error.message);
    } else {
      await loadCategories(storeId);
    }
  }

  /*
   * Delete Category
   */
  async function deleteCategory(
    category: Category
  ) {
    const confirmed = confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id)
      .eq(
        "store_id",
        Number(storeId)
      );

    if (error) {
      alert(error.message);
    } else {
      await loadCategories(storeId);
    }
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
   * Selected Store Name
   */
  const selectedStore = stores.find(
    (store) =>
      String(store.id) ===
      String(storeId)
  );

  return (
    <main className="min-h-screen bg-[#fffaf7] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6">

          <p className="mb-1 text-sm font-bold text-orange-600">
            STORE ADMIN
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage categories for each client store.
          </p>

        </div>

        {/* Client & Store Selection */}
        <div className="mb-8 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Client & Store
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Client */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Client *
              </label>

              <select
                value={clientId}
                onChange={
                  handleClientChange
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white"
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

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Store *
              </label>

              <select
                value={storeId}
                onChange={
                  handleStoreChange
                }
                disabled={!clientId}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
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

          {selectedStore && (
            <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3">

              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                Managing categories for
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {selectedStore.store_name}
              </p>

            </div>
          )}

        </div>

        {/* Add Category */}
        <div className="mb-8 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">

          <h2 className="mb-1 text-lg font-bold text-slate-900">
            Add Category
          </h2>

          <p className="mb-4 text-sm text-slate-500">
            Add a category to the selected store.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Category name"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
            />

            <input
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Description"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
            />

          </div>

          <button
            onClick={addCategory}
            disabled={
              saving ||
              !clientId ||
              !storeId
            }
            className="mt-4 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Adding..."
              : "+ Add Category"}
          </button>

        </div>

        {/* Category List */}
        <div className="rounded-2xl border border-orange-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-orange-100 p-5">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Category List
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedStore
                  ? `Categories for ${selectedStore.store_name}`
                  : "Select a store"}
              </p>

            </div>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
              {categories.length}
            </span>

          </div>

          {loading ? (
            <div className="p-6 text-sm text-slate-500">
              Loading categories...
            </div>
          ) : !storeId ? (
            <div className="p-8 text-center">

              <div className="mb-3 text-4xl">
                🏪
              </div>

              <p className="font-semibold text-slate-700">
                Select a store first
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Categories will appear here.
              </p>

            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center">

              <div className="mb-3 text-4xl">
                📂
              </div>

              <p className="font-semibold text-slate-700">
                No categories found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add the first category for this store.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-orange-50">

              {categories.map(
                (category) => (
                  <div
                    key={category.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div>

                      <h3 className="font-bold text-slate-900">
                        {category.name}
                      </h3>

                      <p className="text-xs text-slate-400">
                        /{category.slug}
                      </p>

                      {category.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {category.description}
                        </p>
                      )}

                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          toggleCategory(
                            category
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-bold ${
                          category.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {category.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>

                      <button
                        onClick={() =>
                          deleteCategory(
                            category
                          )
                        }
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}