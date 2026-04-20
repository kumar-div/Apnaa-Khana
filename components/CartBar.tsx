"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import OrderModal from "@/components/OrderModal";
import { motion, AnimatePresence } from "framer-motion";

export default function CartBar() {
  const { cartItems, cartCount, cartTotal } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-brand-200 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {cartCount} {cartCount === 1 ? "Item" : "Items"}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Total: <span className="text-brand-600 dark:text-brand-400">₹{cartTotal}</span>
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm sm:text-base font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Checkout — ₹{cartTotal}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  );
}
