"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const [stockQuantity, setStockQuantity] = useState("0");

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !price) {
      setMessage("Product name and price are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let imageUrl = null;

      // Upload image
      if (image) {
        const fileExtension = image.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExtension}`;

        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, image);

        if (uploadError) {
          throw new Error(
            "Image upload failed: " + uploadError.message
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // Add product to database
      const { error: productError } = await supabase
        .from("products")
        .insert({
          name,
          price: Number(price),
stock_quantity: Number(stockQuantity),
          category,
          description,
          image_url: imageUrl,
        });

      if (productError) {
        throw new Error(
          "Product creation failed: " + productError.message
        );
      }

      setMessage("✅ Product added successfully!");

      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setImage(null);
      setPreview("");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setMessage("❌ " + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black">
            Add Product
          </h1>

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
              placeholder="Handmade Rose"
              className="w-full rounded-xl border px-4 py-3"
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
              min="0"
              step="0.01"
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
<div>
  <label className="mb-2 block text-sm font-medium">
    Stock Quantity
  </label>

  <input
    type="number"
    min="0"
    value={stockQuantity}
    onChange={(e) => setStockQuantity(e.target.value)}
    className="w-full rounded-lg border px-4 py-3"
    placeholder="Enter stock quantity"
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
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block font-semibold">
              Product Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border p-3"
            />

            {preview && (
              <div className="mt-4 overflow-hidden rounded-2xl">
                <img
                  src={preview}
                  alt="Product preview"
                  className="h-64 w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-semibold">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beautiful handmade flower..."
              rows={4}
              className="w-full rounded-xl border px-4 py-3"
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
            {loading ? "Uploading & Saving..." : "Add Product"}
          </button>
        </form>
      </div>
    </main>
  );
}