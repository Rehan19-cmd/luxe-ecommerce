console.log('▶ Starting LUXE server...');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');

console.log('▶ Core modules loaded');

try {
  const apiRoutes = require('./routes/api');
  console.log('▶ API routes loaded');

  const app = express();
  const PORT = process.env.PORT || 5000;

  // ── Middleware ────────────────────────────────────────────
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('▶ Middleware configured');

  // ── API Routes (MUST come BEFORE static files) ──────────
  app.use('/api', apiRoutes);

  // ── API 404 Catch (Prevents API routes from returning HTML)
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.url}` });
  });

  // ── Health Check ─────────────────────────────────────────
  app.get('/api-status', (req, res) => {
    res.json({ status: 'ok', message: 'Luxury E-Commerce API' });
  });

  // ── Serve uploaded images ────────────────────────────────
  const uploadsPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
  app.use('/uploads', express.static(uploadsPath));

  // ── Serve Frontend Static Files ──────────────────────────
  const frontendPath = path.join(__dirname, '..', 'frontend');
  console.log('▶ Frontend path:', frontendPath, '| Exists:', fs.existsSync(frontendPath));

  app.use(express.static(frontendPath, {
    extensions: ['html'],
    index: 'index.html',
  }));

  // ── Catch-all: send index.html for any unmatched route ───
  app.get('*', (req, res) => {
    const indexFile = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.status(404).json({ error: 'Frontend not found' });
    }
  });

  // ── MongoDB Connection & Server Start ────────────────────
  const MONGO_URI = process.env.MONGO_URI;
  console.log('▶ MONGO_URI set:', !!MONGO_URI);
  console.log('▶ ADMIN_PASSWORD set:', !!process.env.ADMIN_PASSWORD);
  console.log('▶ JWT_SECRET set:', !!process.env.JWT_SECRET);

  if (!MONGO_URI) {
    console.error('✗ FATAL: MONGO_URI is not set. Add it to Render Environment Variables.');
    process.exit(1);
  }

  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✓ Connected to MongoDB');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✓ Server LIVE on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('✗ MongoDB connection error:', err.message);
      process.exit(1);
    });

} catch (err) {
  console.error('✗ FATAL STARTUP ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}
