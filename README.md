# LUXE — Premium Jewelry & Couture E-Commerce

A luxury e-commerce platform for jewelry and haute couture, featuring a stunning animated frontend, a RESTful API backend, and a React admin dashboard.

## 🏗 Project Structure

```
Jwel WEB/
├── backend/          # Node.js + Express API
│   ├── controllers/  # Product & Admin controllers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── uploads/      # Product image uploads
│   ├── server.js     # Entry point
│   └── seed.js       # Sample data seeder
├── frontend/         # Static HTML/CSS/JS website
│   ├── css/          # Luxury theme styles
│   ├── js/           # App logic, API, GSAP, Three.js
│   ├── index.html    # Homepage with 3D hero
│   ├── collection.html
│   ├── product.html
│   └── cart.html
└── admin/            # React + Vite admin panel
    └── src/
        ├── pages/    # Dashboard, Products, Sellers, Orders
        └── App.jsx   # Main layout with sidebar
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port 27017

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed    # Seeds database with sample products
npm run dev     # Starts at http://localhost:5000
```

### 2. Frontend
Open `frontend/index.html` directly in your browser, or use a simple server:
```bash
cd frontend
npx serve .     # or use VS Code Live Server
```

### 3. Admin Panel
```bash
cd admin
npm install
npm run dev     # Starts at http://localhost:5173
```

## 🎨 Design Theme
- **Colors:** Black (#0a0a0a), Gold (#c9a84c), White (#f5f0e8)
- **Fonts:** Cormorant Garamond (display), Outfit (body)
- **Effects:** GSAP ScrollTrigger animations, Three.js 3D diamond hero, Lenis smooth scrolling, custom cursor

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filterable) |
| GET | `/api/products/slug/:slug` | Get by slug |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/sellers` | List sellers |
| POST/PUT/DELETE | `/api/sellers/:id` | CRUD sellers |
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update status |
| GET | `/api/dashboard` | Analytics data |

## 🛍 Admin Panel Pages
- **Dashboard** — Revenue, order stats, monthly charts, most sold products
- **Products** — Add/Edit/Delete with category, pricing, tags, featured/trending flags
- **Sellers** — Manage jewelry designers and fashion houses
- **Orders** — Track orders, update status and payment
