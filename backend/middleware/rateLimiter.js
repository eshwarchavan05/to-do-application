const rateLimit = require('express-rate-limit');

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { success: false, message: 'Rate limit exceeded' },
});
