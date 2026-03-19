const { Review, Product } = require('../models');

// ── Create Review ────────────────────────────────────────
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, text } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ error: 'Product ID and rating are required.' });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({ user: req.user.userId, product: productId });
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product.' });
    }

    const review = new Review({
      user: req.user.userId,
      product: productId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title || '',
      text: text || '',
    });
    await review.save();

    // Update product average rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    });

    const populated = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get Reviews for a Product ────────────────────────────
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
