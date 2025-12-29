# Sourcely Production Deployment Guide

This guide will walk you through deploying **Sourcely** to a live production environment. Since you have an **ISIC card**, we will leverage student benefits to keep costs at **$0** or very low.

## 🎓 Step 1: Unlock Student Benefits (ISIC)

Your ISIC card is your key to free hosting credits and tools.

1.  **Get the GitHub Student Developer Pack**:
    *   Go to [education.github.com/pack](https://education.github.com/pack).
    *   Sign up using your student email or upload a photo of your **ISIC card** as proof.
    *   **Benefits you get**:
        *   **DigitalOcean**: $200 in hosting credits (Great for databases or backend services if needed later).
        *   **Namecheap / Name.com**: Free domain registration (if you hadn't bought one, but good for future).
        *   **Microsoft Azure**: Free cloud services.
        *   **Stripe**: Waived transaction fees on the first $1,000 in revenue (check the pack for current offer).

## 🚀 Step 2: Hosting (Vercel)

**Vercel** is the best place to host Next.js apps. It is **free** for hobby/personal projects.

1.  **Create a Vercel Account**:
    *   Go to [vercel.com](https://vercel.com) and sign up with **GitHub**.
2.  **Import Your Repository**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your `Sourcely` repository from GitHub.
3.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
4.  **Environment Variables**:
    *   Copy the values from your local `.env` file, but **update them for production**:
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
        *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (Keep this secret!).
        *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your **Live** Stripe Key (starts with `pk_live_...`).
        *   `STRIPE_SECRET_KEY`: Your **Live** Stripe Secret Key (starts with `sk_live_...`).
        *   `STRIPE_WEBHOOK_SECRET`: You will get this in Step 4.
        *   `NEXT_PUBLIC_BASE_URL`: `https://sourcely.shop` (e.g., `https://sourcely.shop`).

## 🗄️ Step 3: Database (Supabase)

For production, it is highly recommended to create a **new, separate Supabase project** to avoid messing up your live data while testing.

1.  **Create Production Project**:
    *   Go to [supabase.com](https://supabase.com) and create a new project named `sourcely-prod`.
    *   Set a strong database password.
2.  **Apply Migrations**:
    *   You need to set up the database schema. You can link your local CLI to the production project or copy the SQL from your migration files in `supabase/migrations/` and run them in the **SQL Editor** of your new project.
3.  **Enable Auth Providers**:
    *   Go to **Authentication** -> **Providers**.
    *   Enable **Email/Password** and **Google** (if used).
    *   **IMPORTANT**: Update the **Site URL** and **Redirect URLs** in Supabase Auth settings to your production domain:
        *   Site URL: `https://sourcely.shop`
        *   Redirect URLs: `https://sourcely.shop/**`

## 💳 Step 4: Payments (Stripe)

1.  **Activate Stripe Account**:
    *   Log in to Stripe and switch from **Test Mode** to **Live Mode**.
    *   Complete the business verification form.
2.  **Create Webhook**:
    *   Go to **Developers** -> **Webhooks**.
    *   Click **"Add endpoint"**.
    *   **Endpoint URL**: `https://sourcely.shop/api/webhooks/stripe`
    *   **Events to listen for**:
        *   `checkout.session.completed`
        *   `customer.subscription.created`
        *   `customer.subscription.updated`
        *   `customer.subscription.deleted`
    *   Copy the **Signing Secret** (`whsec_...`) and add it to Vercel Environment Variables as `STRIPE_WEBHOOK_SECRET`.
3.  **Redeploy Vercel**:
    *   After adding the webhook secret, go to Vercel and click **Redeploy** to apply the new environment variable.

## 🌐 Step 5: Connect Your Domain

Since you already bought a domain:

1.  **In Vercel**:
    *   Go to **Settings** -> **Domains**.
    *   Enter your domain (e.g., `sourcely.shop`) and click **Add**.
    *   Vercel will give you DNS records (A Record and CNAME).
2.  **In Your Domain Registrar** (where you bought the domain):
    *   Find the **DNS Settings** or **Name Server** settings.
    *   Add the **A Record** (76.76.21.21) and **CNAME** (cname.vercel-dns.com) provided by Vercel.
    *   Wait for propagation (usually minutes, sometimes up to 24h).

## ✅ Checklist for Launch

- [ ] **Environment Variables**: All set in Vercel (Live keys, not Test keys).
- [ ] **Database**: Production Supabase project created and schema applied.
- [ ] **Auth**: Supabase Redirect URLs updated to production domain.
- [ ] **Stripe**: Webhook configured and Live Mode activated.
- [ ] **Domain**: DNS records pointing to Vercel and SSL certificate active (Vercel handles SSL automatically).
- [ ] **SEO**: `robots.txt` and `sitemap.xml` (Next.js handles basic SEO, but check `layout.tsx` metadata).

## 💡 Pro Tips for Students

*   **GitHub Student Pack**: Use the **DigitalOcean** credits if you ever need a separate backend worker or a managed Redis database.
*   **Namecheap**: If you need more domains, use the free .me offer.
*   **Vercel Analytics**: Enable "Web Vitals" in Vercel to track your site's performance for free.

**Good luck with the launch of Sourcely! 🚀**
