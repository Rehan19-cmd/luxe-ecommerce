const { Product, Order, Seller } = require('../models');
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// ══════════════════════════════════════════════════════════
//  DASHBOARD ANALYTICS
// ══════════════════════════════════════════════════════════

exports.getDashboard = async (_req, res) => {
  try {
    const [totalProducts, totalOrders, totalSellers, recentOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Seller.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(10),
    ]);

    // Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length ? revenueResult[0].total : 0;

    // Most sold products
    const mostSold = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalSellers,
      totalRevenue,
      recentOrders,
      mostSold,
      ordersByStatus,
      monthlyRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════════════════
//  SELLERS
// ══════════════════════════════════════════════════════════

exports.getSellers = async (_req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSeller = async (req, res) => {
  try {
    const seller = new Seller(req.body);
    await seller.save();
    res.status(201).json(seller);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    res.json(seller);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    res.json({ message: 'Seller deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════════════════
//  ORDERS
// ══════════════════════════════════════════════════════════

exports.getOrders = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // Decrease stock for each item
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Restore stock for each item
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted and stock restored' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════════════════
//  STRIPE CHECKOUT
// ══════════════════════════════════════════════════════════

exports.createStripeCheckout = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env' });
    }

    const { items, customer, shippingAddress } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5000'}/cart.html?payment=success`,
      cancel_url: `${req.headers.origin || 'http://localhost:5000'}/cart.html?payment=cancelled`,
      metadata: {
        customerName: customer?.name || '',
        customerEmail: customer?.email || '',
      },
    });

    // Also save order to our DB
    const totalAmount = items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
    const order = new Order({
      items: items.map(i => ({
        product: i.product || i.productId || null,
        name: i.name,
        price: i.price,
        quantity: i.quantity || 1,
        image: i.image || '',
      })),
      customer: {
        name: customer?.name || 'Guest',
        email: customer?.email || '',
        phone: customer?.phone || '',
      },
      shippingAddress: shippingAddress || {},
      totalAmount,
      paymentMethod: 'stripe',
      paymentStatus: 'unpaid', // Will be updated via webhook
    });
    await order.save();

    // Decrease stock
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -(item.quantity) } });
      }
    }

    res.json({ sessionId: session.id, url: session.url, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
