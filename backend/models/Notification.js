const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['task_assigned', 'task_due', 'task_overdue', 'comment_mention',
           'project_invite', 'task_completed', 'comment_added', 'member_joined'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false, index: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
