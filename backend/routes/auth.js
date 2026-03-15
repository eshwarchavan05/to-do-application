const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, token: genToken(user._id), user: user.toPublic() });
  } catch (err) { next(err); }
});

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    user.isOnline = true;
    user.lastActiveDate = new Date();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, token: genToken(user._id), user: user.toPublic() });
  } catch (err) { next(err); }
});

router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user.toPublic() });
});

router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, bio, theme, timezone, notifications } = req.body;
    const update = {};
    if (name) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (theme) update.theme = theme;
    if (timezone) update.timezone = timezone;
    if (notifications) update.notifications = notifications;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublic() });
  } catch (err) { next(err); }
});

router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
});

router.post('/logout', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
