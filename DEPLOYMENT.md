# LUXE E-Commerce — Deployment & Handoff Guide

This guide contains everything you need to deploy the LUXE platform, connect your payments, and manage your store.

---

## 1. Connecting Payments Connect (Stripe)

To accept credit cards, you need to add your Stripe API keys to the backend.

**Steps:**
1. Create an account at [Stripe.com](https://stripe.com)
2. Go to the **Developers** section in your Stripe Dashboard.
3. Click on **API keys**.
4. You will see a `Publishable key` (pk_live_...) and a `Secret key` (sk_live_...).
5. Copy the **Secret key**.
6. Open your backend `.env` file (or your hosting platform's environment variables) and set:
   ```env
   STRIPE_SECRET_KEY=sk_live_your_secret_key_here
7. Restart your backend server. The "Credit Card" payment option will now automatically process payments through your own Stripe account.

---

## 2. Connecting PayPal

To accept PayPal, you need to add your PayPal API keys to the backend.

**Steps:**
1. Create a developer account at [developer.paypal.com](https://developer.paypal.com/)
2. Go to **Apps & Credentials** and click **Create App**.
3. Once created, copy the **Client ID** and the **Secret**.
4. Open your backend `.env` file (or your hosting platform's environment variables) and set:
   ```env
   PAYPAL_CLIENT_ID=your_live_paypal_client_id_here
   PAYPAL_APP_SECRET=your_live_paypal_secret_here
   ```
5. Restart your server. The "PayPal" option at checkout will now route correctly.

---

## 2. Admin Dashboard Access

The Admin Dashboard is protected by a secure password.

**Default Login URL:** `http://localhost:5173` (or your deployed URL)
**Password:** `Khanfamily2945`

*To change this password later, update the `ADMIN_PASSWORD` variable in your backend `.env` file.*

---

## 3. How to Deploy the Platform

### A. Deploy the Backend (API + MongoDB)
The easiest way to host the Node.js backend is using [Render](https://render.com) or [Railway](https://railway.app).

**Using Render:**
1. Create a "Web Service" in Render.
2. Connect your GitHub repository.
3. Set the Root Directory to `backend` (if deploying only the backend up).
4. Set the Build Command: `npm install`
5. Set the Start Command: `npm start`
6. Under Environment Variables, add:
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `ADMIN_PASSWORD` = Khanfamily2945
   - `JWT_SECRET` = any_long_random_string
   - `STRIPE_SECRET_KEY` = your_stripe_secret_key

### B. Deploy the Frontend (Website)
Host the frontend on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) for ultra-fast global delivery.

**Using Vercel:**
1. Import your GitHub repository to Vercel.
2. Set the Root Directory to `frontend`.
3. In `frontend/js/api.js`, update the `API_BASE` variable to point to your deployed Render URL:
   ```javascript
   const API_BASE = 'https://your-backend-app.onrender.com/api';
   ```
4. Click Deploy.

### C. Deploy the Admin Panel
Host the React Admin Dashboard on Vercel or Netlify.

1. Create a new project in Vercel.
2. Set Root Directory to `admin`.
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. In `admin/src/App.jsx` and `admin/src/pages/*.jsx`, update the `API` URL to point to your live backend.

---

## 4. System Overview

- **Frontend:** Pure HTML/CSS/JS with GSAP and Three.js animations. No build step required for local testing.
- **Backend:** Node.js Express server connected to MongoDB Atlas. Handle API routes, Stripe checkout, and file uploads.
- **Admin:** React SPA (Vite).
- **Database:** MongoDB Atlas (elite-cluster).
