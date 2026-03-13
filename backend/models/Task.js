const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 2000 },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  edited: { type: Boolean, default: false },
}, { timestamps: true });

const TimeEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // minutes
  note: { type: String, maxlength: 200 },
}, { timestamps: true });

const AttachmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: String,
  originalName: String,
  url: String,
  size: Number,
  mimetype: String,
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 5000, default: '' },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
    default: 'todo',
    index: true,
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  columnId: { type: String, default: 'todo' },
  order: { type: Number, default: 0 },
  dueDate: { type: Date, default: null },
  startDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  estimatedHours: { type: Number, default: 0 },
  tags: [{ type: String, trim: true, maxlength: 30 }],
  subtasks: [SubtaskSchema],
  comments: [CommentSchema],
  timeEntries: [TimeEntrySchema],
  attachments: [AttachmentSchema],
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  pomodoroSessions: { type: Number, default: 0 },
  totalTimeLogged: { type: Number, default: 0 }, // minutes
  progress: { type: Number, default: 0, min: 0, max: 100 },
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

TaskSchema.index({ project: 1, status: 1, order: 1 });
TaskSchema.index({ project: 1, assignees: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });
TaskSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Auto-compute progress from subtasks
TaskSchema.pre('save', function(next) {
  if (this.subtasks && this.subtasks.length > 0) {
    const done = this.subtasks.filter(s => s.completed).length;
    this.progress = Math.round((done / this.subtasks.length) * 100);
  }
  if (this.isModified('status')) {
    if (this.status === 'done') {
      this.completedAt = new Date();
      this.progress = 100;
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
