"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

const toastIcons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Backdrop blur when toasts are visible */}
      <AnimatePresence>
        {toasts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10000] bg-black/20 backdrop-blur-[2px] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Centered toast container */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-3 w-full max-w-md px-4">
          <AnimatePresence mode="sync">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                  toast.type === "error"
                    ? "bg-red-500/95 text-white border-red-400/50 shadow-red-500/25"
                    : toast.type === "success"
                    ? "bg-emerald-500/95 text-white border-emerald-400/50 shadow-emerald-500/25"
                    : "bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 border-gray-700/50 dark:border-gray-200/50"
                }`}
              >
                {/* Icon */}
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-black shrink-0 ${
                    toast.type === "error"
                      ? "bg-white/20"
                      : toast.type === "success"
                      ? "bg-white/20"
                      : "bg-white/10 dark:bg-gray-900/10"
                  }`}
                >
                  {toastIcons[toast.type]}
                </span>
                <span className="font-semibold text-sm tracking-wide leading-snug">
                  {toast.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
