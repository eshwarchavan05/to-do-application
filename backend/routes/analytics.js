const router = require('express').Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get user's projects
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }], status: 'active',
    }).select('_id');
    const projectIds = projects.map(p => p._id);

    const [myTasks, overdue, completedThisWeek, completedOverTime, tasksByPriority, upcomingTasks] = await Promise.all([
      Task.aggregate([
        { $match: { project: { $in: projectIds }, assignees: userId, isArchived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        project: { $in: projectIds }, assignees: userId,
        status: { $ne: 'done' }, dueDate: { $lt: new Date() }, isArchived: false,
      }),
      Task.countDocuments({
        project: { $in: projectIds }, assignees: userId,
        status: 'done', completedAt: { $gte: sevenDaysAgo },
      }),
      Task.aggregate([
        { $match: { project: { $in: projectIds }, assignees: userId, status: 'done', completedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds }, assignees: userId, isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.find({
        project: { $in: projectIds }, assignees: userId,
        status: { $ne: 'done' }, dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 86400000) },
        isArchived: false,
      }).populate('project', 'name color').sort('dueDate').limit(5),
    ]);

    // Fill missing days in chart
    const completionChart = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const found = completedOverTime.find(e => e._id === dateStr);
      completionChart.push({ date: dateStr, count: found ? found.count : 0 });
    }

    const statusMap = {};
    myTasks.forEach(({ _id, count }) => { statusMap[_id] = count; });

    res.json({
      success: true,
      stats: {
        total: Object.values(statusMap).reduce((a, b) => a + b, 0),
        todo: statusMap.todo || 0,
        inProgress: statusMap['in-progress'] || 0,
        review: statusMap.review || 0,
        done: statusMap.done || 0,
        overdue,
        completedThisWeek,
      },
      completionChart,
      tasksByPriority,
      upcomingTasks,
    });
  } catch (err) { next(err); }
});

module.exports = router;
