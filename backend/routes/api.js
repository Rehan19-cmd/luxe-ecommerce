const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const productCtrl = require('../controllers/productController');
const adminCtrl = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Khanfamily2945';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretluxe';

// ── Admin Login ──────────────────────────────────────────
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid password' });
});


// ── Multer setup for image uploads ───────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Optional multer — allows JSON requests without files to pass through
const optionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.array('images', 5)(req, res, next);
  } else {
    next();
  }
};

// ── Product Routes ───────────────────────────────────────
router.get('/products', productCtrl.getProducts);
router.get('/products/slug/:slug', productCtrl.getProductBySlug);
router.get('/products/:id', productCtrl.getProductById);
router.post('/products', protectAdmin, optionalUpload, productCtrl.createProduct);
router.put('/products/:id', protectAdmin, optionalUpload, productCtrl.updateProduct);
router.delete('/products/:id', protectAdmin, productCtrl.deleteProduct);

// ── Category Routes ──────────────────────────────────────
router.get('/categories', productCtrl.getCategories);
router.post('/categories', protectAdmin, productCtrl.createCategory);

// ── Seller Routes ────────────────────────────────────────
router.get('/sellers', protectAdmin, adminCtrl.getSellers);
router.get('/sellers/:id', protectAdmin, adminCtrl.getSellerById);
router.post('/sellers', protectAdmin, adminCtrl.createSeller);
router.put('/sellers/:id', protectAdmin, adminCtrl.updateSeller);
router.delete('/sellers/:id', protectAdmin, adminCtrl.deleteSeller);

// ── Order Routes ─────────────────────────────────────────
router.get('/orders', protectAdmin, adminCtrl.getOrders);
router.get('/orders/:id', protectAdmin, adminCtrl.getOrderById); // Admin gets specific order details
router.post('/orders', adminCtrl.createOrder); // Public order creation check/COD
router.put('/orders/:id', protectAdmin, adminCtrl.updateOrderStatus);
router.delete('/orders/:id', protectAdmin, adminCtrl.deleteOrder);
router.post('/checkout', adminCtrl.createStripeCheckout);

// ── Dashboard ────────────────────────────────────────────
router.get('/dashboard', protectAdmin, adminCtrl.getDashboard);

module.exports = router;
