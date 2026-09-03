"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Product not found");
        router.push("/admin/products");
        return;
      }

      setName(data.name || "");
      setPrice(String(data.price || ""));
      setCategory(data.category || "");
      setDescription(data.description || "");
      setImageUrl(data.image_url || "");

      setLoading(false);
    }

    if (id) {
      loadProduct();
    }
  }, [id, router]);

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setNewImage(file);

    // Preview image immediately
    setImageUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Please enter product name");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Please enter valid price");
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload new image only if user selected one
      if (newImage) {
        const fileExt = newImage.name.split(".").pop();

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, newImage);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from("products")
        .update({
          name,
          price: Number(price),
          category,
          description,
          image_url: finalImageUrl,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert("Product updated successfully! 🎉");

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Update failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading product...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-xl">

        <button
          onClick={() => router.push("/admin/products")}
          className="mb-6 font-semibold text-blue-600"
        >
          ← Back to Products
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <h1 className="text-3xl font-black">
            Edit Product
          </h1>

          <p className="mt-2 text-gray-500">
            Update your product information.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            {/* Name */}
            <div>
              <label className="font-semibold">
                Product Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            {/* Price */}
            <div>
              <label className="font-semibold">
                Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-semibold">
                Category
              </label>

              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            {/* Image */}
            <div>
              <label className="font-semibold">
                Product Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2 w-full rounded-xl border p-3"
              />

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={name}
                  className="mt-4 h-64 w-full rounded-2xl object-cover"
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label className="font-semibold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}