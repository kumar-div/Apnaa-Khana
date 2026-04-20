import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import StickyBar from "@/components/StickyBar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import CartBar from "@/components/CartBar";
import Footer from "@/components/Footer";
import AuthModalWrapper from "@/components/AuthModalWrapper";
import LiveOrderManager from "@/components/LiveOrderManager";
import PageTransition from "@/components/PageTransition";
import GlobalLoader from "@/components/GlobalLoader";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apnaa Khana – Home Style Food",
  description:
    "Freshly prepared homestyle meals. Order before coming and enjoy ghar jaisa khana made with love.",
  icons: {
    icon: "/images/food-hero.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-white antialiased transition-colors`}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <GlobalLoader />
              <main className="pb-20 md:pb-24 flex flex-col flex-grow">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <CartBar />
              <StickyBar />
              <LiveOrderManager />
              <AuthModalWrapper />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
