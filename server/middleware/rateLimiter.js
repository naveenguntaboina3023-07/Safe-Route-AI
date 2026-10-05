const rateLimit = require('express-rate-limit');

// Auth endpoints — tighter limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI analysis endpoint — prevent abuse
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { success: false, message: 'Too many AI requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, aiLimiter, generalLimiter };
