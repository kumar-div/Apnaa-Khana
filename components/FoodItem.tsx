"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/context/CartContext";

interface FoodItemProps extends MenuItem {
  isSpecial?: boolean;
}

export default function FoodItem({ id, name, price, popular, description, isSpecial, image }: FoodItemProps) {
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
      }}
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-400 ease-out hover:shadow-2xl hover:shadow-brand-500/10 ${
        isSpecial
          ? "border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/10 shadow-amber-100/50 dark:shadow-none"
          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:border-brand-200 dark:hover:border-brand-500/50"
      }`}
    >
      {/* Top */}
      <div>
        {image && (
          <div className="mb-5 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 h-44 shrink-0 relative">
            <Image 
              src={image} 
              alt={name} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            {/* Optional gradient overlay to ensure UI overlay text safety if we ever overlap */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {isSpecial && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 rounded-full shadow-sm">
                Combo
              </span>
            )}
            {popular && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">
                Popular
              </span>
            )}
          </div>
        </div>
        {description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
        <p className="mt-5 text-2xl font-extrabold text-brand-600 dark:text-brand-500">
          ₹{price}
        </p>
      </div>

      {/* Quantity + CTA */}
      <div className="flex flex-col gap-5 mt-auto pt-5 border-t border-gray-100 dark:border-gray-800">
        {/* Quantity selector */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2">Quantity</span>
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-600 transition-colors focus:outline-none"
              aria-label="Decrease quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
            </button>
            <span className="px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white min-w-[2.5rem] text-center border-x border-gray-100 dark:border-gray-700">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-600 transition-colors focus:outline-none"
              aria-label="Increase quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>

        {/* Action CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          animate={isAdded ? { scale: [1, 1.1, 1], transition: { duration: 0.3 } } : {}}
          onClick={() => {
            addItem({ id, name, price, popular, description, image }, qty);
            setQty(1);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 800);
          }}
          className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl transition-colors shadow-sm ${
            isAdded
              ? "bg-green-500 text-white hover:bg-green-600"
              : "text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 hover:bg-brand-100 dark:hover:bg-brand-900/60"
          }`}
        >
          {isAdded ? "Added! ✓" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}
