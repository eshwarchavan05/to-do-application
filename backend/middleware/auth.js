const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

const requireProjectRole = (...roles) => async (req, res, next) => {
  const Project = require('../models/Project');
  const project = await Project.findById(req.params.projectId || req.body.project);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const isOwner = project.owner.toString() === req.user._id.toString();
  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  const memberRole = isOwner ? 'admin' : member?.role;

  if (!memberRole || (!isOwner && !roles.includes(memberRole))) {
    return res.status(403).json({ success: false, message: 'Insufficient project permissions' });
  }

  req.project = project;
  req.projectRole = memberRole;
  next();
};

module.exports = { protect, requireRole, requireProjectRole };
