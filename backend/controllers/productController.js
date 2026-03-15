const { Product, Category, Seller, Order } = require('../models');

// ══════════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════════

exports.getProducts = async (req, res) => {
  try {
    const { category, tag, featured, trending, search, sort, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };
    if (featured === 'true') filter.featured = true;
    if (trending === 'true') filter.trending = true;
    if (req.query.offer === 'true') filter.offer = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const sortMap = {
      newest: { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      popular: { rating: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('seller', 'name brand').sort(sortObj).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('seller', 'name brand logo');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name brand logo');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const uploadedImages = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    
    // Handle existing images and tags which might come as 'images[]'/'images' or 'tags[]'/'tags'
    let bodyImages = req.body.images || req.body['images[]'] || [];
    if (!Array.isArray(bodyImages)) bodyImages = [bodyImages];
    
    let tags = req.body.tags || req.body['tags[]'] || [];
    if (!Array.isArray(tags)) tags = [tags];

    const allImages = [...bodyImages, ...uploadedImages].filter(Boolean);
    
    const productData = {
      ...req.body,
      images: allImages,
      tags: tags.map(t => t.trim()).filter(Boolean),
      price: Number(req.body.price),
      comparePrice: Number(req.body.comparePrice) || 0,
      stock: Number(req.body.stock) || 0
    };

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const uploadedImages = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    
    const updates = { ...req.body };
    
    // Handle existing images and tags
    let bodyImages = req.body.images || req.body['images[]'] || [];
    if (!Array.isArray(bodyImages)) bodyImages = [bodyImages];
    
    let tags = req.body.tags || req.body['tags[]'] || [];
    if (!Array.isArray(tags)) tags = [tags];

    updates.images = [...bodyImages, ...uploadedImages].filter(Boolean);
    updates.tags = tags.map(t => t.trim()).filter(Boolean);
    
    if (updates.price) updates.price = Number(updates.price);
    if (updates.comparePrice) updates.comparePrice = Number(updates.comparePrice) || 0;
    if (updates.stock) updates.stock = Number(updates.stock) || 0;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════════════════
//  CATEGORIES
// ══════════════════════════════════════════════════════════

exports.getCategories = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    if (!category.slug) {
      category.slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
