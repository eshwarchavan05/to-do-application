const router = require('express').Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET tasks for a project
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { status, priority, assignee, search, page = 1, limit = 100 } = req.query;
    const filter = { project: req.params.projectId, isArchived: false };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignees = assignee;
    if (search) filter.$text = { $search: search };

    const tasks = await Task.find(filter)
      .populate('assignees', 'name avatar email')
      .populate('creator', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (err) { next(err); }
});

// GET single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name avatar email')
      .populate('creator', 'name avatar')
      .populate('comments.user', 'name avatar')
      .populate('timeEntries.user', 'name avatar')
      .populate('dependencies', 'title status priority');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

// POST create task
router.post('/', async (req, res, next) => {
  try {
    const { project, title, description, status, priority, columnId, dueDate, startDate, assignees, tags, estimatedHours } = req.body;
    const lastTask = await Task.findOne({ project, columnId }).sort('-order');
    const task = await Task.create({
      project, title, description, status: status || 'todo',
      priority: priority || 'medium',
      columnId: columnId || status || 'todo',
      dueDate, startDate, estimatedHours,
      assignees: assignees || [],
      tags: tags || [],
      creator: req.user._id,
      order: lastTask ? lastTask.order + 1 : 0,
    });

    await Task.populate(task, [
      { path: 'assignees', select: 'name avatar email' },
      { path: 'creator', select: 'name avatar' },
    ]);

    // Update project task count
    await Project.findByIdAndUpdate(project, { $inc: { taskCount: 1 } });

    // Notify assignees
    if (assignees?.length) {
      const notifs = assignees
        .filter(id => id.toString() !== req.user._id.toString())
        .map(userId => ({
          user: userId, type: 'task_assigned',
          title: 'Task Assigned', message: `${req.user.name} assigned you "${title}"`,
          link: `/tasks/${task._id}`, data: { taskId: task._id },
        }));
      if (notifs.length) await Notification.insertMany(notifs);
    }

    await Activity.create({
      project, user: req.user._id, action: 'created',
      targetType: 'task', targetId: task._id, targetTitle: title,
    });

    // Emit via socket if available
    if (req.app.get('io')) {
      req.app.get('io').to(`project:${project}`).emit('task:created', task);
    }

    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
});

// PUT update task
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const allowedFields = ['title', 'description', 'status', 'priority', 'columnId', 'dueDate',
      'startDate', 'assignees', 'tags', 'estimatedHours', 'progress', 'order', 'customFields'];

    allowedFields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

    // Sync columnId and status
    if (req.body.status) task.columnId = req.body.status;
    if (req.body.columnId) task.status = req.body.columnId;

    await task.save();
    await task.populate([
      { path: 'assignees', select: 'name avatar email' },
      { path: 'creator', select: 'name avatar' },
      { path: 'comments.user', select: 'name avatar' },
    ]);

    if (req.body.status === 'done') {
      await Project.findByIdAndUpdate(task.project, { $inc: { completedCount: 1 } });
    }

    await Activity.create({
      project: task.project, user: req.user._id, action: 'updated',
      targetType: 'task', targetId: task._id, targetTitle: task.title,
      metadata: { changes: Object.keys(req.body) },
    });

    if (req.app.get('io')) {
      req.app.get('io').to(`project:${task.project}`).emit('task:updated', task);
    }

    res.json({ success: true, task });
  } catch (err) { next(err); }
});

// PATCH reorder tasks (Kanban drag-drop)
router.patch('/reorder', async (req, res, next) => {
  try {
    const { updates } = req.body; // [{ id, columnId, order }]
    const bulkOps = updates.map(({ id, columnId, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { columnId, status: columnId, order } },
      },
    }));
    await Task.bulkWrite(bulkOps);

    if (req.app.get('io') && updates[0]) {
      const task = await Task.findById(updates[0].id);
      req.app.get('io').to(`project:${task?.project}`).emit('tasks:reordered', updates);
    }

    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST add subtask
router.post('/:id/subtasks', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    task.subtasks.push({ title: req.body.title });
    await task.save();
    if (req.app.get('io')) req.app.get('io').to(`project:${task.project}`).emit('task:updated', task);
    res.json({ success: true, subtasks: task.subtasks });
  } catch (err) { next(err); }
});

// PATCH toggle subtask
router.patch('/:id/subtasks/:subtaskId', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ success: false, message: 'Subtask not found' });
    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;
    await task.save();
    if (req.app.get('io')) req.app.get('io').to(`project:${task.project}`).emit('task:updated', task);
    res.json({ success: true, subtasks: task.subtasks, progress: task.progress });
  } catch (err) { next(err); }
});

// POST add comment
router.post('/:id/comments', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    task.comments.push({ user: req.user._id, text: req.body.text });
    await task.save();
    await task.populate('comments.user', 'name avatar');

    await Activity.create({
      project: task.project, user: req.user._id, action: 'commented',
      targetType: 'task', targetId: task._id, targetTitle: task.title,
    });

    if (req.app.get('io')) {
      req.app.get('io').to(`project:${task.project}`).emit('task:updated', task);
    }

    res.json({ success: true, comments: task.comments });
  } catch (err) { next(err); }
});

// POST start time tracking
router.post('/:id/time/start', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    task.timeEntries.push({ user: req.user._id, startTime: new Date(), note: req.body.note });
    await task.save();
    res.json({ success: true, entry: task.timeEntries[task.timeEntries.length - 1] });
  } catch (err) { next(err); }
});

// PATCH stop time tracking
router.patch('/:id/time/:entryId/stop', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const entry = task.timeEntries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Time entry not found' });
    entry.endTime = new Date();
    entry.duration = Math.round((entry.endTime - entry.startTime) / 60000);
    task.totalTimeLogged = task.timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    await task.save();
    res.json({ success: true, entry, totalTimeLogged: task.totalTimeLogged });
  } catch (err) { next(err); }
});

// DELETE task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await Project.findByIdAndUpdate(task.project, { $inc: { taskCount: -1 } });
    await Activity.create({
      project: task.project, user: req.user._id, action: 'deleted',
      targetType: 'task', targetTitle: task.title,
    });
    if (req.app.get('io')) {
      req.app.get('io').to(`project:${task.project}`).emit('task:deleted', { taskId: task._id });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
