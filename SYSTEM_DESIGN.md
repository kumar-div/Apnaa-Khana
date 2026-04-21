# Apnaa Khana — Complete Project Explanation (Every Single Detail)

> **GitHub:** https://github.com/kumar-div/Apnaa-Khana/
> **Live Demo:** https://apnaa-khana-by-div.vercel.app/

This document is an exhaustive, simple explanation of the **Apnaa Khana** project. It covers every file, every feature, every function, every API route, every database table, and every design decision. Nothing is skipped.

---

# TABLE OF CONTENTS

1. [What Is Apnaa Khana?](#1-what-is-apnaa-khana)
2. [Tech Stack (What Tools Were Used)](#2-tech-stack-what-tools-were-used)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Configuration Files (Root Level)](#4-configuration-files-root-level)
5. [Database Architecture (All 5 Tables)](#5-database-architecture-all-5-tables)
6. [SQL Migrations (Database Setup Scripts)](#6-sql-migrations-database-setup-scripts)
7. [The Global App Shell (Root Layout)](#7-the-global-app-shell-root-layout)
8. [Context Providers (Global State)](#8-context-providers-global-state)
9. [Library / Utility Files](#9-library--utility-files)
10. [Data Files (Static Config)](#10-data-files-static-config)
11. [Components — Every Single One](#11-components--every-single-one)
12. [Pages — Every Single Route](#12-pages--every-single-route)
13. [API Routes — Every Backend Endpoint](#13-api-routes--every-backend-endpoint)
14. [The Complete Order Flow (Start to Finish)](#14-the-complete-order-flow-start-to-finish)
15. [Real-Time Features (WebSockets)](#15-real-time-features-websockets)
16. [Email System (Resend)](#16-email-system-resend)
17. [Security Architecture](#17-security-architecture)
18. [Styling & Design System](#18-styling--design-system)
19. [Environment Variables (All of Them)](#19-environment-variables-all-of-them)
20. [Deployment (How It Goes Live)](#20-deployment-how-it-goes-live)

---

# 1. What Is Apnaa Khana?

**Apnaa Khana** (meaning "Our Own Food" in Hindi) is a full-stack, production-ready food ordering web application. Think of it like a mini Zomato or Swiggy, but purpose-built for a single home kitchen or cloud kitchen business.

**What a customer can do:**
- Browse a beautiful menu with categories (Breakfast, Lunch, Mains, Specials, Snacks)
- Add items to a cart (cart survives page refresh)
- Checkout with name, phone, delivery address (with auto-location detection)
- Pay securely online via Razorpay
- Get an email receipt automatically
- Track their order status in real-time (Confirmed → Preparing → Out for Delivery → Delivered)
- Write, edit, and delete reviews after their food arrives
- Toggle dark/light mode

**What the admin (restaurant owner) can do:**
- Add, edit, delete menu items (with image upload to cloud storage)
- View all incoming orders in real-time
- Change order statuses (which triggers customer notifications)
- View customer order history and revenue analytics

---

# 2. Tech Stack (What Tools Were Used)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | The backbone. Handles routing, server-side rendering, API routes |
| **UI Library** | React 18 | Component-based UI building |
| **Styling** | Tailwind CSS 3 | Utility-first CSS framework for rapid, responsive design |
| **Animations** | Framer Motion | Smooth page transitions, modal animations, list shuffles |
| **Database** | Supabase (PostgreSQL) | Stores all data (menu, orders, reviews, users, roles) |
| **Authentication** | Supabase Auth | Google OAuth + Email/Password sign-in |
| **Real-time** | Supabase Realtime | WebSocket-based live updates (order tracking) |
| **File Storage** | Supabase Storage | Cloud storage for menu item images |
| **Payments** | Razorpay | Indian payment gateway (UPI, cards, wallets) |
| **Emails** | Resend + React Email | Sends HTML email receipts and admin alerts |
| **Hosting** | Vercel | Edge-optimized deployment platform |
| **Language** | TypeScript | JavaScript with type safety |

### Key npm packages from `package.json`:
- `next` (v14.2.28) — The framework
- `react` / `react-dom` (v18) — UI rendering
- `@supabase/supabase-js` (v2.49.4) — Database client
- `razorpay` (v2.9.6) — Server-side Razorpay SDK
- `resend` (v4.5.2) — Email sending API
- `@react-email/components` (v0.0.36) — Build HTML emails with React
- `framer-motion` (v12.6.3) — Animation library
- `tailwindcss` (v3.4.17) — CSS framework

---

# 3. Project Folder Structure

Here is the complete folder tree with every file explained:

```
d:\apnaa-khana\
│
├── app/                          # Next.js App Router (all pages & API routes)
│   ├── layout.tsx                # ROOT LAYOUT — wraps every page
│   ├── page.tsx                  # HOMEPAGE — the main landing page
│   ├── globals.css               # Global CSS styles + Tailwind imports
│   │
│   ├── menu/
│   │   └── page.tsx              # Redirect → scrolls to /#menu
│   │
│   ├── contact/
│   │   └── page.tsx              # Redirect → scrolls to /#contact
│   │
│   ├── my-orders/
│   │   └── page.tsx              # Customer order tracking page
│   │
│   ├── admin/
│   │   ├── page.tsx              # Admin Menu Manager dashboard
│   │   └── orders/
│   │       └── page.tsx          # Admin Live Orders dashboard
│   │
│   └── api/                      # BACKEND API ROUTES
│       ├── razorpay/
│       │   ├── create-order/
│       │   │   └── route.ts      # Creates Razorpay payment + validates prices
│       │   └── webhook/
│       │       └── route.ts      # Razorpay calls this after payment succeeds
│       └── orders/
│           └── update-status/
│               └── route.ts      # Admin updates order status + sends email
│
├── components/                   # ALL REUSABLE UI COMPONENTS
│   ├── Navbar.tsx                # Top navigation bar
│   ├── Footer.tsx                # Bottom footer
│   ├── HeroSection.tsx           # Big banner at top of homepage
│   ├── FeaturedSection.tsx       # "Popular Items" showcase
│   ├── MenuSection.tsx           # The full menu grid with filters
│   ├── MenuItemCard.tsx          # Individual food item card
│   ├── CartBar.tsx               # Sticky bottom cart summary bar
│   ├── OrderModal.tsx            # THE CHECKOUT MODAL (most complex component)
│   ├── ReviewsSection.tsx        # Reviews display + management
│   ├── ReviewEditorModal.tsx     # Write/edit review popup
│   ├── ContactSection.tsx        # Phone & WhatsApp contact info
│   ├── OfferBanner.tsx           # Dismissible promo banner at top
│   ├── AuthModal.tsx             # Login/Signup popup
│   ├── AuthModalWrapper.tsx      # Thin wrapper connecting AuthModal to context
│   ├── LiveOrderManager.tsx      # Invisible component for real-time tracking
│   ├── StickyBar.tsx             # Mobile "Order Now" floating button
│   ├── ThemeToggle.tsx           # Dark/Light mode toggle button
│   ├── Toast.tsx                 # Toast notification system (success/error/info)
│   ├── PageTransition.tsx        # Smooth fade animations between pages
│   ├── GlobalLoader.tsx          # Full-screen branded loading animation
│   ├── SkeletonCard.tsx          # Loading placeholder for menu cards
│   └── ConfirmDeleteModal.tsx    # "Are you sure?" delete confirmation popup
│
├── context/                      # GLOBAL STATE MANAGERS
│   ├── AuthContext.tsx           # User authentication + admin role checking
│   └── CartContext.tsx           # Shopping cart state + localStorage persistence
│
├── lib/                          # UTILITY / HELPER FILES
│   ├── supabaseClient.ts         # Supabase connection (singleton pattern)
│   ├── email.ts                  # Email sending functions (3 functions)
│   └── utils.ts                  # Date formatting + item parsing helpers
│
├── data/                         # STATIC DATA & TYPE DEFINITIONS
│   ├── orders.ts                 # Order status configs (colors, icons, labels)
│   └── menu.ts                   # Menu item TypeScript types
│
├── public/                       # STATIC ASSETS
│   └── images/
│       └── food-hero.jpg         # Hero section & loader background image
│
├── supabase-setup.sql            # Base database schema creation
├── auth-migration.sql            # Auth upgrade migration (adds user_id, RLS)
│
├── package.json                  # npm dependencies & scripts
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS config (required by Tailwind)
└── README.md                     # Project readme
```

---

# 4. Configuration Files (Root Level)

### `package.json`
Defines the project name (`apnaa-khana`), version, and all dependencies. Key scripts:
- `npm run dev` — starts the development server on localhost:3000
- `npm run build` — creates the production bundle
- `npm run start` — runs the production server

### `tailwind.config.js`
Configures Tailwind CSS:
- **Content paths**: Tells Tailwind to scan `app/`, `components/`, and `lib/` for class names
- **Dark mode**: Set to `"class"` (meaning dark mode is toggled by adding/removing a `dark` CSS class on the `<html>` element, not by OS preference)
- **Custom brand color**: Defines a `brand` color palette (shades 50-950) using an orange/red hue — this is the signature color of the entire app (buttons, highlights, accents)
- **Custom font**: Adds `Outfit` as the default sans-serif font

### `next.config.ts`
Configures Next.js:
- **Image domains**: Allows images from Supabase Storage (`*.supabase.co`) to be loaded securely through Next.js's `<Image>` component
- **Remote patterns**: Configured to accept images from any Supabase subdomain

### `tsconfig.json`
Standard TypeScript config with path aliases — the `@/` prefix maps to the project root, so `@/components/Navbar` means `./components/Navbar`.

### `postcss.config.mjs`
Required by Tailwind CSS. Just loads the Tailwind and Autoprefixer PostCSS plugins.

### `globals.css`
The global stylesheet:
- Imports Tailwind's base, components, and utilities layers
- Imports the "Outfit" Google Font
- Sets smooth scrolling on `<html>`
- Adds a custom scrollbar style for WebKit browsers (thin, rounded, branded colors)
- Contains a `<script>` block (inside `<head>` via layout) that checks `localStorage` for the user's theme preference and applies dark mode before the page even renders (prevents a flash of light/dark)

---

# 5. Database Architecture (All 5 Tables)

### Table 1: `menu_items`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (auto) | Unique identifier |
| `name` | TEXT | Item name (e.g., "Paneer Butter Masala") |
| `price` | NUMERIC | Price in rupees (e.g., 180) |
| `category` | TEXT | One of: breakfast, lunch, mains, specials, snacks |
| `image` | TEXT | URL to the food image (from Supabase Storage) |
| `description` | TEXT | Optional description |
| `is_popular` | BOOLEAN | If true, appears in the "Featured" section |
| `created_at` | TIMESTAMPTZ | When the item was added |

### Table 2: `orders`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (auto) | Unique order identifier |
| `user_id` | UUID (FK → auth.users) | Which logged-in user placed this order |
| `customer_name` | TEXT | Buyer's name |
| `customer_email` | TEXT | Buyer's email (for sending receipts) |
| `phone_number` | TEXT | Contact phone |
| `delivery_address` | TEXT | Where to deliver |
| `items` | JSONB | Array of items: `[{name, price, quantity, id}]` |
| `total_price` | NUMERIC | Final amount charged (after any discount) |
| `instructions` | TEXT | Special cooking/delivery instructions |
| `payment_status` | TEXT | `pending` / `paid` / `failed` |
| `status` | TEXT | `pending` / `confirmed` / `preparing` / `out_for_delivery` / `delivered` / `cancelled` / `failed` |
| `razorpay_order_id` | TEXT | Razorpay's order reference ID |
| `razorpay_payment_id` | TEXT | Razorpay's payment transaction ID |
| `review_prompt_seen` | BOOLEAN | Whether the "Write a Review" popup was shown |
| `created_at` | TIMESTAMPTZ | When the order was placed |

### Table 3: `reviews`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (auto) | Unique review identifier |
| `user_id` | UUID | Which user wrote this review |
| `name` | TEXT | Display name |
| `rating` | INTEGER | Star rating (1-5) |
| `comment` | TEXT | Review text |
| `created_at` | TIMESTAMPTZ | When it was written |

### Table 4: `user_roles`
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | References auth.users |
| `role` | TEXT | The role string, e.g., `"admin"` |

### Table 5: `user_profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | User ID (same as auth.users) |
| `first_order_discount_used` | BOOLEAN | `true` if this user already used their 10% first-order discount |

---

# 6. SQL Migrations (Database Setup Scripts)

### File: `supabase-setup.sql` (The Base Schema)
This is the original database creation script. Run it in the Supabase SQL Editor to create:
- The `orders`, `reviews`, and `menu_items` tables
- Row Level Security (RLS) enabled on all three tables
- Basic RLS policies allowing anyone to read menu items and reviews, and authenticated users to create orders
- Enables Supabase Realtime on the `orders` table (so WebSocket listeners work)

### File: `auth-migration.sql` (The Auth Upgrade)
This migration was run later to add user-specific security:
- Adds the `user_id` column to the `orders` table (linking each order to a Supabase Auth user)
- Creates an index on `user_id` for fast queries
- **Replaces the old permissive RLS policies** with stricter ones:
  - Users can only INSERT orders with their own `user_id`
  - Users can only SELECT (view) their own orders
  - Users can only UPDATE their own orders (for cancellation)
  - A special policy allows the anonymous webhook to update orders (because Razorpay's webhook doesn't have a user session)
  - Admin users get full SELECT access

---

# 7. The Global App Shell (Root Layout)

### File: `app/layout.tsx`

This is the **root layout** — it wraps EVERY single page in the app. Here's exactly what it does:

1. **Metadata**: Sets the page title to "Apnaa Khana | Ghar Jaisa Khana, Online Order Karo" and a description for SEO
2. **Font**: Loads the "Outfit" Google Font using Next.js's built-in font optimization
3. **Dark Mode Script**: Injects an inline `<script>` that runs BEFORE the page renders. It checks `localStorage` for a saved theme preference. If the user previously chose dark mode, it adds the `dark` class to `<html>` immediately, preventing a flash of white
4. **Provider Wrapping**: Wraps the entire app in three nested providers:
   - `AuthProvider` — makes user/admin state available everywhere
   - `CartProvider` — makes cart data available everywhere
   - `ToastProvider` — makes toast notifications available everywhere
5. **Global Components**: Renders components that appear on EVERY page:
   - `OfferBanner` — the dismissible promo strip at the very top
   - `Navbar` — the sticky navigation bar
   - `PageTransition` — wraps the page content with fade animations
   - `AuthModalWrapper` — renders the login/signup modal (triggered from anywhere)
   - `LiveOrderManager` — invisible real-time order listener
   - `GlobalLoader` — the full-screen loading animation
   - `Footer` — the bottom footer
   - `StickyBar` — the mobile floating "Order Now" button

---

# 8. Context Providers (Global State)

### File: `context/AuthContext.tsx`

This is the authentication brain of the app. It creates a React Context that:

1. **On mount**: Calls `supabase.auth.getSession()` to check if the user is already logged in (from a previous visit)
2. **Listens for auth changes**: Subscribes to `supabase.auth.onAuthStateChange()` so it reacts instantly when a user signs in or out
3. **Admin check**: When a user is detected, it queries the `user_roles` table to see if their `user_id` has a row with `role = 'admin'`. The result is stored in the `isAdmin` boolean
4. **Provides to the entire app**:
   - `user` — the Supabase user object (or null)
   - `isAdmin` — boolean
   - `isLoading` — true while checking auth (prevents flicker)
   - `signInWithEmail(email, password)` — email/password login function
   - `signUpWithEmail(email, password)` — email/password signup function
   - `signInWithGoogle()` — Google OAuth login function
   - `signOut()` — logs the user out
   - `openAuthModal()` / `closeAuthModal()` — programmatically opens/closes the login popup
   - `isAuthModalOpen` — boolean for modal state
   - `authModalCallback` / `setAuthModalCallback` — allows passing a function that runs after successful login (e.g., "after you log in, proceed to checkout")

### File: `context/CartContext.tsx`

Manages the shopping cart. It:

1. **Initializes from localStorage**: On first render, reads `apnaa-khana-cart` from `localStorage` and restores the previous cart
2. **Syncs to localStorage**: Every time the cart changes, it saves the updated cart to `localStorage`
3. **Provides to the entire app**:
   - `cartItems` — array of items `[{id, name, price, image, quantity}]`
   - `addToCart(item)` — adds an item (or increments quantity if already in cart)
   - `removeFromCart(id)` — removes an item entirely
   - `updateQuantity(id, quantity)` — sets a specific quantity
   - `clearCart()` — empties the cart
   - `cartTotal` — computed total price (sum of price × quantity for all items)

---

# 9. Library / Utility Files

### File: `lib/supabaseClient.ts`

Creates a **singleton** Supabase client. In development, Next.js hot-reloads modules frequently, which can create multiple Supabase connections. This file uses a `globalThis` pattern to ensure only ONE connection exists:
```
If a global supabase client already exists → reuse it
Otherwise → create a new one and store it globally
```
The client is initialized with:
- `NEXT_PUBLIC_SUPABASE_URL` (your Supabase project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the public anonymous API key)

### File: `lib/email.ts`

Contains THREE email-sending functions, all using the Resend API:

1. **`sendOrderConfirmationEmail(order, customerEmail)`**
   - Sent to the **customer** after payment succeeds
   - Builds a beautiful HTML email using React Email components
   - Shows: order ID, item list with quantities, total price, delivery address, payment status
   - Green branded header with "Order Confirmed! 🎉"

2. **`sendAdminNewOrderEmail(order)`**
   - Sent to the **admin** (the `ADMIN_NOTIFY_EMAIL` env variable) whenever a new paid order comes in
   - Shows: customer name, all items, total, delivery address, phone number
   - Blue branded header with "New Order Alert! 🔔"

3. **`sendStatusUpdateEmail(order, customerEmail)`**
   - Sent to the **customer** when the admin changes the order status
   - Shows: the new status, order details
   - Orange branded header with "Order Status Update 📦"

All three functions:
- Create a Resend client with the `RESEND_API_KEY`
- Build the email body using React components (`@react-email/components`) — meaning the email HTML is constructed just like a React component with `<Html>`, `<Head>`, `<Body>`, `<Container>`, `<Section>`, `<Text>`, etc.
- Send from `onboarding@resend.dev` (Resend's default sender)

### File: `lib/utils.ts`

Two small helper functions:

1. **`formatTime(dateString)`** — Takes an ISO date string and returns a human-readable format like "Today, 2:30 PM" or "Apr 15, 3:45 PM". Uses `suppressHydrationWarning` pattern because date formatting differs between server and client

2. **`parseItems(items)`** — The `items` column in the orders table is stored as JSONB. Sometimes it arrives as a string, sometimes as an already-parsed array. This function safely handles both cases and always returns a clean array of `{name, price, quantity}` objects

---

# 10. Data Files (Static Config)

### File: `data/orders.ts`

Defines the TypeScript types and visual configuration for orders:

- **`OrderStatus` type**: A union of all possible statuses: `"pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" | "failed"`
- **`Order` interface**: The complete TypeScript shape of an order row from the database
- **`ORDER_STATUS_CONFIG`**: A lookup object mapping each status to its:
  - `label` (human-readable name, e.g., "Out for Delivery")
  - `color` (text color class, e.g., `text-blue-700`)
  - `bgColor` (background color class)
  - `icon` (emoji, e.g., "🚚")
- **`getPaymentBorderClass(paymentStatus)`**: Returns a CSS border class based on payment status — green for paid, red for failed, amber for pending

### File: `data/menu.ts`

Defines TypeScript types for menu items:
- **`MenuCategory` type**: `"breakfast" | "lunch" | "mains" | "specials" | "snacks"`
- **`MenuItem` interface**: The shape of a menu item (id, name, price, category, image, description, is_popular, popular, created_at)

---

# 11. Components — Every Single One

### `Navbar.tsx`
The sticky navigation bar at the top of every page.
- Shows the brand logo ("Apnaa Khana") on the left
- Navigation links in the center: Home, Menu, Reviews, Contact (these scroll smoothly to sections on the homepage)
- Right side: Theme toggle (dark/light), cart icon with item count badge, and user menu
- User menu: If not logged in → shows "Sign In" button. If logged in → shows user avatar/name with dropdown (My Orders, Admin Dashboard if admin, Sign Out)
- On mobile: Collapses into a hamburger menu with a slide-out drawer
- Uses `usePathname()` to highlight the active section
- Implements smooth scrolling by checking if you're on the homepage; if yes, it scrolls to the section; if on another page, it navigates to `/#section`

### `HeroSection.tsx`
The large banner/hero section at the top of the homepage.
- Full-width background image (`/images/food-hero.jpg`) with a dark overlay
- Large heading: "Ghar Jaisa Khana, Online Order Karo" (Home-style food, order online)
- Subheading about fresh homemade meals
- Two CTA buttons: "View Menu" (scrolls down) and "Call Now" (tel: link)
- Fully responsive — text sizes and padding adjust for mobile

### `FeaturedSection.tsx`
A horizontal showcase of "Popular" items.
- Fetches items from the `menuItems` prop where `is_popular === true`
- Displays them in a horizontally scrollable row
- Each card shows the item image, name, price, and an "Add to Cart" button
- Uses Framer Motion for entrance animations (items slide up with staggered delay)

### `MenuSection.tsx`
The main menu grid with category filters.
- Shows filter pills at the top: All, Breakfast, Lunch, Mains, Specials, Snacks
- Filters the `menuItems` array by the selected category
- Renders a responsive grid of `MenuItemCard` components
- While loading (SSR data not yet available), shows `SkeletonCard` placeholders
- Uses `AnimatePresence` from Framer Motion to animate cards in/out when switching categories

### `MenuItemCard.tsx`
An individual food item card.
- Shows: food image (with `next/image` for optimization), name, category badge, price
- "Popular" badge if `is_popular` is true
- Quantity controls: ➖ number ➕ (min 1, max 20)
- "Add to Cart" button that calls `addToCart` from CartContext
- Hover effect: card lifts slightly with a shadow
- Image uses `objectFit: cover` so it always looks good regardless of aspect ratio

### `CartBar.tsx`
A sticky bar that appears at the bottom of the screen when the cart has items.
- Shows: number of items, total price, and a "Checkout" button
- Clicking "Checkout" opens the `OrderModal`
- Only visible when `cartItems.length > 0`
- Animated entrance/exit with Framer Motion (slides up from bottom)
- Has a "View Cart" toggle that expands to show the list of items with individual remove buttons

### `OrderModal.tsx` ⭐ (THE MOST COMPLEX COMPONENT — 600+ lines)
This is the checkout flow. Here's everything it does, step by step:

1. **Rendering**: Uses `createPortal` to render outside the normal DOM tree (directly on `document.body`) so it always appears on top of everything
2. **Body scroll lock**: When open, it sets `document.body.style.overflow = "hidden"` to prevent background scrolling
3. **Auth gate**: If the user is not logged in, it shows a "Please sign in to place an order" message with a login button. The login callback is set so that after login, the modal re-opens
4. **Form fields**: Customer name (pre-filled from Google profile), phone number (validated for 10+ digits), delivery address (text input + auto-detect button), special instructions (optional textarea)
5. **Location detection**: The "Get Current Location" button:
   - Calls `navigator.geolocation.getCurrentPosition()` to get GPS coordinates
   - Sends those coordinates to `https://nominatim.openstreetmap.org/reverse` (free OpenStreetMap API) to convert lat/lng into a human-readable address
   - Auto-fills the address field
6. **Cart summary**: Shows all items with quantities and prices, plus the grand total
7. **First-order discount**: If the cart total is ≥ ₹1299 and it's the user's first order, it shows a "10% OFF" badge and the discounted price
8. **Discount check**: Queries `user_profiles` table to check `first_order_discount_used`
9. **Order creation flow**:
   - Creates a new row in the `orders` table in Supabase with status `pending` and payment_status `pending`
   - Calls `/api/razorpay/create-order` with the cart items and the Supabase order ID
   - Receives back a Razorpay order ID and the server-verified amount
   - Opens the Razorpay checkout window (loaded via a `<script>` tag dynamically injected into the page)
   - On success: clears the cart, shows success toast, closes the modal
   - On failure: updates the order to `payment_status: "failed"` and `status: "failed"`

### `ReviewsSection.tsx`
Displays all customer reviews and allows CRUD operations.
- Fetches all reviews from Supabase on mount
- Shows average rating and total review count at the top
- Each review card shows: user avatar (generated from initials), name, star rating, date, and comment text
- If the logged-in user owns a review: shows "Edit" and "Delete" buttons
- "Write a Review" button opens the `ReviewEditorModal`
- Listens for a custom `openReviewModal` DOM event (dispatched by `LiveOrderManager` after delivery)
- Only allows one review per user (checks if user already has a review)

### `ReviewEditorModal.tsx`
A popup form for writing or editing a review.
- Star rating selector: 5 interactive stars that highlight on hover
- Display name input (pre-filled from user profile)
- Review text textarea
- Input sanitization: strips `<` and `>` characters to prevent XSS, trims whitespace, limits length (name: 50 chars, comment: 500 chars)
- Handles both INSERT (new review) and UPDATE (editing existing review) via Supabase queries

### `ConfirmDeleteModal.tsx`
A generic "Are you sure?" confirmation popup.
- Shows a red trash icon, a title, and a subtitle message
- Two buttons: "Cancel" and "Delete" (with loading state)
- Used by `ReviewsSection` when deleting a review
- Rendered via `createPortal` with a backdrop blur

### `ContactSection.tsx`
The contact section on the homepage.
- Shows phone number: +91 73035 98548 (clickable `tel:` link)
- Shows operating hours: 10:00 AM – 9:00 PM
- Two CTA buttons: "WhatsApp Support" (links to `wa.me/917303598548`) and "Call Now"
- WhatsApp button is green with the WhatsApp SVG icon

### `Footer.tsx`
The bottom footer, divided into 4 columns:
1. **Brand**: Logo, tagline "Ghar jaisa taste, delivered with care", and a description
2. **Quick Links**: Home, Menu, Contact (all use smooth scrolling)
3. **Locate Us**: Full address (B 1300, Block B, Mayur Vihar Phase 3, Kondli, Near Malik Nursing Home Hospital, New Delhi 110096), phone number, operating hours
4. **Why Choose Us**: Three bullet points (Fresh Daily, Homemade Taste, Affordable Pricing) plus social links (Instagram, WhatsApp)
5. Copyright line at the bottom with dynamic year

### `OfferBanner.tsx`
A dismissible promotional banner at the very top of the page.
- Red-to-orange gradient background
- Text: "🔥 Get 10% OFF on orders above ₹1299 on your first order"
- Close button (X) that animates the banner collapse using Framer Motion
- Simple state: `isVisible` boolean, starts as `true`

### `AuthModal.tsx`
The login/signup popup. (Referenced from AuthContext)
- Allows Email/Password sign in and sign up
- "Continue with Google" button for Google OAuth
- Tab toggle between "Sign In" and "Sign Up" modes
- Shows error messages from Supabase Auth
- On successful login, calls the optional `onSuccess` callback (which might trigger checkout continuation)

### `AuthModalWrapper.tsx`
A thin 17-line wrapper component. It:
- Reads `isAuthModalOpen`, `closeAuthModal`, and `authModalCallback` from `AuthContext`
- Passes them to the `AuthModal` component
- This separation exists because `AuthModal` is a pure UI component, while `AuthModalWrapper` connects it to the global state

### `LiveOrderManager.tsx`
An **invisible** component (renders no visible UI on screen by default). It:
1. Subscribes to Supabase Realtime on the `orders` table, filtered to the current user's orders
2. When an active order exists (status = confirmed/preparing/out_for_delivery): Shows a **sticky green bar** at the bottom of the screen saying "Your food is being prepared" or "Your order is on the way 🚚". Clicking it navigates to `/my-orders`
3. When an order transitions to "delivered" and `review_prompt_seen` is `false`: Shows a **celebration modal** with 🎉 asking "Order Delivered! How was your experience?" with "Write a Review" and "Later" buttons
4. "Write a Review" button: marks `review_prompt_seen: true` in the database, dispatches a custom `openReviewModal` event, and scrolls to the reviews section
5. "Later" button: simply marks `review_prompt_seen: true` and dismisses

### `StickyBar.tsx`
A floating "Order Now" button visible only on mobile.
- Only shows when the cart is EMPTY (because `CartBar` handles the non-empty state)
- Positioned bottom-right corner, fixed position
- Orange brand color with a large shadow
- Clicking it opens the `OrderModal`

### `ThemeToggle.tsx`
A button that toggles dark/light mode.
- Reads initial state from `document.documentElement.classList.contains("dark")`
- On click: toggles the `dark` class on `<html>` and saves preference to `localStorage` under key `"theme"`
- Shows a sun icon (☀️) in dark mode, moon icon (🌙) in light mode
- Returns a placeholder `<div>` of the same size while loading (to prevent layout shift)

### `Toast.tsx`
A complete toast notification system.
- **`ToastProvider`**: Wraps the app and manages an array of active toasts
- **`showToast(message, type)`**: Adds a new toast (auto-removes after 3.5 seconds)
- **Types**: `success` (green), `error` (red), `info` (neutral dark/light)
- **Visual**: Each toast has an icon badge (✓, ✕, or ℹ), message text, rounded corners, backdrop blur
- **Positioning**: Centered on screen with a subtle dark overlay behind
- **Animation**: Toasts bounce in (spring physics) and fade out

### `PageTransition.tsx`
Wraps the page children with Framer Motion animations.
- Uses `usePathname()` as the animation key — so when the route changes, the old page fades/blurs out and the new one fades in
- Entry: `opacity: 0, y: 12` → `opacity: 1, y: 0`
- Exit: `opacity: 0, filter: blur(4px)`
- Duration: 0.25 seconds

### `GlobalLoader.tsx`
A full-screen branded loading overlay.
- Appears when navigating between pages (triggered by link clicks)
- Shows: dark overlay with backdrop blur, the food-hero image in a rounded square, "Apnaa Khana" text, and an animated progress bar
- The progress bar has a sweeping orange glow effect
- Uses a global event listener system:
  - `window.addEventListener("startGlobalLoad")` — shows the loader
  - Listens for clicks on `<a>` tags; if the link goes to a different route on the same site, shows the loader
  - Uses a 600ms minimum display time to prevent flickering on fast loads

### `SkeletonCard.tsx`
A loading placeholder that mimics the shape of a `MenuItemCard`.
- Shows gray animated pulse rectangles where the image, title, price, and button would be
- Used while the menu data is being fetched from the server

---

# 12. Pages — Every Single Route

### `app/page.tsx` — Homepage (`/`)
The main landing page. It's a **Server Component** meaning it runs on the server at build/request time:
1. Creates a server-side Supabase client
2. Fetches ALL menu items from the `menu_items` table, ordered by `created_at` descending
3. Renders (in order from top to bottom):
   - `HeroSection` — the big banner
   - `FeaturedSection` — popular items (passes the server-fetched items as props)
   - `MenuSection` — the full menu grid (passes the server-fetched items as props)
   - `ReviewsSection` — customer reviews
   - `ContactSection` — phone/WhatsApp contact
   - `CartBar` — sticky cart summary (client component)

### `app/menu/page.tsx` — Menu Page (`/menu`)
A simple redirect. When you visit `/menu`, it immediately navigates to `/#menu` (the menu section on the homepage). This means `/menu` isn't a separate page — it just scrolls to the menu section.

### `app/contact/page.tsx` — Contact Page (`/contact`)
Same as above — redirects to `/#contact`. The contact section lives on the homepage.

### `app/my-orders/page.tsx` — Customer Orders (`/my-orders`)
A full page for customers to track all their orders:

**Auth states:**
- If auth is loading → shows a spinner
- If not logged in → shows a "Sign in to view your orders" page with a login button

**Main view (when logged in):**
- **Tab bar**: "Active" and "Past" tabs with counts
  - Active = orders with status confirmed/preparing/out_for_delivery
  - Past = orders with status delivered/cancelled/failed/pending
- **Order cards**: Each order shows:
  - Date and time
  - Order ID (first segment of UUID)
  - Status badge with color-coded background
  - Total price
  - Items summary (e.g., "2× Paneer Butter Masala, 1× Naan")
  - **Progress Tracker** (for active orders): 4-step animated visual tracker:
    1. 📝 Order Placed
    2. 👨‍🍳 Preparing
    3. 🛵 Out for Delivery
    4. 🎉 Delivered
    - The current step pulses with a glowing ring animation
  - **ETA display**: Shows estimated time based on current status
  - **Cancel button**: Only visible for "pending" orders
  - **Expandable details**: Click to reveal item breakdown, payment status, order ID, and timestamp

**Real-time updates:**
- Subscribes to Supabase Realtime for the current user's orders
- When the admin updates a status, the card updates instantly with a toast notification ("Your food is being prepared 👨‍🍳")

**Cancel flow:**
- Client-side status gate: only allows cancelling if status is still "pending"
- Server-side safety: the Supabase update query includes `.eq("status", "pending")` to prevent race conditions
- Shows a confirmation modal before cancelling

### `app/admin/page.tsx` — Admin Menu Manager (`/admin`)
The admin's menu management dashboard. Protected by role check.

**Access control:**
- If auth is loading → shows "Verifying access..." spinner
- If not logged in OR not admin → shows "Access Denied 🔐" with a "Go Home" link

**Two-column layout (when admin):**

**Left column — Form:**
- Item Name input
- Price (₹) input + Category dropdown (breakfast/lunch/mains/specials/snacks)
- Image upload section:
  - Shows a preview box (80×80px) with the current image or a placeholder
  - Drag-and-drop style upload button that uploads to Supabase Storage bucket `menu-images`
  - File size limit: 5MB
  - Generates a unique filename using timestamp
  - Shows upload progress ("Uploading to Cloud...")
- "Popular / Featured Item?" checkbox
- "Publish Item" or "Update Item" button (depending on whether editing)
- "Cancel" button (when editing, resets the form)

**Right column — Live Menu List:**
- Grid of all current menu items
- Each item shows: image thumbnail, name, price, category badge
- Hover reveals: "Edit" and "Del" buttons
- "POPULAR" badge on featured items
- Item count shown in header

**Image upload flow:**
1. User selects a file → `handleImageUpload` runs
2. Validates file size (max 5MB)
3. Generates filename: `menu-{timestamp}.{extension}`
4. Uploads to Supabase Storage bucket `menu-images` via `supabase.storage.from('menu-images').upload()`
5. Gets the public URL via `supabase.storage.from('menu-images').getPublicUrl()`
6. Stores the URL in state → used when the form is submitted

### `app/admin/orders/page.tsx` — Admin Orders Dashboard (`/admin/orders`)
The live order management control center. Protected by role check.

**Header:**
- Title: "Admin Operations"
- Subtitle: "Live Order Management & History"
- Links: "Menu Manager" (back to `/admin`) and "Customer History" toggle

**Filter bar:**
- Pills for: All, Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled, Failed
- Each pill shows the count of orders in that status
- Empty statuses are hidden

**Order cards (list layout):**
- Each card is a 3-column grid:
  - **Left**: Customer name, timestamp, items list, special instructions (if any)
  - **Center**: Total price, payment badge (Paid Online / Pending / Failed) with color coding
  - **Right**: Status dropdown, action buttons, expand toggle
- **Status dropdown**: Admin can change the status to any value. This triggers an API call to `/api/orders/update-status`
- **Quick action buttons**:
  - "Cancel" — appears for non-delivered/non-cancelled orders
  - "Start Kitchen" — appears only when status is "confirmed"
  - "Mark Delivered" — appears only when status is "out_for_delivery"
- **Expandable details**: Order ID, phone number, user ID, Razorpay transaction ID, ordered timestamp, delivery address
- **Payment border styling**: Green left border for paid, red for failed, amber for pending

**Customer History view (toggle):**
- Groups all orders by customer (using `user_id` or `customer_name`)
- Shows: customer name, total orders count, total revenue (only from paid+delivered orders), delivered count
- Sorted by most active customer first

**Real-time:**
- Subscribes to ALL order changes (not just one user)
- New orders appear instantly
- Toast notification only when an order transitions from "pending" → "confirmed" (meaning payment was verified)

---

# 13. API Routes — Every Backend Endpoint

### `api/razorpay/create-order/route.ts` — Create Payment Order

**Purpose**: Securely creates a Razorpay payment order after validating prices from the database.

**Step-by-step flow:**

1. **Rate limiting**: Uses an in-memory Map to limit each IP to 10 requests per minute. Returns 429 if exceeded.

2. **Input validation**: Checks that `items` is a non-empty array (max 50 items) and `order_id` is provided.

3. **Price verification (CRITICAL SECURITY)**:
   - Extracts all item IDs from the request
   - Fetches the REAL prices from the `menu_items` table using the Supabase SERVICE_ROLE_KEY (bypassing RLS)
   - Calculates the total using ONLY database prices × requested quantities
   - This prevents a hacker from changing prices in the browser

4. **Discount calculation**:
   - Only applies if cart total ≥ ₹1299
   - Checks `user_profiles.first_order_discount_used` for the user
   - If not used: applies 10% discount (`Math.floor(total * 0.10)`)

5. **Force-update the order**: If the database order's `total_price` differs from the server-calculated amount, it overwrites it with the correct secure amount

6. **Razorpay order creation**: Calls `razorpay.orders.create()` with the final amount in paise (amount × 100)

7. **Links Razorpay to Supabase**: Stores the `razorpay_order_id` in the Supabase order row

8. **Returns**: The Razorpay order ID, amount, currency, and whether a discount was applied

### `api/razorpay/webhook/route.ts` — Payment Webhook

**Purpose**: Razorpay calls this URL after a payment is captured. It's the server-to-server safety net.

**Step-by-step flow:**

1. **Read raw body**: Reads the POST body as raw text (NOT parsed JSON yet)

2. **Signature verification**: Uses `crypto.createHmac("sha256", WEBHOOK_SECRET)` with `crypto.timingSafeEqual()` to verify the request is genuinely from Razorpay (not a spoofed request)

3. **Parse JSON**: Only after verification, parses the body as JSON

4. **Event filtering**: Only processes `payment.captured` events. Ignores everything else.

5. **Extract payment data**: Gets the Razorpay payment ID, amount, and the Supabase order ID from `payment.notes.order_id`

6. **Defensive pre-check**: Fetches the current order state from Supabase. Logs it for debugging but does NOT abort if already paid (because optimistic UI updates can cause race conditions)

7. **Update order**: Sets `payment_status: "paid"`, `status: "confirmed"`, and stores the `razorpay_payment_id`

8. **Send emails**:
   - Sends order confirmation email to the customer
   - Sends new order alert to the admin

9. **Consume discount flag**: UPSERTs into `user_profiles` setting `first_order_discount_used: true` so the user can't reuse the 10% discount

### `api/orders/update-status/route.ts` — Admin Status Update

**Purpose**: When an admin changes an order's status in the dashboard, this API handles it securely.

**Step-by-step flow:**

1. **Auth check**: Reads the `Authorization: Bearer <token>` header

2. **Token validation**: Calls `supabase.auth.getUser(token)` using the ANON client to validate the JWT

3. **Admin verification**: Using the SERVICE_ROLE client (bypasses RLS), checks the `user_roles` table to confirm the user has `role: "admin"`. Returns 403 if not.

4. **Update order**: Using the SERVICE_ROLE client, updates the order's status

5. **Send email**: Fetches the updated order, and if `customer_email` exists on the row, sends a status update email via Resend

---

# 14. The Complete Order Flow (Start to Finish)

Here's the entire journey from a customer's first click to receiving their food:

```
1. Customer visits the site
   └→ Homepage loads with server-fetched menu data

2. Customer browses menu, adds items to cart
   └→ Cart state saved in React Context + localStorage

3. Customer clicks "Checkout" on CartBar
   └→ OrderModal opens

4. If not logged in → AuthModal opens first
   └→ After login, OrderModal re-opens with a callback

5. Customer fills in: name, phone, address, instructions
   └→ Optional: clicks "Get Current Location" for auto-fill

6. Customer clicks "Pay ₹XXX"
   └→ Frontend creates a "pending" order in Supabase
   └→ Frontend calls /api/razorpay/create-order with cart + order_id

7. Backend validates prices from database (ignores browser prices)
   └→ Checks for first-order discount eligibility
   └→ Creates Razorpay order with verified amount
   └→ Links razorpay_order_id to the Supabase order

8. Razorpay checkout window opens in the browser
   └→ Customer pays via UPI/Card/Wallet

9. Payment succeeds → TWO things happen:
   a. Frontend: Shows success state, clears cart
   b. Razorpay server → calls /api/razorpay/webhook

10. Webhook:
    └→ Verifies cryptographic signature
    └→ Updates order: payment_status="paid", status="confirmed"
    └→ Marks first_order_discount_used=true
    └→ Sends confirmation email to customer
    └→ Sends alert email to admin

11. Admin sees new order appear on /admin/orders (real-time)
    └→ Changes status to "preparing"
    └→ /api/orders/update-status runs
    └→ Customer gets email + live notification

12. Admin changes to "out_for_delivery"
    └→ Customer's LiveOrderManager shows sticky green bar
    └→ /my-orders page progress tracker updates

13. Admin changes to "delivered"
    └→ Customer gets celebration modal with review prompt
    └→ Customer writes a review

14. Done! 🎉
```

---

# 15. Real-Time Features (WebSockets)

Supabase Realtime is used in THREE places:

1. **`LiveOrderManager.tsx`** (customer side):
   - Channel: `live_orders_{userId}`
   - Filter: `user_id=eq.{userId}` on the `orders` table
   - Listens for: any change (`*`) to pull active orders and delivered orders for review prompts

2. **`app/my-orders/page.tsx`** (customer side):
   - Channel: `my-orders-{userId}`
   - Filter: `user_id=eq.{userId}` on the `orders` table
   - Handles INSERT (new order appears), UPDATE (status change → toast + UI update), DELETE (order removed)

3. **`app/admin/orders/page.tsx`** (admin side):
   - Channel: `admin-orders-realtime`
   - No filter (listens to ALL orders)
   - Handles INSERT (new order card appears), UPDATE (status badge changes), DELETE (order removed)
   - Only shows a toast when an order goes from "pending" → "confirmed" (payment verified)

---

# 16. Email System (Resend)

Three types of automated emails:

| Email | Trigger | Recipient | Content |
|-------|---------|-----------|---------|
| Order Confirmation | Webhook: payment.captured | Customer | "Order Confirmed! 🎉" + order details + items + total |
| New Order Alert | Webhook: payment.captured | Admin | "New Order Alert! 🔔" + customer info + items + address |
| Status Update | Admin changes status | Customer | "Order Status Update 📦" + new status + order details |

All emails are built using React Email components (not raw HTML strings), which makes them:
- Type-safe
- Easy to maintain
- Consistent styling across all email clients

---

# 17. Security Architecture

### A. Row Level Security (RLS)
Every Supabase table has RLS enabled:
- **`menu_items`**: Anyone can read. Only authenticated users with admin role can write.
- **`orders`**: Users can only see/edit their OWN orders. Admins can see all. The anonymous webhook can update orders (for Razorpay).
- **`reviews`**: Users can only edit/delete their own reviews. Anyone can read.
- **`user_roles`**: Only accessible via SERVICE_ROLE_KEY (backend). Frontend can never read this directly.

### B. Server-Side Price Validation
The backend (`create-order`) NEVER trusts the price sent from the browser. It always:
1. Extracts item IDs from the request
2. Looks up REAL prices in the database
3. Calculates the total server-side
4. Overwrites any client-supplied total

### C. Webhook Signature Verification
The Razorpay webhook verifies every request using:
- HMAC-SHA256 with the `RAZORPAY_WEBHOOK_SECRET`
- `crypto.timingSafeEqual()` to prevent timing attacks
- Only parses JSON AFTER signature verification (prevents parsing attacks)

### D. Admin Role Verification
Admin actions go through a double-check:
1. JWT token is validated via Supabase Auth
2. The `user_roles` table is queried with the SERVICE_ROLE_KEY to confirm admin status
3. This prevents someone from faking admin status in their JWT

### E. Input Sanitization
The `ReviewEditorModal` strips `<>` characters from all user input to prevent XSS injection.

### F. Rate Limiting
The `create-order` API has an in-memory rate limiter: max 10 requests per IP per minute.

---

# 18. Styling & Design System

### Brand Colors
The primary brand color is an orange/red palette defined in `tailwind.config.js`:
- Used for: CTA buttons, active states, badges, link hovers, progress bars
- Shades from 50 (lightest) to 950 (darkest)

### Typography
- Font: **Outfit** (loaded from Google Fonts via Next.js `next/font`)
- Weights used: 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold), 900 (black)

### Dark Mode
- Implemented via Tailwind's `class` strategy
- Every element has both light and dark styles (e.g., `bg-white dark:bg-gray-900`)
- Preference stored in `localStorage` under key `"theme"`
- Applied before first paint via inline script in layout (prevents flash)

### Animations
All powered by Framer Motion:
- **Page transitions**: Fade + slight Y-translate + blur on exit
- **Modals**: Scale from 0.95 → 1.0 with spring physics
- **Cards**: Staggered entrance with slide-up
- **Progress tracker**: Animated width bar + pulsing current step
- **Toasts**: Spring bounce in, fade out
- **Global loader**: Sweeping highlight + progress bar shimmer

### Responsive Breakpoints
Uses Tailwind's default breakpoints:
- `sm:` → 640px (small tablets)
- `md:` → 768px (tablets)
- `lg:` → 1024px (laptops)
- Mobile-first approach — base styles are for phones, then scaled up

---

# 19. Environment Variables (All of Them)

| Variable | Public? | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public Supabase key (safe for browsers) |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Server-only key that bypasses all RLS (used in API routes and webhooks) |
| `RAZORPAY_KEY_ID` | Yes* | Razorpay public key (used in checkout widget) |
| `RAZORPAY_KEY_SECRET` | **No** | Server-only Razorpay secret for creating orders |
| `RAZORPAY_WEBHOOK_SECRET` | **No** | Used to verify webhook signatures |
| `RESEND_API_KEY` | **No** | API key for sending emails via Resend |
| `ADMIN_NOTIFY_EMAIL` | **No** | Email address where admin order alerts are sent |
| `NEXT_PUBLIC_BASE_URL` | Yes | The deployed URL (e.g., https://apnaa-khana-by-div.vercel.app) |

*RAZORPAY_KEY_ID is used on the frontend but is designed to be public by Razorpay.

---

# 20. Deployment (How It Goes Live)

1. **Code pushed to GitHub** → `kumar-div/Apnaa-Khana` repository
2. **Vercel watches the repo** → On every push to `main`, Vercel automatically:
   - Runs `npm run build` (creates optimized production bundle)
   - Deploys to edge servers worldwide
3. **Environment variables** are set in Vercel's dashboard (Settings → Environment Variables)
4. **Razorpay webhook URL** must be registered in the Razorpay dashboard pointing to `https://apnaa-khana-by-div.vercel.app/api/razorpay/webhook`
5. **Supabase** is a managed service — no server to maintain

**Custom domain**: Currently using Vercel's default subdomain. Can be connected to a custom domain at any time.

---

# Summary

**Apnaa Khana is NOT a template or mockup.** It is a **fully functional, production-hardened, real-world food ordering system** with:
- ✅ Secure online payments (Razorpay)
- ✅ Real-time order tracking (Supabase WebSockets)
- ✅ Automated email notifications (Resend)
- ✅ Server-side price validation (anti-hack)
- ✅ Row Level Security (data isolation)
- ✅ Admin dashboard (menu + order management)
- ✅ Dark/Light mode
- ✅ Mobile-responsive design
- ✅ First-order discount system
- ✅ Google OAuth + Email auth
- ✅ Auto location detection
- ✅ Customer review system
- ✅ Deployed and live on Vercel

Every feature mentioned in this document is **implemented, tested, and running in production** at https://apnaa-khana-by-div.vercel.app/.
