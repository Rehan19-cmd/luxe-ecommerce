require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Serve Frontend Static Files ──────────────────────────
// This serves the frontend directly from Express, preserving
// all query parameters (e.g., ?category=clothing)
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  extensions: ['html'],
  index: 'index.html',
}));

// ── API Routes ───────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Health Check ─────────────────────────────────────────
app.get('/api-status', (req, res) => {
  res.json({ status: 'ok', message: 'Luxury E-Commerce API' });
});

// ── MongoDB Connection & Server Start ────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend: http://localhost:${PORT}/index.html`);
      console.log(`✓ API: http://localhost:${PORT}/api/products`);
    });
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });
