# resourced

The premium marketplace for high-quality Roblox assets. Built with Next.js, Supabase, and Stripe Connect.

## Prerequisites

-   **Node.js** (v18+)
-   **Supabase Account** (for Database & Auth)
-   **Stripe Account** (for Payments & Connect)
-   **Stripe CLI** (for local webhook forwarding)

## Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd resourced
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory and add the following keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # Required for admin tasks

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe CLI (see below)
```

### 3. Database Setup

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Navigate to the **SQL Editor**.
3.  Copy the contents of `supabase/schema.sql` and run it.
    *   This creates the `users`, `asset_listings`, and `orders` tables.
    *   It sets up Row Level Security (RLS) policies.
    *   It creates a trigger to handle new user signups.

### 4. Stripe Webhook Setup (Local Development)

To test payments locally, you must forward Stripe events to your localhost.

1.  Login to Stripe CLI:
    ```bash
    stripe login
    ```
2.  Start listening for events:
    ```bash
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
    ```
3.  Copy the **Webhook Signing Secret** (starts with `whsec_`) from the terminal output.
4.  Paste it into your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

*   **Authentication:** Supabase Auth with Role Selection (Buyer/Seller).
*   **Seller Dashboard:** Manage listings and view earnings.
*   **Stripe Connect:** Sellers connect their Stripe accounts to receive payouts.
*   **Marketplace:** Browse, search, and filter Roblox assets.
*   **Payments:** Secure checkout via Stripe with an 8% platform commission.
*   **Asset Delivery:** Secure download links for purchased assets.

## Troubleshooting

*   **"Seller has not connected Stripe":** The seller account must complete the Stripe Connect onboarding in the dashboard.
*   **"Webhook signature verification failed":** Ensure your `STRIPE_WEBHOOK_SECRET` in `.env.local` matches the one from the `stripe listen` command.
*   **Orders not updating:** Ensure the Stripe CLI is running and forwarding events.
