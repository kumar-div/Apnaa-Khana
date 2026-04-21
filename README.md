# Apnaa Khana

A full-stack food ordering system built for small kitchens and home chefs, featuring real-time order tracking, secure payments, and an admin dashboard. 

Customers can browse the menu, place orders with online payments, and track their order status in real time. Admins manage incoming orders through a dedicated dashboard.

---

## 🚀 Live Demo

👉 https://apnaa-khana-by-div.vercel.app/

---

## Features

- Browse categorised menu with search and filtering
- Cart management with persistent local storage
- Online payments via Razorpay (with webhook verification)
- Real-time order tracking with live status updates
- Admin dashboard for order management and status control
- Email notifications to admin on every new order
- First-order discount system
- Customer reviews with edit and delete support
- Google OAuth and email/password authentication
- Light and dark mode
- Fully responsive across all devices

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Language    | TypeScript                        |
| Database    | Supabase (PostgreSQL + Auth + RLS)|
| Payments    | Razorpay                          |
| Email       | Resend                            |
| Styling     | Tailwind CSS                      |
| Animations  | Framer Motion                     |
| Deployment  | Vercel                            |

---

## Screenshots

<!-- Add screenshots here -->

| Page | Screenshot |
|------|------------|
| Home | ![Home](/public/images/screenshots/home.png) |
| Menu | ![Menu](/public/images/screenshots/menu.png) |
| Checkout | ![Checkout](/public/images/screenshots/checkout.png) |
| Order Tracking | ![Order Tracking](/public/images/screenshots/orders.png) |
| Admin Dashboard | ![Admin Dashboard](/public/images/screenshots/admin.png) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project
- Razorpay account
- Resend account

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/apnaa-khana.git
cd apnaa-khana
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
ADMIN_NOTIFY_EMAIL=admin@example.com

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

⚠️ Never commit your `.env.local` file. It contains sensitive API keys.

### Database Setup

Run the SQL migration files in your Supabase SQL Editor in this order:

1. `supabase-setup.sql` — Base tables and RLS policies
2. `auth-migration.sql` — User roles and admin setup
3. `razorpay-migration.sql` — Payment fields on orders
4. `add-address-migration.sql` — Address field
5. `customer-email-migration.sql` — Customer email on orders
6. `discount-review-migration.sql` — Discount and review tracking
7. `storage-migration.sql` — Image storage bucket
8. `menu-security-migration.sql` — Menu table RLS lockdown
9. `reviews-security-migration.sql` — Reviews table RLS
10. `admin-security-migration.sql` — Admin role policies
11. `webhook-security-migration.sql` — Webhook log table

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
apnaa-khana/
├── app/                    # Next.js App Router pages and API routes
│   ├── admin/              # Admin dashboard
│   ├── api/                # Backend API (Razorpay, order updates)
│   ├── my-orders/          # Customer order history and tracking
│   └── page.tsx            # Homepage
├── components/             # Reusable UI components
├── context/                # React context providers (Auth, Cart)
├── data/                   # Type definitions and constants
├── lib/                    # Utilities (Supabase client, email, helpers)
├── public/images/          # Static assets (food images, logo)
└── *.sql                   # Database migration files
```

---

## Deployment

This project is designed for deployment on **Vercel**.

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add all environment variables from `.env.local` to the Vercel project settings.
4. Update `NEXT_PUBLIC_BASE_URL` to your production domain.
5. Update the Razorpay webhook URL in the Razorpay Dashboard to point to your production endpoint:
   ```
   https://your-domain.com/api/razorpay/webhook
   ```
6. Ensure webhook secrets and email keys are correctly set in production environment variables.

---

## How It Works

1. Customer places an order
2. Payment is processed via Razorpay
3. Webhook confirms payment securely
4. Admin receives email notification
5. Order appears in admin dashboard in real time

---

## License

Copyright (c) 2026 Div

All rights reserved.

This software and its source code are the exclusive property of the author.

Permission is granted to view and use this code for personal and educational purposes only.

You may NOT:
- Copy, reproduce, or redistribute this project or any part of it without permission
- Use this project for commercial purposes
- Sell, sublicense, or rebrand this project

Attribution Requirement:
If any part of this project is used, modified, or referenced,
proper credit MUST be given to the original author (Div) with a link to the original repository.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

---

## 👤 Author

Built by Div