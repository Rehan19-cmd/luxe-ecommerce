require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes (MUST come BEFORE static files) ──────────
app.use('/api', apiRoutes);

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
if (!MONGO_URI) {
  console.error('✗ MONGO_URI is not set. Check your environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });
