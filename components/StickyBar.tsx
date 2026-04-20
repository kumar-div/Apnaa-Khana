"use client";

import { useState } from "react";
import OrderModal from "@/components/OrderModal";
import { useCart } from "@/context/CartContext";

export default function StickyBar() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cartItems } = useCart();

  if (cartItems.length > 0) return null; // CartBar covers active state.

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="flex items-center gap-2.5 px-6 py-4 text-sm font-extrabold text-white bg-brand-500 rounded-full shadow-[0_10px_30px_rgba(239,68,68,0.4)] hover:shadow-[0_10px_40px_rgba(239,68,68,0.6)] transform hover:-translate-y-1 transition-all"
        >
          <span className="text-xl">🛒</span>
          Order Now
        </button>
      </div>
      <OrderModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  );
}
