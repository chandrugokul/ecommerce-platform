"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart";

export default function CartIcon() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setCount(getCartCount());
    };

    // Load initial count
    updateCount();

    // Update when cart changes
    window.addEventListener("cart-updated", updateCount);

    return () => {
      window.removeEventListener("cart-updated", updateCount);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-white"
      aria-label="Shopping cart"
    >
      🛒

      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}