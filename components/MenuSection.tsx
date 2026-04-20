"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuCategory, MenuItem } from "@/data/menu";
import MenuTabs from "@/components/MenuTabs";
import FoodItem from "@/components/FoodItem";

export default function MenuSection({ initialItems }: { initialItems: MenuItem[] }) {
  const [active, setActive] = useState<MenuCategory>("breakfast");

  // Filter items synchronously from the server-hydrated prop. Eliminates tab-switch skeleton delays.
  const displayedItems = initialItems.filter((item) => 
    item.category?.toLowerCase() === active.toLowerCase()
  );

  return (
    <section id="menu" className="py-20 sm:py-24 bg-white dark:bg-gray-950 transition-colors relative border-b border-gray-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Our Menu
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Ghar jaisa khana — pick your favourite and order online.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <MenuTabs active={active} onChange={setActive} />
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={active}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 mt-12"
          >
            {displayedItems.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                <span className="text-5xl mb-4 block opacity-50">🍽️</span>
                <p className="text-xl font-black text-gray-900 dark:text-white mb-2">Menu currently updating</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">We are refreshing our dishes for this category. Please check back shortly.</p>
              </div>
            ) : (
              displayedItems.map((item) => (
                <FoodItem 
                  key={item.id || item.name} 
                  {...item} 
                  popular={item.is_popular} 
                  isSpecial={active === "specials"} 
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
