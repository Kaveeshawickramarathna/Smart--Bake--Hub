# Changes — QR Ordering, Menu Stock Status, Demand Forecasting, Payments

This documents the work done to complete the assigned sprint items: **QR Code Ordering**,
**showing available vs out-of-stock menu items**, **AI-Based Demand Forecasting (daily
calculation)**, and **Payment Management (Stripe)**.

## Summary

| Feature | Status before | Status now |
|---|---|---|
| QR table ordering | Already built, untested | Verified working end-to-end |
| Menu availability (in stock / out of stock) | Tracked in DB, never shown to customers | Shown on the public menu with badges, ordering disabled for out-of-stock items |
| Beverages on the public menu | Manageable in admin, never visible or orderable to customers | Shown on the public menu, fully orderable |
| Demand forecast | `/api/ai/forecast` always failed (broken SQL) and silently showed hardcoded fake numbers | Real, calculated once per day from actual order history, with a math-based fallback when no AI key is configured |
| Payment Management | Didn't exist — no gateway, no payment status tracking anywhere | Stripe Checkout integrated end-to-end; orders track `payment_status`; admin and customer views show it |

## 1. Demand forecasting — fixed and made a real daily calculation

**The bug:** `generateForecast` and `getWasteSuggestions` in
`backend/src/controllers/aiController.js` joined a `categories` table that doesn't exist in the
schema (only `product_categories` / `dish_categories` / `beverage_categories` do). Every call to
`/api/ai/forecast` threw a 500, and the dashboard silently fell back to hardcoded mock data
(fake dates, fabricated numbers) — so it looked like it worked but never reflected real orders.

**What changed:**
- Fixed the joins to use the correct category tables.
- Sales history now combines orders from products, menu dishes, **and** beverages (previously
  only `product_id`-based order items were counted — dish/beverage orders, which is how QR
  ordering actually works, were invisible to the forecast).
- Added a `daily_forecasts` table that caches one computed forecast per calendar date, so it's
  computed once a day instead of hitting the (paid) Gemini API on every dashboard load.
- Added a deterministic, math-based fallback forecast computed from real order history, used
  automatically whenever the Gemini API key isn't configured or the call fails — so the feature
  works without any AI key.
- Dashboard now shows a "last calculated" timestamp, and the manual "Run Forecast" button
  force-recalculates via `?force=true` instead of just re-reading the cache.

**Note:** `GEMINI_API_KEY` is currently a placeholder, so the forecast runs on the heuristic
fallback, not real AI. Drop in a real key to enable actual Gemini-generated forecasts.

## 2. Menu availability — in stock / out of stock

The public **Menus** page (`frontend/src/pages/public/Menus.jsx`) — which is also where QR codes
land — previously showed every active dish identically, ignoring the `is_available` flag admins
can toggle.

**What changed:**
- Fetches both dishes (`/api/menus`) and beverages (`/api/beverages`), tags each with
  `isAvailable`.
- Available items sort first; out-of-stock items are visually greyed out with a red "Out of
  Stock" badge (available ones get a green "In Stock" badge).
- Add-to-cart / Order buttons are disabled for out-of-stock items, with a toast if clicked.

## 3. Beverages — now visible and orderable on the public menu

Beverages had a full admin CRUD (`/admin/beverages`) and a working `/api/beverages` endpoint,
but no public page ever fetched them — customers had no way to see or order drinks, including
via QR.

**What changed:**
- Merged beverages into the same Menus page grid as dishes, with the same availability
  treatment. Multi-size beverages (e.g. different bottle sizes stored as `price_variants` JSON)
  show their lowest variant price.
- Added a `beverage_id` column to `order_items` (with FK to `beverages`), since order items
  previously only supported `product_id` / `menu_id` — a beverage added to cart would have
  silently placed an order line with no reference to what was actually ordered.
- `orderController.js` now accepts and returns `beverageId` end-to-end (place order, list orders,
  my-orders), joining the beverage name back in for display.
- Fixed how cart items carry their type: previously the app tried to re-derive `menuId` by
  regex-parsing a composite string ID at checkout time, which only coincidentally worked for
  dishes and would have produced null/garbage IDs for beverages (and had a latent bug even for
  the "Buy Now" direct-order path). Cart items now carry explicit `menuId` / `beverageId` fields
  set at add-to-cart time; the old string-parsing is kept only as a fallback for any item already
  sitting in a browser's `localStorage` cart from before this change.
- Demand forecast history/category breakdown now includes beverage-based orders too.

## 4. QR ordering — verified, not rebuilt

This was already fully implemented (`admin/qrcodes` → per-table QR linking to
`/menus?table=N` → table banner on the menu page → dine-in checkout with the table number
pre-filled). It had just never been tested. Verified end-to-end this session: placing an order
through the QR-scan flow correctly records `order_type: "dine-in"` and the right
`table_number` in the database.

## 5. Payment Management — Stripe Checkout, built from scratch

Nothing payment-related existed before this: no gateway integration, no `payment_status` on
orders, no dependency in `package.json`, nothing. This was Sprint 3 on the original board and
had genuinely not been started.

