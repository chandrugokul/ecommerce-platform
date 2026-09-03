"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !price) {
      setMessage("Product name and price are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("products").insert({
      name,
      price: Number(price),
      category,
      description,
      image_url: imageUrl || null,
    });

    if (error) {
      console.error(error);
      setMessage("Failed to add product: " + error.message);
    } else {
      setMessage("✅ Product added successfully!");
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setImageUrl("");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-black">Add Product</h1>

        <p className="mb-6 text-gray-500">
          Add a new product to your store.
        </p>

        <form
          onSubmit={addProduct}
          className="space-y-5 rounded-3xl bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block font-semibold">
              Product Name *
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Handmade Rose"
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Price *
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="799"
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Category
            </label>

            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Flowers"
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Image URL
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description..."
              rows={4}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {message && (
            <div className="rounded-xl bg-gray-100 p-4 font-semibold">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </main>
  );
}