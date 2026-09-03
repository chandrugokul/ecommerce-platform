"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DeleteProductButton({
  id,
}: {
  id: number | string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed: " + error.message);
      setDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "🗑️ Delete"}
    </button>
  );
}