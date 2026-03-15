const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
