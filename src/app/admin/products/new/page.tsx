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
      setMessage("Failed to add product.");
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
        <div className="mb-6">
          <h1 className="text-3xl font-black">Add Product</h1>
          <p className="mt-1 text-gray-500">
            Add a new product to your store.
          </p>
        </div>

        <form
          onSubmit={addProduct}
          className="space-y-5 rounded-3xl bg-white p-6 shadow-sm"
        >
          {/* Product Name */}
          <div>
            <label className="mb-2 block font-semibold">
              Product Name *
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Handmade Flower"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="mb-2 block font-semibold">
              Price *
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="799"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block font-semibold">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Flowers"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="mb-2 block font-semibold">
              Product Image URL
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="mt-2 text-sm text-gray-500">
              We will add direct image upload from your phone next.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-semibold">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={4}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message */}
          {message && (
            <div className="rounded-xl bg-gray-100 p-4 font-semibold">
              {message}
            </div>
          )}

          {/* Submit */}
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