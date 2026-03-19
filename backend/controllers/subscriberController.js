const { Subscriber, SiteSettings } = require('../models');

// ── Subscribe ────────────────────────────────────────────
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.json({ message: 'You are already subscribed!', alreadySubscribed: true });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Check if discount is enabled
    let settings = await SiteSettings.findOne();
    const discountMessage = settings?.subscriptionDiscountEnabled
      ? ` You get ${settings.discountPercent}% off your next order!`
      : '';

    res.status(201).json({
      message: `Thank you for subscribing!${discountMessage}`,
      discountEnabled: settings?.subscriptionDiscountEnabled || false,
      discountPercent: settings?.discountPercent || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get All Subscribers (Admin) ──────────────────────────
exports.getSubscribers = async (_req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Delete Subscriber (Admin) ────────────────────────────
exports.deleteSubscriber = async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscriber removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get Site Settings ────────────────────────────────────
exports.getSiteSettings = async (_req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Update Site Settings (Admin) ─────────────────────────
exports.updateSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
