"use client";

export default function SkeletonCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm p-5 sm:p-6">
      {/* Top Section */}
      <div>
        {/* Image Skeleton */}
        <div className="mb-5 overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 h-44 animate-pulse"></div>
        
        {/* Title Skeleton */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
        </div>
        
        {/* Price Skeleton */}
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/3"></div>
      </div>

      {/* Action Section */}
      <div className="mt-6 flex flex-col gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse w-full"></div>
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse w-full"></div>
      </div>
    </div>
  );
}
