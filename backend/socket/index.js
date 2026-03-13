const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id;
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Update online status
    await User.findByIdAndUpdate(userId, { isOnline: true, lastActiveDate: new Date() });
    io.emit('user:online', { userId, name: socket.user.name });

    // Join personal room
    socket.join(`user:${userId}`);

    // Join project rooms
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`${socket.user.name} joined project:${projectId}`);
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Typing indicator in comments
    socket.on('typing:start', ({ taskId }) => {
      socket.broadcast.emit('typing:start', { taskId, user: { name: socket.user.name, id: userId } });
    });

    socket.on('typing:stop', ({ taskId }) => {
      socket.broadcast.emit('typing:stop', { taskId, userId });
    });

    // Pomodoro events
    socket.on('pomodoro:start', ({ taskId }) => {
      socket.to(`project:${socket.data.currentProject}`).emit('pomodoro:started', {
        taskId, user: socket.user.name,
      });
    });

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user:offline', { userId });
      console.log(`❌ User disconnected: ${socket.user.name}`);
    });
  });
};
