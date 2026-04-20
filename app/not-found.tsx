"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  // Hide footer and bottom bars on the 404 page, restore on unmount
  useEffect(() => {
    const footer = document.querySelector("footer");
    const stickyBars = document.querySelectorAll<HTMLElement>(".fixed.bottom-0");

    if (footer) footer.style.display = "none";
    stickyBars.forEach((el) => (el.style.display = "none"));

    return () => {
      if (footer) footer.style.display = "";
      stickyBars.forEach((el) => (el.style.display = ""));
    };
  }, []);

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-gray-950 transition-colors">
      <div className="text-center px-4 sm:px-6">
        {/* 404 Number */}
        <h1 className="text-[120px] sm:text-[160px] font-extrabold leading-none tracking-tighter text-gray-200 dark:text-gray-700 select-none">
          404
        </h1>

        {/* Title */}
        <h2 className="-mt-6 sm:-mt-8 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-4 text-base text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:-translate-y-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go Back Home
        </Link>
      </div>
    </section>
  );
}
