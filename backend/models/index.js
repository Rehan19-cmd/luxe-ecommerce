const mongoose = require('mongoose');

// ── Product Schema ───────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0 },
    category: { type: String, required: true, enum: ['jewelry', 'clothing'] },
    subcategory: { type: String, default: '' },
    tags: [{ type: String }],
    images: [{ type: String }],          // paths / URLs
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    preferred: { type: Boolean, default: false },
    offer: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    material: { type: String, default: '' },
    weight: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// ── Category Schema ──────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
});

// ── Seller Schema ────────────────────────────────────────
const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    type: { type: String, enum: ['jewelry', 'clothing', 'both'], default: 'both' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Order Schema ─────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        image: String,
      },
    ],
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    shippingAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: 'US' },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

// ── Exports ──────────────────────────────────────────────
const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const Seller = mongoose.model('Seller', sellerSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Product, Category, Seller, Order };
