const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'luxury_super_secret_key_2025';

exports.protectAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Auth token missing. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Not authorized as admin.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};
