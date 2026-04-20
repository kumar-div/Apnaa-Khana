"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import ReviewEditorModal, { ReviewType } from "@/components/ReviewEditorModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }).map((_, i) => (
    <svg
      key={i}
      className={`h-5 w-5 ${i < rating ? "text-amber-400" : "text-gray-200 dark:text-zinc-700"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ));
};

export default function ReviewsSection() {
  const { user, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [userReview, setUserReview] = useState<ReviewType | null>(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    // 1. Fetch top 6 public reviews for the grid
    const { data: gridData } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
      
    let finalReviews = gridData || [];

    // 2. Independently verify the specific logged-in user's review status
    if (user) {
      const { data: userSpecificData } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userSpecificData) {
        setUserReview(userSpecificData);
        // Guarantee user sees their own review to access Edit/Delete icons
        // even if it fell off the 'recent 6' pagination limit
        if (!finalReviews.find(r => r.id === userSpecificData.id)) {
           finalReviews = [userSpecificData, ...finalReviews.slice(0, 5)];
        }
      } else {
        setUserReview(null);
      }
    } else {
      setUserReview(null);
    }
    
    setReviews(finalReviews);
  };

  useEffect(() => {
    loadData();

    // Listen for global custom event dispatched from LiveOrderManager
    const handleOpenReview = () => {
      setIsEditorOpen(true);
    };
    window.addEventListener('openReviewModal', handleOpenReview);
    return () => {
      window.removeEventListener('openReviewModal', handleOpenReview);
    };
  }, [user]);

  const handleWriteClick = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsEditorOpen(true);
  };

  const handleEditClick = () => {
    setIsEditorOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userReview?.id) return;
    const { error } = await supabase.from('reviews').delete().eq('id', userReview.id);
    
    if (error) {
      showToast("Failed to delete review", "error");
    } else {
      showToast("Review deleted successfully", "success");
      setIsDeleteConfirmOpen(false);
      setUserReview(null); // Instantly hide edit tools and restore 'Write' button
      loadData();
    }
  };

  const handleModalSuccess = (updatedReview: ReviewType, type: "create" | "update") => {
    setIsEditorOpen(false);
    showToast(type === "create" ? "Review posted successfully!" : "Review updated successfully!", "success");
    setUserReview(updatedReview); // Instantly kill 'Write' button
    loadData();
  };

  return (
    <section className="py-20 sm:py-24 bg-gray-50 dark:bg-[#0f172a] transition-colors relative border-b border-gray-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm pointer-events-none"
            >
              <div 
                className={`py-3 px-6 rounded-full shadow-2xl backdrop-blur-md border border-white/20 flex gap-2 justify-center items-center font-bold text-sm tracking-wide ${
                  toast.type === "error" 
                    ? "bg-red-500/90 text-white" 
                    : "bg-gray-900/90 dark:bg-white/95 text-white dark:text-gray-900"
                }`}
              >
                {toast.type === "success" && "🎉 "} {toast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight relative inline-block">
            Customer Reviews
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-brand-500 rounded-full"></div>
          </h2>
          <p className="mt-8 text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. See what our daily customers have to say!
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id || idx}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200 } }}
                whileHover={{ y: -6 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative group overflow-hidden"
              >
                {/* Actions Overlay (Only visible if user owns the review) */}
                {user && user.id === review.user_id && (
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={handleEditClick}
                      className="p-2 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors border border-gray-200 dark:border-zinc-700"
                      title="Edit Review"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="p-2 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors border border-gray-200 dark:border-zinc-700"
                      title="Delete Review"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Normal Card */}
                <div className="flex gap-1 mb-6 mt-2">{renderStars(review.rating)}</div>
                <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed flex-1 w-full break-words">
                  "{review.comment}"
                </p>
                <div className="font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-zinc-800 pt-5 w-full flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black uppercase text-sm">
                    {review.name.charAt(0)}
                  </div>
                  {review.name}
                  {user && user.id === review.user_id && (
                     <span className="text-[10px] font-bold tracking-wider uppercase text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40 px-2 py-0.5 rounded-md ml-auto">You</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA Button: Only show if they haven't reviewed yet */}
        {!userReview && (
          <div className="mt-16 text-center">
            <button
              onClick={handleWriteClick}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write a Review
            </button>
          </div>
        )}

      </div>

      <ReviewEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        existingReview={userReview || null}
        onSuccess={handleModalSuccess}
      />
      
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Review?"
        subtitle="This action cannot be undone and will permanently remove your feedback from the platform."
      />
    </section>
  );
}
