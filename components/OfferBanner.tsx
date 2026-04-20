"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfferBanner() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-red-600 to-orange-500 overflow-hidden relative z-40 shadow-md"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <p className="text-sm sm:text-base font-bold text-white text-center flex-1 drop-shadow-sm">
              🔥 Get 10% OFF on orders above ₹1299 on your first order
            </p>
            <button
              onClick={() => setIsVisible(false)}
              className="shrink-0 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors focus:outline-none"
              aria-label="Dismiss offer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
