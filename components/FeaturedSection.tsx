"use client";

import { motion } from "framer-motion";
import type { MenuItem } from "@/data/menu";
import FoodItem from "@/components/FoodItem";

export default function FeaturedSection({ items }: { items: MenuItem[] }) {
  // 1. If we natively have enough popular items, utilize them
  let popularItems = items.filter((item) => item.is_popular === true);
  let finalData: MenuItem[] = [];

  if (popularItems.length >= 3) {
    finalData = popularItems.slice(0, 3);
  } 
  // 2. Pad with regular items if not enough popular ones
  else if (items.length > 0) {
    const extraNeeded = 3 - popularItems.length;
    const fallbackDbItems = items.filter((item) => !item.is_popular).slice(0, extraNeeded);
    finalData = [...popularItems, ...fallbackDbItems];
  }

  if (finalData.length === 0) return null;

  return (
    <section id="featured" className="py-20 sm:py-24 bg-gray-50 dark:bg-gray-950 transition-colors relative border-b border-gray-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-wide relative inline-block">
            Chef's Recommendations
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-brand-500 rounded-full"></div>
          </h2>
          <p className="mt-8 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Our absolute best-selling signature meals. You definitely don't want to miss these!
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
        >
          {finalData.map((item) => (
              <FoodItem 
                key={item.id || item.name} 
                {...item} 
                isSpecial={true} 
                popular={item.is_popular !== undefined ? item.is_popular : item.popular} 
              />
          ))}
        </motion.div>
      </div>
    </section>
  );
}