**What was built:**
- `orders` gained `payment_status` (`unpaid` / `paid` / `failed`), `payment_method`, and
  `stripe_session_id` columns.
- New `backend/src/controllers/paymentController.js` + `paymentRoutes.js`:
  - `POST /api/payments/create-checkout-session` — takes an `orderId` you already created via
    `POST /api/orders`, builds Stripe line items from that order's real items (name + price
    pulled from products/dishes/beverages), creates a Stripe Checkout Session, returns the
    hosted checkout URL.
  - `GET /api/payments/confirm/:sessionId` — called when the customer lands back from Stripe;
    retrieves the session, and if Stripe confirms it's paid, marks the order `payment_status =
    'paid'` in the database.
- Checkout flow (`Order.jsx`): placing an order now immediately creates a Stripe Checkout
  Session and redirects the browser to Stripe's hosted payment page instead of just showing a
  success toast.
- New `frontend/src/pages/public/OrderSuccess.jsx` (`/order/success`) — the landing page after
  Stripe redirects back; confirms payment status with the backend and shows a clear paid /
  not-paid / error state.
- Payment status is now visible as a badge in both the **admin Orders** table and the
  **customer's own order history** (Profile page).
- Currency defaults to `lkr` (matches the "Rs." pricing used throughout the app) via
  `STRIPE_CURRENCY`, overridable if the Stripe account can't settle in LKR.
- The Stripe secret key is **not** hardcoded into `docker-compose.yml` (unlike the pre-existing
  email credential) — the backend service now loads `backend/.env` via `env_file`, and only
  `STRIPE_SECRET_KEY` / `STRIPE_CURRENCY` live there, gitignored.

**Bug found and fixed along the way:** `Profile.jsx` rendered `{item.name}` for each order line,
but the backend has never returned a field called `name` on order items — only
`product_name` / `menu_name` / `beverage_name`. Every order's item list showed a blank name.
Fixed to fall back through all three fields.

**Status:** code-complete and verified mechanically (order → checkout session creation → Stripe
correctly rejects a placeholder key), but **not yet tested with a real payment** — that requires
a real Stripe test secret key in `backend/.env`, which hasn't been added yet at time of writing.
See `SETUP.md` for how to get one.

## Files changed

- `backend/src/controllers/aiController.js` — forecast SQL fixes, daily cache, heuristic fallback
- `backend/src/controllers/orderController.js` — `beverage_id` support end-to-end
- `backend/src/controllers/paymentController.js` — new, Stripe Checkout session + confirmation
- `backend/src/routes/paymentRoutes.js` — new
- `backend/server.js` — mounts `/api/payments`
- `backend/package.json` / `package-lock.json` — added `stripe` dependency
- `backend/.env` — added `STRIPE_SECRET_KEY`, `STRIPE_CURRENCY` (placeholders, gitignored)
- `database/schema_utf8.sql` — new `daily_forecasts` table, new `order_items.beverage_id` column,
  new `orders.payment_status` / `payment_method` / `stripe_session_id` columns
- `frontend/src/pages/admin/Dashboard.jsx` — "last calculated" timestamp, force-refresh button
- `frontend/src/pages/admin/Orders.jsx` — payment status column
- `frontend/src/pages/public/Menus.jsx` — beverages merged in, availability badges/sorting
- `frontend/src/pages/public/Order.jsx` — explicit `menuId`/`beverageId` on cart items, redirects
  to Stripe Checkout after placing an order
- `frontend/src/pages/public/OrderSuccess.jsx` — new, payment confirmation landing page
- `frontend/src/pages/public/Profile.jsx` — payment status badge, fixed blank item names
- `frontend/src/App.jsx` — new `/order/success` route
- `docker-compose.yml` — local backend port `5000` → `5050` (5000 collides with macOS AirPlay
  Receiver); backend now loads `backend/.env` via `env_file`; added `FRONTEND_URL`

## Known gaps / things worth your attention

- **Stripe hasn't been tested with a real key yet.** `backend/.env` still has the placeholder
  `STRIPE_SECRET_KEY`. See `SETUP.md` for the exact steps to get a free test key.
- **A real Gmail address + app password is committed in plaintext** in `docker-compose.yml`
  (`EMAIL_USER` / `EMAIL_PASS`). It's a live, working credential sitting in git history — worth
  rotating and moving to an untracked `.env`.
- `GEMINI_API_KEY` is a placeholder everywhere it's configured; the forecast runs on the
  heuristic fallback until a real key is provided.
- The local Docker DB has no persistent volume — `docker compose down` wipes all data (users,
  orders, everything). Use `docker compose stop` / `start` instead if you want to keep test data
  between sessions.
- Everything (except the final live Stripe payment) was verified via the API/database layer
  directly (curl + inspecting MySQL rows) and by confirming the built frontend bundle contains
  the new code, plus one confirmed real order placed through the actual browser UI. A full
  manual click-through of every feature hasn't been done and is worth doing once.
