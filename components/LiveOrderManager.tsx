"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveOrderManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [deliveredOrderToReview, setDeliveredOrderToReview] = useState<any>(null);
  
  useEffect(() => {
    if (!user) {
       setActiveOrder(null);
       setDeliveredOrderToReview(null);
       return;
    }

    const fetchOrders = async () => {
      // 1. Fetch active tracking order safely
      const { data: active } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['confirmed', 'preparing', 'out_for_delivery'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveOrder(active);

      // 2. Fetch unprompted delivered order
      const { data: delivered } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'delivered')
        .eq('review_prompt_seen', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (delivered) {
         setDeliveredOrderToReview(delivered);
      }
    };

    fetchOrders();

    const channel = supabase
      .channel(`live_orders_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleReviewDismiss = async () => {
     if (deliveredOrderToReview) {
       await supabase.from('orders').update({ review_prompt_seen: true }).eq('id', deliveredOrderToReview.id);
       setDeliveredOrderToReview(null);
     }
  };

  const handleWriteReview = async () => {
     await handleReviewDismiss();
     window.dispatchEvent(new Event('openReviewModal'));
     router.push("/#reviews"); 
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Your order has been placed successfully";
      case "confirmed": return "Restaurant confirmed your order";
      case "preparing": return "Your food is being prepared";
      case "out_for_delivery": return "Your order is on the way 🚚";
      default: return "";
    }
  };

  return (
    <>
      {/* 1. STICKY BOTTOM TRACKING BAR */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 pointer-events-none flex justify-center"
          >
            <div 
               onClick={() => router.push("/my-orders")}
               className="pointer-events-auto bg-green-500 hover:bg-green-600 text-white shadow-[0_8px_30px_rgba(34,197,94,0.4)] backdrop-blur-md px-6 py-4 rounded-3xl cursor-pointer w-full max-w-sm flex items-center justify-between transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <div className="flex flex-col">
                 <span className="text-xs font-black uppercase tracking-wider text-green-100">Live Status</span>
                 <span className="text-sm font-bold leading-tight mt-0.5">{getStatusText(activeOrder.status)}</span>
              </div>
              <div className="shrink-0 bg-white/20 p-2 rounded-full flex items-center justify-center animate-pulse">
                 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                 </svg>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. POST-DELIVERY REVIEW PROMPT MODAL */}
      <AnimatePresence>
        {deliveredOrderToReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleReviewDismiss} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-zinc-800 text-center"
            >
              <div className="p-8">
                <div className="text-5xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  Order Delivered!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Your order has arrived! How was your experience with Apnaa Khana today?
                </p>
              </div>

              <div className="flex flex-col border-t border-gray-100 dark:border-zinc-800">
                <button
                  onClick={handleWriteReview}
                  className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all shadow-md active:bg-brand-700"
                >
                  Write a Review
                </button>
                <button
                  onClick={handleReviewDismiss}
                  className="w-full py-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold transition-all hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
