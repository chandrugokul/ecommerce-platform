"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

type Props = {
  product: {
    id: number | string;
    name: string;
    price: number;
    image_url: string | null;
    category: string | null;
  };
  disabled?: boolean;
};

export default function AddToCartButton({
  product,
  disabled = false,
}: Props) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      category: product.category,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
        disabled
          ? "bg-slate-200 text-slate-400"
          : added
          ? "bg-green-600 text-white"
          : "bg-slate-900 text-white hover:bg-slate-700"
      }`}
    >
      {disabled ? "Sold Out" : added ? "✓ Added" : "Add"}
    </button>
  );
}