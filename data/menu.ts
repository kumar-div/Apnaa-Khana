export type MenuItem = {
  id?: string;
  name: string;
  price: number;
  popular?: boolean;
  is_popular?: boolean;
  description?: string;
  image?: string;
  category?: string;
};

export type MenuCategory = "breakfast" | "lunch" | "mains" | "specials" | "snacks";

export const categoryLabels: Record<MenuCategory, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  mains: "Mains",
  specials: "Specials",
  snacks: "Snacks",
};

export const menu: Record<MenuCategory, MenuItem[]> = {
  breakfast: [
    { name: "Poha", price: 60, image: "/images/food/poha.png" },
    { name: "Puri Sabji", price: 100, popular: true, image: "/images/food/puri_sabji.png" },
    { name: "Aloo Paratha (2 pcs)", price: 100, popular: true, image: "/images/food/aloo_paratha.png" },
    { name: "Paneer Paratha", price: 140, image: "/images/food/paneer_paratha.png" },
    { name: "Sandwiches", price: 100, image: "/images/food/sandwiches.png" },
  ],
  lunch: [
    { name: "Plain Rice", price: 80, image: "/images/food/plain_rice.png" },
    { name: "Jeera Rice", price: 100, image: "/images/food/jeera_rice.png" },
    { name: "Chhole Rice", price: 100, popular: true, image: "/images/food/chhole_rice.png" },
    { name: "Kadhi Rice", price: 100, image: "/images/food/kadhi_rice.png" },
    { name: "Dal Tadka Rice", price: 100, image: "/images/food/dal_tadka_rice.png" },
    { name: "Matar Paneer Rice", price: 140, popular: true, image: "/images/food/matar_paneer_rice.png" },
    { name: "Dal Makhni Rice", price: 140, image: "/images/food/dal_makhni_rice.png" },
  ],
  mains: [
    { name: "Rajma", price: 200, popular: true, image: "/images/food/rajma.png" },
    { name: "Chhole", price: 200, image: "/images/food/chhole.png" },
    { name: "Dal Tadka", price: 100, image: "/images/food/dal_tadka.png" },
    { name: "Kadhi", price: 100, image: "/images/food/kadhi.png" },
    { name: "Dal Makhni", price: 250, popular: true, image: "/images/food/dal_makhni.png" },
    { name: "Kadhai Paneer", price: 250, popular: true, image: "/images/food/kadhai_paneer.png" },
    { name: "Matar Paneer", price: 250, image: "/images/food/matar_paneer.png" },
    { name: "Mix Veg", price: 250, image: "/images/food/mix_veg.png" },
  ],
  specials: [
    {
      name: "4 Chapati + Rice + Raita + Salad + Aloo Matar + Dal",
      price: 150,
      image: "/images/food/thali_basic.png"
    },
    {
      name: "4 Chapati + Rice + Raita + Salad + Choice of Curry",
      price: 170,
      description: "Kadhi / Matar Paneer / Rajma / Chhole / Dal Tadka",
      image: "/images/food/thali_deluxe.png"
    },
  ],
  snacks: [
    { name: "Maggi", price: 60, popular: true, image: "/images/food/maggie.png" },
    { name: "Pakoda", price: 60, image: "/images/food/pakoda.png" },
    { name: "Bread Rolls", price: 60, image: "/images/food/bread_roll.png" },
  ],
};
