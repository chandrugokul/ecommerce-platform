"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  category: string | null;
  description: string | null;
  image_url: string | null;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setProduct(data);

      setName(data.name || "");
      setPrice(String(data.price ?? ""));
      setStockQuantity(String(data.stock_quantity ?? 0));
      setCategory(data.category || "");
      setDescription(data.description || "");
      setPreview(data.image_url || "");

      setLoading(false);
    }

    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!image) return;

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setImage(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (Number(stockQuantity) < 0) {
      setError("Stock quantity cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = product?.image_url || "";

      if (image) {
        const extension =
          image.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `products/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, image);

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          price: Number(price),
          stock_quantity: Number(stockQuantity),
          category: category.trim(),
          description: description.trim(),
          image_url: imageUrl,
        })
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage("Product updated successfully!");

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-slate-500">
          Loading product...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="mb-4 text-sm font-bold text-blue-600"
          >
            ← Back to Products
          </button>

          <p className="mb-1 text-sm font-semibold text-blue-600">
            STORE ADMIN
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update your product information and inventory.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Product Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Product Information
              </h2>

              <p className="text-sm text-slate-500">
                Update the basic details of your product
              </p>
            </div>

            {/* Name */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Name *
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price *
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

            {/* Category */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

          </section>

          {/* Image */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Product Image
              </h2>

              <p className="text-sm text-slate-500">
                Change the product image if needed
              </p>
            </div>

            {preview && (
              <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={preview}
                  alt={name}
                  className="h-56 w-full object-cover"
                />
              </div>
            )}

            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-100">
              📷 Change Image

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-center text-xs text-slate-400">
              JPG, PNG or WEBP • Max 5MB
            </p>

          </section>

          {/* Description */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Description
              </h2>

              <p className="text-sm text-slate-500">
                Update your product description
              </p>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

          </section>

          {/* Actions */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Changes..." : "✓ Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-600"
          >
            Cancel
          </button>

        </form>
      </div>
    </main>
  );
}