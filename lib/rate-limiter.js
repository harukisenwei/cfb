const rateLimit = require('express-rate-limit');

const createAccountLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    error: 'Too many requests',
    details: 'Please wait a moment before creating more accounts'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const emailGenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'Too many email generation requests'
  }
});

module.exports = {
  createAccountLimiter,
  emailGenLimiter
};
