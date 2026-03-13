const router = require('express').Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#64748b', order: 0 },
  { id: 'todo', title: 'To Do', color: '#6366f1', order: 1 },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b', order: 2 },
  { id: 'review', title: 'Review', color: '#8b5cf6', order: 3 },
  { id: 'done', title: 'Done', color: '#22c55e', order: 4 },
];

// GET all projects for user
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      status: { $ne: 'archived' },
    }).populate('owner', 'name avatar').populate('members.user', 'name avatar email').sort('-updatedAt');
    res.json({ success: true, projects });
  } catch (err) { next(err); }
});

// POST create project
router.post('/', async (req, res, next) => {
  try {
    const { name, description, color, icon, dueDate } = req.body;
    const project = await Project.create({
      name, description, color, icon, dueDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      columns: DEFAULT_COLUMNS,
    });
    await project.populate('owner', 'name avatar');
    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
});

// GET single project
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar email')
      .populate('members.user', 'name avatar email isOnline');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const isMember = project.owner._id.toString() === req.user._id.toString() ||
      project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, project });
  } catch (err) { next(err); }
});

// PUT update project
router.put('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, $or: [{ owner: req.user._id }, { 'members': { $elemMatch: { user: req.user._id, role: 'admin' } } }] },
      req.body, { new: true, runValidators: true }
    ).populate('owner', 'name avatar').populate('members.user', 'name avatar email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or no permission' });
    res.json({ success: true, project });
  } catch (err) { next(err); }
});

// DELETE project
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await Task.deleteMany({ project: req.params.id });
    await Activity.deleteMany({ project: req.params.id });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
});

// POST invite member
router.post('/:id/invite', async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project || project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only owner can invite' });

    const invitedUser = await User.findOne({ email });
    if (!invitedUser) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === invitedUser._id.toString());
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User already a member' });

    project.members.push({ user: invitedUser._id, role });
    await project.save();

    await Notification.create({
      user: invitedUser._id,
      type: 'project_invite',
      title: 'Project Invitation',
      message: `${req.user.name} invited you to "${project.name}"`,
      link: `/projects/${project._id}`,
      data: { projectId: project._id },
    });

    await Activity.create({
      project: project._id, user: req.user._id,
      action: 'invited', targetType: 'member',
      targetTitle: invitedUser.name,
    });

    await project.populate('members.user', 'name avatar email');
    res.json({ success: true, project });
  } catch (err) { next(err); }
});

// DELETE remove member
router.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only owner can remove members' });
    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
});

// GET project activity
router.get('/:id/activity', async (req, res, next) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name avatar')
      .sort('-createdAt').limit(50);
    res.json({ success: true, activities });
  } catch (err) { next(err); }
});

// GET project analytics
router.get('/:id/analytics', async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [statusStats, priorityStats, completedOverTime, memberStats] = await Promise.all([
      Task.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId(projectId), isArchived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId(projectId), isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId(projectId), status: 'done', completedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Task.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId(projectId) } },
        { $unwind: '$assignees' },
        { $group: { _id: '$assignees', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', avatar: '$user.avatar', total: 1, done: 1 } },
      ]),
    ]);

    res.json({ success: true, analytics: { statusStats, priorityStats, completedOverTime, memberStats } });
  } catch (err) { next(err); }
});

module.exports = router;
