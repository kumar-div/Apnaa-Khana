import Hero from "@/components/Hero";
import OfferBanner from "@/components/OfferBanner";
import FeaturedSection from "@/components/FeaturedSection";
import MenuSection from "@/components/MenuSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import { supabase } from "@/lib/supabaseClient";
import type { MenuItem } from "@/data/menu";

// Force dynamic or let Next/Supabase cache it. Given it's a menu, we can let it revalidate naturally via Next.js
export const revalidate = 60; // Revalidate menu every 60 seconds

export default async function Home() {
  // Fetch menu once on the server (SSR/SSG), completely removing dual client waterfalls
  const { data: menuData, error } = await supabase
    .from("menu_items")
    .select("id, name, description, price, category, image, is_popular, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch menu items on server:", error);
  }

  const items: MenuItem[] = menuData || [];

  return (
    <>
      <Hero />
      <OfferBanner />
      <FeaturedSection items={items} />
      <MenuSection initialItems={items} />
      <ReviewsSection />
      <ContactSection />
    </>
  );
}
