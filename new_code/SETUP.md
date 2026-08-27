# Setup Guide (Beginner Friendly)

This guide assumes you have **never used a terminal, Docker, or Git before**. Follow the steps
in order — don't skip ahead. Every command you need to type is in a grey box; you copy it
exactly and press Enter.

A quick definition before we start: a **terminal** (also called "command line" or "console") is
a text-based window where you type commands instead of clicking things. On Mac it's called
**Terminal** (search for it in Spotlight). You'll use it for a few one-time setup steps.

---

## Part 1 — Install the tools you need

You only need **two** things installed on your computer. You do **not** need to install Node.js,
MySQL, or anything else — the project runs entirely inside Docker, which packages all of that up
for you.

1. **Docker Desktop** — download from https://www.docker.com/products/docker-desktop and install
   it like any normal app. Open it once after installing and wait until it says "Docker Desktop
   is running" (there's a small whale icon in your menu bar/taskbar when it's ready).
2. **Git** — on a Mac, open Terminal and type `git -v`. If it's not installed, your Mac will
   offer to install it automatically — just follow the prompt.

That's it. Everything else (the database, the backend server, the website) runs inside Docker
containers, which is why you don't need to install them separately.

---

## Part 2 — Get the project code

If you already have the project folder on your computer, skip to Part 3.

If you need to download it fresh:

1. Open Terminal.
2. Navigate to where you want the project folder to live, for example your Documents folder:
   ```bash
   cd ~/Documents
   ```
3. Download ("clone") the project:
   ```bash
   git clone https://github.com/SShehan716/Smart_Bake_Hub.git
   cd Smart_Bake_Hub
   ```

---

## Part 3 — Start the project

1. Open Terminal.
2. Navigate into the project folder (adjust the path if yours is different):
   ```bash
   cd ~/Documents/Projects/Smart_Bake_Hub
   ```
3. Start everything with one command:
   ```bash
   docker compose up -d --build
   ```
   This will take a few minutes the **first** time (it's downloading and building things). You'll
   see a lot of text scroll by — that's normal. When it finishes, you'll see lines like:
   ```
   Container smart_bake_hub_db Started
   Container smart_bake_hub_backend Started
   Container smart_bake_hub_frontend Started
   ```
4. Open your web browser and go to: **http://localhost**

If that page loads (even if it looks empty or shows an error at this point — that's expected,
see Part 4), the project is running correctly.

**Every time after this**, you don't need `--build` again — just:
```bash
docker compose up -d
```

---

## Part 4 — Create your admin account (first-time only)

The very first time the site runs with an empty database, it will **force every page** to
redirect you to a "System Setup" screen until an admin account exists. This is intentional, not
a bug.

1. Go to **http://localhost** — you'll be redirected to `http://localhost/admin/setup`.
2. Fill in:
   - **Full Name** — anything, e.g. your name.
   - **Email Address** — use a **real email you can check** (a one-time code gets sent there).
3. Click **Send OTP** (or similar button). Check your email inbox (and spam folder) for a 6-digit
   code.
4. Enter the code, then set a password.
5. Done — you're now logged in as the site's admin. The forced redirect will stop happening.

**If the email never arrives:** the app will show the code directly on-screen as a fallback
(look for a toast/popup message mentioning "Test Mode" or an OTP code) — use that instead.

---

## Part 5 — Explore the app

You're logged in as admin now. A few things worth trying, all from the sidebar at
**http://localhost/admin**:

- **Menus** and **Beverages** — add a few items so there's something to order. Each has an
  "Available"/"Unavailable" toggle — customers see this as an In Stock / Out of Stock badge.
- **QR Codes** — add a table number, and you'll get a QR code. Scanning it (or just opening the
  link shown underneath it) takes a customer straight to the menu with that table pre-selected.
- **Dashboard** — shows the AI demand forecast, calculated from real order history once per day.
- **Orders** — every order placed by customers shows up here, including payment status.

To act as a customer instead of admin, either open a private/incognito browser window, or log
out and register a new account at **http://localhost/register**.

---

## Part 6 — Set up Stripe (for real payments)

