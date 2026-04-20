"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const { cartItems, updateQuantity, removeItem, cartTotal, clearCart } = useCart();
  const { user, userName, openAuthModal, setAuthModalCallback } = useAuth();
  const { showToast } = useToast();
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [hasUsedFirstDiscount, setHasUsedFirstDiscount] = useState(true); // Default true structurally avoids flashing incorrect discounts

  // Calculate secure display price natively
  const discountAmount = (!hasUsedFirstDiscount && cartTotal >= 1299) ? Math.floor(cartTotal * 0.10) : 0;
  const finalPayable = cartTotal - discountAmount;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "User-Agent": "ApnaaKhanaApp/1.0",
                "Accept-Language": "en"
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`Reverse geocode failed with status ${response.status}`);
          }
          
          const data = await response.json();

          if (data && data.display_name) {
            setAddress(data.display_name);
            showToast("Address updated from current location!", "success");
          } else {
            showToast("Could not determine your address", "error");
          }
        } catch (error) {
          console.error("Geocoding Error:", error);
          showToast("Failed to fetch location data", "error");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          showToast("Location permission denied. Please enter manually.", "error");
        } else {
          showToast("Failed to secure location. Please try again.", "error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.head.appendChild(script);
    }
    
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("apnaa_khana_phone");
      const savedAddress = localStorage.getItem("apnaa_khana_address");
      if (savedPhone) setPhone(savedPhone);
      if (savedAddress) setAddress(savedAddress);
    }
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('user_profiles')
        .select('first_order_discount_used')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          // If no profile exists yet, they inherently haven't used it
          setHasUsedFirstDiscount(data ? data.first_order_discount_used : false);
        });
    } else {
      setHasUsedFirstDiscount(true); // guests can't use it or default to none
    }
  }, [user]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !mounted) return null;

  // If user isn't logged in, prompt login then return to checkout
  const handleLoginRequired = () => {
    setAuthModalCallback(() => () => {
      // After successful login, modal stays open — user is now authenticated
    });
    openAuthModal();
  };

  const handlePayAndOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      handleLoginRequired();
      return;
    }

    if (cartItems.length === 0) {
      showToast("Your cart is empty — add items first", "error");
      return;
    }
    if (cartTotal <= 0) {
      showToast("Order total must be greater than zero", "error");
      return;
    }
    if (!phone.trim()) {
      showToast("Phone number is required", "error");
      return;
    }
    // Validate Indian phone number: optional +91 prefix, then 10 digits
    const phoneDigits = phone.trim().replace(/[\s\-\(\)]/g, "");
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneDigits)) {
      showToast("Please enter a valid 10-digit Indian phone number", "error");
      return;
    }
    if (!address.trim()) {
      showToast("Delivery address is required", "error");
      return;
    }
    if (!window.Razorpay) {
      showToast("Payment system loading. Try again in a moment.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("apnaa_khana_phone", phone.trim());
        localStorage.setItem("apnaa_khana_address", address.trim());
      }
      
      const sanitizeInput = (str: string, maxLen: number) => 
        str.replace(/[<>]/g, '').trim().substring(0, maxLen);

      let supabaseOrderId = activeOrderId;

      if (!supabaseOrderId) {
        // 1. CREATE ORDER IN SUPABASE (PENDING) — linked to user
        const payload = {
          user_id: user.id,
          customer_name: sanitizeInput(userName || user.email?.split("@")[0] || "Customer", 100),
          customer_email: user.email,
          phone_number: sanitizeInput(phone, 20),
          delivery_address: sanitizeInput(address, 300),
          items: JSON.stringify(cartItems),
          total_price: Number(cartTotal),
          instructions: sanitizeInput(note, 250),
          status: "pending",
          payment_status: "pending",
        };

        const { data: insertedOrder, error: insertError } = await supabase
          .from("orders")
          .insert([payload])
          .select("id")
          .single();

        if (insertError) {
          console.error("SUPABASE ERROR:", insertError);
          showToast(
            `Database error: ${insertError.message || "Failed to save order"}`,
            "error"
          );
          setIsSubmitting(false);
          throw new Error(insertError.message);
        }
        
        supabaseOrderId = insertedOrder?.id;
        setActiveOrderId(supabaseOrderId);
      }

      // 2. CREATE RAZORPAY ORDER VIA BACKEND (Secure Server Calculation)
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: cartItems, 
          order_id: supabaseOrderId 
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.order_id) {
        console.error("❌ RAZORPAY CREATE ORDER FAILED:", orderData);
        showToast(orderData.error || "Failed to initiate payment", "error");
        if (supabaseOrderId) {
          await supabase.from("orders").update({ status: "failed", payment_status: "failed" }).eq("id", supabaseOrderId);
        }
        setIsSubmitting(false);
        return;
      }


      // 3. OPEN CHECKOUT MODAL
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Apnaa Khana",
        description: `Order for ${userName}`,
        order_id: orderData.order_id,
        prefill: { name: userName, email: user.email },
        theme: { color: "#f97316" },
        notes: {
          order_id: supabaseOrderId, // CRITICAL: Links payment to Supabase Order
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {

          // 4. UPDATE ORDER LOCALLY (Optimistic)
          // Webhook serves as backend safety net.
          try {
            await supabase
              .from("orders")
              .update({
                payment_status: "paid",
                status: "confirmed",
                razorpay_payment_id: response.razorpay_payment_id,
              })
              .eq("id", supabaseOrderId);
          } catch (updateErr) {
            console.warn("⚠️ Frontend update failed, webhook handling it:", updateErr);
          }

          showToast("Payment successful! Order confirmed 🎉", "success");
          clearCart();
          setNote("");
          setActiveOrderId(null);
          onClose();
          setIsSubmitting(false);
        },
        modal: {
          ondismiss: async () => {
            // Leave order "pending" so the user can hit Pay again
            setIsSubmitting(false);
          },
          escape: false,
          confirm_close: true,
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async (response: any) => {
        console.error("Payment failed:", response.error?.description);
        showToast(
          response.error?.description || "Payment failed. Please retry your payment.",
          "error"
        );
        // Leave order as "pending" instead of failing so user can immediately retry
        setIsSubmitting(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Order flow error:", err?.message);
      showToast(err?.message || "Something went wrong — please try again", "error");
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={() => !isSubmitting && onClose()}
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-full overflow-hidden transform scale-100 transition-all">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Checkout
          </h3>
          <button
            onClick={() => !isSubmitting && onClose()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <span className="text-5xl mb-5 opacity-80">🛒</span>
              <p className="text-gray-900 dark:text-white text-xl font-bold tracking-tight mb-2">
                No items added yet
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">
                Add your favorite meals to start ordering!
              </p>
              <button
                onClick={() => {
                  onClose();
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-3.5 text-sm font-bold text-white bg-brand-500 rounded-xl hover:bg-brand-600 hover:-translate-y-0.5 transition-all shadow-md shadow-brand-500/20"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                        className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                        className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id!)}
                      className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    ₹{cartTotal}
                  </span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span className="font-bold flex items-center gap-1.5"><span className="text-lg">🔥</span> First Order 10% OFF</span>
                    <span className="text-lg font-bold tracking-tight">
                      - ₹{discountAmount}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-black text-gray-900 dark:text-gray-100 text-lg">Total</span>
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-500">
                    ₹{finalPayable}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* User info display (when logged in) */}
          {user && cartItems.length > 0 && (
            <div className="mb-5 p-4 bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-black shadow-sm shrink-0">
                {(userName || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Ordering as {userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Login prompt (when not logged in) */}
          {!user && cartItems.length > 0 && (
            <div className="mb-5 p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl text-center">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3">
                Sign in to place your order
              </p>
              <button
                onClick={handleLoginRequired}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                Sign In / Create Account
              </button>
            </div>
          )}

          <form id="checkout-form" onSubmit={handlePayAndOrder} className="space-y-4">
            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="checkout-phone"
                required
                value={phone}
                autoComplete="tel"
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="checkout-address"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Autofill with your current location"
                >
                  {isLocating ? (
                    <span className="flex items-center gap-1.5">
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-brand-500 border-t-transparent rounded-full" />
                      Locating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use Current Location
                    </span>
                  )}
                </button>
              </div>
              <textarea
                id="checkout-address"
                required
                rows={2}
                value={address}
                autoComplete="street-address"
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Room No, Building Name, Street..."
              />
            </div>

            <div>
              <label
                htmlFor="checkout-note"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Cooking Instructions (Optional)
              </label>
              <textarea
                id="checkout-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="E.g., Make it spicy, less oil..."
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="px-5 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            type="submit"
            form="checkout-form"
            disabled={cartItems.length === 0 || isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-600/20 hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 opacity-70"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : !user ? (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sign In to Pay
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Pay ₹{finalPayable}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
