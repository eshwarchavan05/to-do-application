const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  bio: { type: String, maxlength: 300, default: '' },
  timezone: { type: String, default: 'UTC' },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  notifications: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    taskDue: { type: Boolean, default: true },
    taskAssigned: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
  },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

UserSchema.methods.toPublic = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    bio: this.bio,
    streak: this.streak,
    isOnline: this.isOnline,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
