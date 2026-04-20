"use client";

import { type MenuCategory, categoryLabels } from "@/data/menu";
import { motion } from "framer-motion";

const categories: MenuCategory[] = ["breakfast", "lunch", "mains", "specials", "snacks"];

const categoryIcons: Record<MenuCategory, string> = {
  breakfast: "🍳",
  lunch: "🍛",
  mains: "🥘",
  specials: "⭐",
  snacks: "🍿",
};

interface MenuTabsProps {
  active: MenuCategory;
  onChange: (category: MenuCategory) => void;
}

export default function MenuTabs({ active, onChange }: MenuTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {categories.map((cat) => (
        <motion.button
          key={cat}
          onClick={() => onChange(cat)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className={`relative shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-colors duration-300 ease-out ${
            active === cat
              ? "text-white"
              : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white shadow-sm border border-gray-200 dark:border-gray-800"
          }`}
        >
          {active === cat && (
            <motion.div
              layoutId="activeTabBadge"
              className="absolute inset-0 bg-brand-600 shadow-lg shadow-brand-500/30 rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10 text-base">{categoryIcons[cat]}</span>
          <span className="relative z-10">{categoryLabels[cat]}</span>
        </motion.button>
      ))}
    </div>
  );
}
