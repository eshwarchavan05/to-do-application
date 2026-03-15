const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 1000, default: '' },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '📋' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  columns: [{
    id: String,
    title: String,
    color: String,
    order: Number,
  }],
  status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
  dueDate: { type: Date, default: null },
  tags: [String],
  taskCount: { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 },
}, { timestamps: true });

ProjectSchema.index({ owner: 1, status: 1 });
ProjectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', ProjectSchema);
