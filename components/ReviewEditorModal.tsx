"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export interface ReviewType {
  id?: string;
  user_id?: string;
  name: string;
  comment: string;
  rating: number;
  created_at?: string;
}

interface ReviewEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingReview: ReviewType | null;
  onSuccess: (updatedReview: ReviewType, type: "create" | "update") => void;
}

export default function ReviewEditorModal({
  isOpen,
  onClose,
  existingReview,
  onSuccess,
}: ReviewEditorModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (existingReview) {
        setName(existingReview.name);
        setComment(existingReview.comment);
        setRating(existingReview.rating);
      } else {
        const defaultName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
        setName(defaultName);
        setComment("");
        setRating(5);
      }
      setError("");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, existingReview, user]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) return;

    if (!name.trim() || !comment.trim()) {
      setError("Name and review text are required.");
      return;
    }

    setIsSubmitting(true);
    
    // Explicit safety sanitization (blocks basic XSS injection vectors securely)
    const sanitizeInput = (str: string, maxLen: number) => 
      str.replace(/[<>]/g, '').trim().substring(0, maxLen);

    const payload = {
      user_id: user.id,
      name: sanitizeInput(name, 50),
      rating,
      comment: sanitizeInput(comment, 500),
    };

    if (existingReview?.id) {
      // Update existing
      const { data, error: dbError } = await supabase
        .from("reviews")
        .update(payload)
        .eq("id", existingReview.id)
        .select()
        .single();

      setIsSubmitting(false);

      if (dbError) {
        setError("Failed to update review.");
        return;
      }
      onSuccess(data as ReviewType, "update");
    } else {
      // Insert new
      const { data, error: dbError } = await supabase
        .from("reviews")
        .insert([payload])
        .select()
        .single();

      setIsSubmitting(false);

      if (dbError) {
        setError("Failed to post review. You may already have one.");
        return;
      }
      onSuccess(data as ReviewType, "create");
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {existingReview ? "Edit Your Review" : "Write a Review"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tell us what you think! 
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-zinc-700 rounded-full shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Overall Rating
                </label>
                <div className="flex gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      className={`h-9 w-9 cursor-pointer transition-colors ${
                        star <= (hoverRating || rating) ? "text-amber-400" : "text-gray-200 dark:text-zinc-700"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="reviewer-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reviewer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="reviewer-comment" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reviewer-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none placeholder:text-gray-400"
                  placeholder="Tell us what you loved..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
