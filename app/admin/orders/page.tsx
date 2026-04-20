"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Order, OrderStatus } from "@/data/orders";
import { ORDER_STATUS_CONFIG, getPaymentBorderClass } from "@/data/orders";
import Link from "next/link";

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "failed"
];

import { formatTime, parseItems as formatItemsList } from "@/lib/utils";


// ─── Order Card ───
function OrderCard({
  order,
  onStatusChange,
  isExpanded,
  onToggle,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
  const itemsList = formatItemsList(order.items);

  const handleUpdate = async (newStatus: OrderStatus) => {
    if (newStatus === order.status) return;
    setUpdating(true);
    await onStatusChange(order.id, newStatus);
    setUpdating(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-brand-900/5 dark:hover:shadow-2xl dark:hover:shadow-black/60 transition-shadow duration-300 group/row border overflow-hidden ${getPaymentBorderClass(order.payment_status)}`}
    >
      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 p-6 items-center bg-transparent relative z-10">

        {/* LEFT — Customer Info + Items (5 cols) */}
        <div className="col-span-1 lg:col-span-5 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              {order.customer_name}
            </h4>
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0" suppressHydrationWarning>
              {formatTime(order.created_at)}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-snug drop-shadow-sm line-clamp-2">
            {itemsList.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
          </p>
          {order.instructions && order.instructions.trim() && (
            <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400/90 italic bg-amber-50 dark:bg-amber-500/10 self-start px-2 py-1 rounded border border-amber-100 dark:border-amber-500/20">
              📝 {order.instructions}
            </p>
          )}
        </div>

        {/* CENTER — Price + Payment Badge (3 cols) */}
        <div className="col-span-1 lg:col-span-3 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-center gap-3 lg:gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800/60 pt-4 lg:pt-0 lg:pl-8">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            ₹{order.total_price}
          </p>
          {order.payment_status === "paid" ? (
            <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all duration-300 group-hover/row:bg-emerald-100 group-hover/row:border-emerald-300 dark:group-hover/row:bg-emerald-500/20 dark:group-hover/row:border-emerald-500/40">
              Paid Online
            </span>
          ) : order.payment_status === "failed" ? (
            <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 transition-all duration-300 group-hover/row:bg-rose-100 group-hover/row:border-rose-300 dark:group-hover/row:bg-rose-500/20 dark:group-hover/row:border-rose-500/40">
              Payment Failed
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 transition-all duration-300 group-hover/row:bg-amber-100 group-hover/row:border-amber-300 dark:group-hover/row:bg-amber-500/20 dark:group-hover/row:border-amber-500/40">
              Pending Pay
            </span>
          )}
        </div>

        {/* RIGHT — Status Dropdown + Actions (4 cols) */}
        <div className="col-span-1 lg:col-span-4 flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0">
          
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            {/* Status Dropdown */}
            <div className="relative group shrink-0">
              <select
                value={order.status}
                disabled={updating}
                onChange={(e) => handleUpdate(e.target.value as OrderStatus)}
                className="appearance-none cursor-pointer outline-none font-semibold text-xs tracking-wide pl-4 pr-9 py-2 rounded-lg border transition-all duration-300 shadow-sm bg-gray-50 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:ring-2 focus:ring-brand-500/50 hover:bg-gray-100 dark:hover:bg-gray-700 group-hover/row:border-gray-300 dark:group-hover/row:border-gray-600 group-hover/row:bg-white dark:group-hover/row:bg-gray-800"
                style={{ colorScheme: "dark" }}
              >
                {ALL_STATUSES.map(s => {
                  const cfg = ORDER_STATUS_CONFIG[s];
                  return <option key={s} value={s}>{cfg.icon} {cfg.label}</option>;
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors group-hover/row:text-gray-500 dark:group-hover/row:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
              </div>
              {updating && (
                <div className="absolute -right-1 -top-1">
                  <svg className="animate-spin h-4 w-4 text-gray-900 dark:text-white drop-shadow-md" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <button
                onClick={() => handleUpdate("cancelled")}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20 group-hover/row:text-red-400/80 dark:group-hover/row:text-red-400/50 group-hover/row:underline decoration-red-200 dark:decoration-red-900/30 underline-offset-4"
              >
                Cancel
              </button>
            )}
            {order.status === "confirmed" && (
              <button
                onClick={() => handleUpdate("preparing")}
                className="ml-2 text-xs font-bold text-white dark:text-indigo-100 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 border border-indigo-600 dark:border-indigo-500/30 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20 dark:hover:shadow-indigo-900/40 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
              >
                Start Kitchen
              </button>
            )}
            {order.status === "out_for_delivery" && (
              <button
                onClick={() => handleUpdate("delivered")}
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95"
              >
                Mark Delivered
              </button>
            )}

            {/* Expand Toggle */}
            <button
              onClick={onToggle}
              className="p-1.5 ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none group-hover/row:bg-gray-50 dark:group-hover/row:bg-gray-800/40 group-hover/row:text-gray-600 dark:group-hover/row:text-gray-300"
              title={isExpanded ? "Hide details" : "Show details"}
            >
              <svg className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-0">
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-xs text-gray-600 dark:text-gray-300 font-medium">
                <div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Order ID</p>
                  <p className="font-bold text-gray-900 dark:text-white">{order.id.split('-')[0]}</p>
                </div>
                {order.phone_number && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="font-bold text-gray-900 dark:text-white">{order.phone_number}</p>
                  </div>
                )}
                {order.user_id && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">User ID</p>
                    <p className="font-bold text-gray-900 dark:text-white">{order.user_id.split('-')[0]}</p>
                  </div>
                )}
                {order.razorpay_payment_id && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Txn ID</p>
                    <p className="font-bold text-gray-900 dark:text-white">{order.razorpay_payment_id}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Ordered At</p>
                  <p className="font-bold text-gray-900 dark:text-white" suppressHydrationWarning>{new Date(order.created_at).toLocaleString()}</p>
                </div>
                {order.delivery_address && (
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Delivery Address</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800">{order.delivery_address}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Admin Component ───
export default function AdminOrderManagement() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [viewHistory, setViewHistory] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("FETCH ORDERS ERROR:", fetchError);
      setError(fetchError.message);
    } else {
      setOrders((data as Order[]) || []);
    }
    setIsLoading(false);
  }, []);

  // Fetch orders and set up realtime
  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev]);
            // Purposely do NOT show a toast here to respect pending payment workflows
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            const oldOrder = payload.old as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
            
            // STRICTLY pop alert only when an order is verified paid ("pending" -> "confirmed")
            if (oldOrder && oldOrder.status === "pending" && updated.status === "confirmed") {
              showToast(`New Order Received: ${updated.customer_name} 🚀`, "success");
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
  }, [isAdmin, fetchOrders, showToast]);
  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await fetch("/api/orders/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ orderId, status: newStatus })
        });
        
        const textPayload = await res.text();

        let result;
        try {
           result = JSON.parse(textPayload);
        } catch (parseError) {
           throw new Error(`Invalid non-JSON response from server (Status ${res.status}): ${textPayload.substring(0, 100)}`);
        }

        if (!res.ok) throw new Error(result.error || "Failed to update status");

        // Update local state only after confirmed server success
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );

        return { success: true, message: "Status updated" };
      } catch (err: any) {
        console.error("UPDATE ORDER STATUS ERROR:", err);
        return { success: false, message: err.message };
      }
    },
    []
  );

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  // History mapping for customers
  const customerHistory = useMemo(() => {
     const history: Record<string, Order[]> = {};
     orders.forEach(o => {
        const key = o.user_id || o.customer_name;
        if (!history[key]) history[key] = [];
        history[key].push(o);
     });
     return Object.entries(history).sort((a,b) => b[1].length - a[1].length);
  }, [orders]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    const result = await updateOrderStatus(id, status);
    if (!result.success) {
      showToast(result.message, "error");
    }
  };

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <span className="text-6xl mb-4">🔐</span>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 text-center max-w-sm">
          Admin privileges required to manage orders.
        </p>
        <Link href="/" className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 sm:pt-28">
        
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Admin Operations</h1>
            <p className="text-gray-600 dark:text-gray-300 font-bold mt-1">Live Order Management &amp; History</p>
          </div>
          <div className="flex gap-3">
             <Link href="/admin" className="px-5 py-2.5 bg-gray-200 dark:bg-gray-800 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition">
                Menu Manager
             </Link>
             <button onClick={() => setViewHistory(!viewHistory)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-800 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition">
                {viewHistory ? "Live Orders View" : "Customer History"}
             </button>
          </div>
        </div>

        {viewHistory ? (
           <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-black mb-6">Customer History Groups</h2>
              <div className="space-y-4">
                 {customerHistory.map(([key, custOrders]) => {
                    const displayName = custOrders[0]?.customer_name || key.split('-')[0];
                    return (
                      <div key={key} className="flex justify-between items-center p-4 border dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                         <div>
                            <p className="font-bold text-lg">{displayName}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{custOrders.length} orders total</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-brand-600">₹{custOrders.reduce((acc, o) => {
                               // Analytics strictly excludes unpaid/failed/abandoned orders
                               if (["cancelled", "failed", "pending"].includes(o.status)) return acc;
                               if (o.payment_status !== "paid") return acc;
                               return acc + o.total_price;
                            }, 0)}</p>
                            <p className="text-xs font-semibold text-green-600">{custOrders.filter(o => o.status === 'delivered').length} delivered</p>
                         </div>
                      </div>
                    );
                 })}
                 {customerHistory.length === 0 && <p className="text-gray-600 dark:text-gray-300 py-10 text-center">No history yet.</p>}
              </div>
           </div>
        ) : (
           <>
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-gray-900 border dark:border-gray-800 p-2 rounded-2xl shadow-sm">
              <button 
                  onClick={() => setFilter("all")} 
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === "all" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>
                 All
              </button>
              {ALL_STATUSES.map(s => {
                 const count = orders.filter(o => o.status === s).length;
                 if (count === 0 && filter !== s) return null;

                 return (
                  <button 
                   key={s}
                   onClick={() => setFilter(s)} 
                   className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === s ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"}`}>
                     {ORDER_STATUS_CONFIG[s].label}
                     <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === s ? 'bg-gray-700 text-gray-100 dark:bg-gray-200 dark:text-gray-800' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>{count}</span>
                  </button>
              )})}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl border border-red-200 text-sm font-bold text-center">
                Failed to sync live orders: {error}
              </div>
            )}

            {isLoading ? (
               <div className="space-y-4">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="h-20 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border dark:border-gray-800"></div>
                  ))}
               </div>
            ) : filteredOrders.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 border-dashed text-center">
                  <span className="text-6xl mb-4">📭</span>
                  <p className="text-xl font-black">Quiet day!</p>
                  <p className="text-gray-600 dark:text-gray-300 font-bold">No orders found in this category.</p>
               </div>
            ) : (
               <motion.div layout className="space-y-3">
                  <AnimatePresence mode="popLayout">
                     {filteredOrders.map(order => (
                        <OrderCard 
                           key={order.id} 
                           order={order} 
                           onStatusChange={handleStatusChange} 
                           isExpanded={expandedOrderId === order.id}
                           onToggle={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)}
                        />
                     ))}
                  </AnimatePresence>
               </motion.div>
            )}
           </>
        )}
      </div>
    </div>
  );
}
