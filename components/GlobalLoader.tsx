"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(false);

  // Stop loader when navigation completes (pathname or search changes)
  useEffect(() => {
    if (isLoading) {
      // Small artificial timeout ensures the loader doesn't violently flicker on instant cached loads.
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    // Allow manual imperative triggers (e.g., from custom router.push calls in Navbar)
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);

    window.addEventListener("startGlobalLoad", handleStart);
    window.addEventListener("stopGlobalLoad", handleStop);

    // Global Click Interceptor for <Link> and <a> tags
    const handleAnchorClick = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href || target.target === "_blank") return;

      try {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(target.href);

        // Only trigger loading screen for internal cross-route transitions
        if (targetUrl.origin === currentUrl.origin && targetUrl.pathname !== currentUrl.pathname) {
          setIsLoading(true);
        }
      } catch (err) {
        // Ignore invalid URLs gracefully
      }
    };

    // Use capture phase to ensure it catches clicks before other handlers
    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      window.removeEventListener("startGlobalLoad", handleStart);
      window.removeEventListener("stopGlobalLoad", handleStop);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gray-950/80"
        >
          {/* Logo / Brand Drop */}
          <motion.div
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 flex items-center justify-center relative overflow-hidden">
               {/* Animated sweeping highlight */}
               <motion.div 
                 animate={{ x: ["-100%", "200%"] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                 className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-20 pointer-events-none"
               />
               <Image 
                 src="/images/food-hero.jpg" 
                 alt="Apnaa Khana Loader" 
                 fill
                 className="object-cover z-10"
               />
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight">
              Apnaa <span className="text-brand-500">Khana</span>
            </h2>

            {/* Progress Bar Loader */}
            <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2 relative">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-brand-500 w-1/2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