Right now, if you try to check out, it will fail because no payment provider is connected. Stripe
is free to set up for **testing** — no business registration, no real money involved, no credit
card required from you.

1. Go to https://dashboard.stripe.com/register and create a free account (just an email +
   password).
2. Once logged in, look at the top-right of the dashboard — make sure it says **Test mode** (if
   there's a toggle switch, make sure it's switched to test mode, not live).
3. In the left sidebar, click **Developers**, then **API keys**.
4. You'll see two keys. Copy the **Secret key** — it starts with `sk_test_`. (Click "Reveal test
   key" if it's hidden.)
5. On your computer, open the file `backend/.env` in any text editor (TextEdit, VS Code,
   Notepad — anything that opens plain text files).
6. Find this line:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   ```
   Replace `sk_test_your_stripe_secret_key_here` with the key you copied, so it looks like:
   ```
   STRIPE_SECRET_KEY=sk_test_51AbCdEf...
   ```
7. Save the file.
8. Back in Terminal, restart just the backend so it picks up the new key:
   ```bash
   docker compose up -d --build backend
   ```

**To test a payment:** add items to your cart as a customer and check out. You'll be redirected
to a real Stripe payment page. Use Stripe's official test card:

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry date | any future date, e.g. `12/34` |
| CVC | any 3 digits, e.g. `123` |
| Name / ZIP | anything |

This will "succeed" without charging any real money (you're in test mode). You'll be redirected
back to the site with a payment confirmation screen, and the order will show as **Paid** in both
the admin Orders page and your own order history.

---

## Part 7 — Optional: real AI-generated forecasts

Without any setup, the "Demand Forecasting" dashboard already works using real math calculated
from your order history. If you'd rather have it generated by Google's Gemini AI instead:

1. Go to https://aistudio.google.com/apikey and create a free API key (a Google account is
   enough, no payment needed for the free tier).
2. Open `backend/.env`, find:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   and replace the placeholder with your real key.
3. Restart the backend:
   ```bash
   docker compose up -d --build backend
   ```

This step is entirely optional — skip it if you don't need real AI forecasts.

---

## Stopping and restarting

- **Pause everything (keeps your data):**
  ```bash
  docker compose stop
  ```
  Start it again later with `docker compose up -d`.

- **⚠️ Fully remove everything (deletes all data — users, orders, menu items, everything):**
  ```bash
  docker compose down
  ```
  Only do this if you genuinely want to start from a completely empty database. There's no
  persistent storage configured for the database yet, so this really does erase it all.

---

## Troubleshooting

**"This site can't be reached" at localhost**
Docker isn't running, or the containers aren't started. Open Docker Desktop and make sure it
says it's running, then run `docker compose up -d` again from the project folder in Terminal.

**Every page redirects to `/admin/setup`, even after I set up admin once**
This means the database was reset (someone ran `docker compose down`, which erases data). Just
go through Part 4 again to create a new admin account.

**"Failed to send OTP" when registering**
The backend isn't reachable. Run `docker compose up -d` and wait about 10 seconds, then try
again.

**OTP email never arrives**
Check spam. If it still doesn't show up, look for an on-screen fallback message with the code
displayed directly (search the page for "Test Mode" after clicking Send OTP).

**Checkout fails / no redirect to Stripe**
Your Stripe key in `backend/.env` is still the placeholder. Follow Part 6.

**Port already in use / container won't start**
Something else on your computer is already using port 80 or 5050. Close whatever that is, or ask
someone to help you change the port numbers in `docker-compose.yml`.

**I want to see what's happening behind the scenes**
```bash
docker logs smart_bake_hub_backend --tail 50
docker logs smart_bake_hub_db --tail 50
```

---

## Quick reference

| Thing | Address |
|---|---|
| The website | http://localhost |
| Admin setup (first time only) | http://localhost/admin/setup |
| Admin login | http://localhost/admin/login |
| Backend API (for developers only, not needed to use the site) | http://localhost:5050 |

| Command | What it does |
|---|---|
| `docker compose up -d --build` | Build and start everything (first time, or after code changes) |
| `docker compose up -d` | Start everything (normal day-to-day) |
| `docker compose stop` | Pause everything, keep data |
| `docker compose down` | Stop and **erase all data** |
