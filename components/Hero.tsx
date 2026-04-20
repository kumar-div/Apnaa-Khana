"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 border-b border-gray-200 dark:border-white/10"
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
          alt="Delicious home-cooked food spread"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm md:text-base font-medium text-white/90">
          <span className="text-xl">🏠</span>
          Homestyle cooking, made with love
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.1] tracking-tight">
          Ghar jaisa khana,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300">
            ready when you arrive
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-8 text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium">
          Freshly prepared meals. Order before coming.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
            <button
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 text-lg font-bold text-white bg-brand-500 rounded-xl hover:bg-brand-600 hover:scale-105 transition-all shadow-xl shadow-brand-500/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
              </svg>
              View Menu
            </button>

          <a
            href="tel:+917303598548"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 text-lg font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call Now
          </a>
          </div>
          <p className="text-white/60 text-sm font-medium mt-4">⚡ Fast secure checkout</p>
        </div>

        {/* Trust indicators */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/90 text-sm sm:text-base font-semibold">
          <div className="flex items-center gap-2 drop-shadow-md">
            <span className="text-lg text-[#25D366]">✔</span>
            Freshly Cooked Daily
          </div>
          <div className="flex items-center gap-2 drop-shadow-md">
            <span className="text-lg text-[#25D366]">✔</span>
            Hygienic & Safe
          </div>
          <div className="flex items-center gap-2 drop-shadow-md">
            <span className="text-lg text-[#25D366]">✔</span>
            Affordable Pricing
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
    </section>
  );
}
