"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Order, OrderStatus } from "@/data/orders";
import { ORDER_STATUS_CONFIG } from "@/data/orders";
import Link from "next/link";

const TRACKING_STEPS = [
  { key: "placed", label: "Order Placed", icon: "📝", statuses: ["pending", "confirmed", "accepted"] },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳", statuses: ["preparing"] },
  { key: "out", label: "Out for Delivery", icon: "🛵", statuses: ["out_for_delivery"] },
  { key: "delivered", label: "Delivered", icon: "🎉", statuses: ["delivered"] },
];

import { formatTime, parseItems } from "@/lib/utils";


function ProgressTracker({ order }: { order: Order }) {
  const currentStepIndex = TRACKING_STEPS.findIndex((step) =>
    step.statuses.includes(order.status)
  );
  const isFailedOrCancelled = order.status === "failed" || order.status === "cancelled";

  if (isFailedOrCancelled) {
    return (
      <div className="py-6 flex flex-col items-center text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
        <span className="text-4xl mb-2">❌</span>
        <h3 className="text-base font-black text-red-600 dark:text-red-400">
          Order {order.status === "cancelled" ? "Cancelled" : "Failed"}
        </h3>
      </div>
    );
  }

  return (
    <div className="relative my-6">
      {/* Line behind steps */}
      <div className="absolute top-5 left-5 right-5 h-1 bg-gray-100 dark:bg-zinc-800 rounded-full" />
      {currentStepIndex >= 0 && (
        <motion.div
          className="absolute top-5 left-5 h-1 bg-brand-500 rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentStepIndex / (TRACKING_STEPS.length - 1) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: `calc(100% - 2.5rem)` }}
        />
      )}

      <div className="relative flex justify-between z-10 w-full">
        {TRACKING_STEPS.map((step, index) => {
          const isCompleted = currentStepIndex >= index;
          const isCurrent = currentStepIndex === index;
          return (
            <div key={step.key} className="flex flex-col items-center max-w-[70px]">
              <motion.div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg border-[3px] transition-all duration-500 shadow-sm ${
                  isCompleted
                    ? "bg-brand-500 border-white dark:border-zinc-900 text-white shadow-brand-500/30"
                    : "bg-gray-100 dark:bg-zinc-800 border-white dark:border-zinc-900 opacity-50 grayscale"
                }`}
                animate={
                  isCurrent
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(249,115,22,0)",
                          "0 0 0 8px rgba(249,115,22,0.15)",
                          "0 0 0 0 rgba(249,115,22,0)",
                        ],
                      }
                    : {}
                }
                transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
              >
                {isCompleted && !isCurrent ? "✓" : step.icon}
              </motion.div>
              <p
                className={`text-[10px] sm:text-xs font-bold text-center mt-2 ${
                  isCurrent
                    ? "text-gray-900 dark:text-white"
                    : isCompleted
                    ? "text-gray-600 dark:text-gray-300"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onCancel,
  isExpanded,
  onToggle,
}: {
  order: Order;
  onCancel: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
  const itemsList = parseItems(order.items);
  const isActive = !["delivered", "cancelled", "failed"].includes(order.status);
  const isFailedOrCancelled = order.status === "failed" || order.status === "cancelled";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        isActive
          ? "border-brand-200 dark:border-brand-800/50 shadow-brand-100/50"
          : "border-gray-100 dark:border-zinc-800"
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest" suppressHydrationWarning>
              {formatTime(order.created_at)}
            </p>
            <h4 className="text-lg font-black text-gray-900 dark:text-white truncate mt-0.5">
              Order #{order.id.split("-")[0].toUpperCase()}
            </h4>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              {statusConfig.icon} {statusConfig.label}
            </span>
            <p className="text-lg font-black text-brand-600 dark:text-brand-400">
              ₹{order.total_price}
            </p>
          </div>
        </div>

        {/* Items summary */}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed mb-1">
          {itemsList.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
        </p>

        {/* Active order tracker */}
        {isActive && <ProgressTracker order={order} />}

        {/* ETA for active orders */}
        {isActive && order.status !== "delivered" && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 flex items-center justify-between mt-2">
            <div>
              <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase">
                Estimated Time
              </p>
              <p className="text-sm font-black text-amber-900 dark:text-amber-300">
                {order.status === "preparing"
                  ? "25-35 mins"
                  : order.status === "out_for_delivery"
                  ? "10-15 mins"
                  : "30-45 mins"}
              </p>
            </div>
            <span className="text-2xl animate-bounce">⏱️</span>
          </div>
        )}

        {/* Cancel button for pending orders */}
        {order.status === "pending" && (
          <button
            onClick={() => onCancel(order.id)}
            className="mt-4 w-full py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Cancel Order
          </button>
        )}

        {/* Expandable details */}
        <button
          onClick={onToggle}
          className="w-full text-center mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          {isExpanded ? "Hide Details ▲" : "View Details ▼"}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                {/* Items breakdown */}
                <ul className="space-y-2">
                  {itemsList.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-white dark:bg-zinc-700 shadow-sm w-7 h-7 rounded flex items-center justify-center text-xs font-black text-brand-600 dark:text-brand-400">
                          {item.quantity}x
                        </span>
                        <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-gray-500 dark:text-gray-400">
                        ₹{item.price * item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.instructions && order.instructions.trim() && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                    <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-wider mb-1">
                      Instructions
                    </p>
                    <p className="text-sm text-amber-900 dark:text-amber-300 font-medium">
                      &quot;{order.instructions}&quot;
                    </p>
                  </div>
                )}

                <div className="text-xs space-y-1.5 text-gray-500 dark:text-gray-400 font-medium pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span>Order ID</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">{order.id.split("-")[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment</span>
                    <span className={`font-bold ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                      {order.payment_status === "paid" ? "✓ Paid" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Placed</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200" suppressHydrationWarning>
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, openAuthModal, setAuthModalCallback } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "past">("active");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchMyOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FETCH MY ORDERS ERROR:", error);
      showToast("Failed to load orders", "error");
    } else {
      setOrders((data as Order[]) || []);
    }
    setIsLoading(false);
  }, [user, showToast]);

  // Fetch orders on mount / user change
  useEffect(() => {
    if (user) fetchMyOrders();
  }, [user, fetchMyOrders]);

  // Realtime subscription for user's orders
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`my-orders-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );

            // Show status notification
            const config = ORDER_STATUS_CONFIG[updated.status];
            if (config) {
              if (updated.status === "delivered") {
                showToast("Your order has been delivered! 🎉", "success");
              } else if (updated.status === "preparing") {
                showToast("Your food is being prepared 👨‍🍳", "info");
              } else if (updated.status === "out_for_delivery") {
                showToast("Your order is on the way! 🛵", "info");
              }
            }
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setOrders((prev) => prev.filter((o) => o.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showToast]);

  const handleCancelOrder = async (orderId: string) => {
    // Status gate: only allow cancelling orders that are still "pending"
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status !== "pending") {
      showToast("Only pending orders can be cancelled", "error");
      setShowCancelConfirm(null);
      return;
    }

    setCancellingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("user_id", user!.id)
        .eq("status", "pending");

      if (error) throw error;

      showToast("Order cancelled successfully", "success");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" as OrderStatus } : o))
      );
    } catch {
      showToast("Failed to cancel order", "error");
    } finally {
      setCancellingId(null);
      setShowCancelConfirm(null);
    }
  };

  const activeOrders = useMemo(
    () => orders.filter((o) => !["delivered", "cancelled", "failed", "pending"].includes(o.status)),
    [orders]
  );

  const pastOrders = useMemo(
    () => orders.filter((o) => ["delivered", "cancelled", "failed", "pending"].includes(o.status)),
    [orders]
  );

  const displayOrders = tab === "active" ? activeOrders : pastOrders;

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-6 block">🔒</span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
            Sign in to view your orders
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Create an account or sign in to track your orders in real-time.
          </p>
          <button
            onClick={() => {
              setAuthModalCallback(() => () => {});
              openAuthModal();
            }}
            className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 text-base"
          >
            Sign In / Create Account
          </button>
          <Link
            href="/"
            className="block mt-6 text-sm font-bold text-gray-500 hover:text-brand-500 transition-colors"
          >
            ← Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-brand-500/10 dark:from-brand-500/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-block mb-4 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition"
            >
              ← Back to Menu
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              My Orders
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
              Track your active orders and view history
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-1 shadow-sm self-start">
            <button
              onClick={() => setTab("active")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === "active"
                  ? "bg-brand-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              Active ({activeOrders.length})
            </button>
            <button
              onClick={() => setTab("past")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === "past"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              Past ({pastOrders.length})
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 bg-white dark:bg-zinc-900 rounded-3xl animate-pulse border border-gray-100 dark:border-zinc-800" />
            ))}
          </div>
        ) : displayOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 text-center"
          >
            <span className="text-6xl mb-4">{tab === "active" ? "🍽️" : "📋"}</span>
            <p className="text-xl font-black text-gray-900 dark:text-white mb-2">
              {tab === "active" ? "No active orders" : "No past orders"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 max-w-sm">
              {tab === "active"
                ? "When you place an order, it'll show up here with live tracking."
                : "Your completed and cancelled orders will appear here."}
            </p>
            {tab === "active" && (
              <Link
                href="/"
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-500/20"
              >
                Browse Menu
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {displayOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={(id) => setShowCancelConfirm(id)}
                  isExpanded={expandedOrderId === order.id}
                  onToggle={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-zinc-800 text-center"
            >
              <span className="text-4xl mb-4 block">⚠️</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Cancel Order?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                Are you sure you want to cancel this order? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(null)}
                  disabled={cancellingId !== null}
                  className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition disabled:opacity-50"
                >
                  Keep It
                </button>
                <button
                  onClick={() => handleCancelOrder(showCancelConfirm)}
                  disabled={cancellingId !== null}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancellingId ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
