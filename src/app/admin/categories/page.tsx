"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      alert(error.message);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function addCategory() {
    if (!name.trim()) {
      alert("Enter category name");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      slug: makeSlug(name),
      description: description.trim() || null,
      is_active: true,
    });

    if (error) {
      alert(error.message);
    } else {
      setName("");
      setDescription("");
      await loadCategories();
    }

    setSaving(false);
  }

  async function toggleCategory(category: Category) {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    if (error) {
      alert(error.message);
    } else {
      loadCategories();
    }
  }

  async function deleteCategory(id: number) {
    const confirmed = confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      loadCategories();
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage your product categories.
          </p>
        </div>

        {/* Add Category */}
        <div className="mb-8 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Add Category
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
            />

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
            />
          </div>

          <button
            onClick={addCategory}
            disabled={saving}
            className="mt-4 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "Adding..." : "+ Add Category"}
          </button>
        </div>

        {/* Category List */}
        <div className="rounded-2xl border border-orange-100 bg-white shadow-sm">
          <div className="border-b border-orange-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Category List
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-slate-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No categories found.
            </div>
          ) : (
            <div className="divide-y divide-orange-50">
              {categories.map((category) => (
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
                      onClick={() => toggleCategory(category)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold ${
                        category.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </button>

                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}