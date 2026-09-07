# VaniDaxi

Marketplace frontend built with React + Vite + Supabase.

## Local development

1. Copy `.env.example` to `.env`.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` when using Supabase.
3. Run the SQL in `schema.sql` from the Supabase SQL Editor when setting up the database.
4. Install dependencies with `npm install`.
5. Start with `npm run dev`.

The application also has a demo/local fallback when Supabase is not configured.

## Repository structure

The current project is intentionally kept at the repository root:

- `App.jsx` — application UI, routes, authentication screens and marketplace flows.
- `styles.css` — responsive visual system.
- `marketplace.js` — Supabase marketplace operations.
- `supabaseClient.js` — Supabase client and safe local fallback.
- `main.jsx` — React entry point and GitHub Pages router base.
- `schema.sql` — Supabase database schema and RLS policies.
- `public/vanidaxi-icon.png` — runtime logo asset.
- `vite.config.js` — Vite configuration for `/VaniDaxi-Fontent/`.
- `.github/workflows/deploy.yml` — GitHub Pages build and deployment.

## GitHub Pages

The Vite base path is `/VaniDaxi-Fontent/` and deployment is performed from `main` through GitHub Actions. Configure these repository Actions secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional repository variables:

- `VITE_API_URL`
- `VITE_WHATSAPP_NUMBER`

The workflow validates the required Supabase variables and runs `npm run build` before publishing the Pages artifact.

## Authentication

Authentication is handled through Supabase Auth when configured. Protected routes include the account/profile, checkout, orders, publishing and seller areas. Password recovery uses the active GitHub Pages base path rather than the previous repository path.

## Marketplace and orders

Products, favorites, profiles, orders and publications use Supabase when available. Order creation validates UUIDs, reloads the current product prices from Supabase, checks active status and stock, and calculates the order total from database prices instead of trusting a browser-supplied total.

Card, Mercado Pago and Stripe payments are not activated yet. The current checkout flow uses `contra_entrega`; a real payment provider should be connected through a server-side payment flow before accepting online payments.

## Seller area

`/vendedor` is the protected seller entry point. Product publication is connected to the authenticated seller. Buyer order history is available at `/pedidos`; a dedicated seller order-management interface should be wired to seller-specific order queries before treating it as a completed seller operations module.

## Visual identity

The VaniDaxi identity uses the selected icon and the existing pink/fuchsia/purple/indigo visual system. The reconstruction keeps the current responsive layout and does not replace the established visual design with a new template.
