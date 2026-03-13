const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'completed', 'commented',
           'assigned', 'moved', 'uploaded', 'invited', 'removed'],
    required: true,
  },
  targetType: { type: String, enum: ['task', 'project', 'comment', 'member'] },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetTitle: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

ActivitySchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
