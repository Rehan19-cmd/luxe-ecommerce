const { Subscriber, SiteSettings } = require('../models');
const nodemailer = require('nodemailer');

// Helper to send email
const sendWelcomeEmail = async (email, discountMsg) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f; color: #ffffff;">
        <h1 style="color: #c9a84c; text-align: center;">Welcome to LUXE</h1>
        <p>Thank you for subscribing to our inner circle.</p>
        <p>You will now be the first to know about our newest luxury jewelry and traditional fashion collections.</p>
        ${discountMsg ? `<div style="margin: 30px 0; padding: 20px; border: 1px solid #c9a84c; text-align: center; color: #c9a84c; font-size: 1.2rem;"><strong>${discountMsg}</strong></div>` : ''}
        <p>Stay elegant,<br/>The LUXE Team</p>
      </div>
    `;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"LUXE Collections" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to the LUXE Inner Circle',
        html,
      });
      console.log('▶ Welcome email sent to', email);
    } else {
      console.log('▶ SMTP credentials missing. Email would have been sent to:', email);
    }
  } catch (err) {
    console.error('✗ Email sending failed:', err.message);
  }
};

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
      ? `You get ${settings.discountPercent}% off your next order!`
      : '';

    // Send the email asynchronously
    sendWelcomeEmail(email, discountMessage);

    res.status(201).json({
      message: `Thank you for subscribing! ${discountMessage}`,
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
