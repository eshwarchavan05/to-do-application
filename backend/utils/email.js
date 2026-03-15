const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const emailTemplates = {
  taskAssigned: (assignee, task, assigner) => ({
    subject: `Task assigned: ${task.title}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#6366f1">New Task Assigned</h2>
      <p>Hi ${assignee.name},</p>
      <p><strong>${assigner.name}</strong> assigned you a task:</p>
      <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:16px 0">
        <h3>${task.title}</h3>
        <p>Priority: <strong>${task.priority}</strong></p>
        ${task.dueDate ? `<p>Due: <strong>${new Date(task.dueDate).toLocaleDateString()}</strong></p>` : ''}
      </div>
      <a href="${process.env.CLIENT_URL}/tasks/${task._id}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">View Task</a>
    </div>`,
  }),
  taskDueSoon: (user, task) => ({
    subject: `Due soon: ${task.title}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#f59e0b">⚠️ Task Due Soon</h2>
      <p>Hi ${user.name}, your task is due tomorrow:</p>
      <div style="background:#fffbeb;padding:16px;border-radius:8px">
        <h3>${task.title}</h3>
        <p>Due: <strong>${new Date(task.dueDate).toLocaleDateString()}</strong></p>
      </div>
      <a href="${process.env.CLIENT_URL}/tasks/${task._id}" style="background:#f59e0b;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">View Task</a>
    </div>`,
  }),
  teamInvite: (inviter, project, inviteLink) => ({
    subject: `You're invited to join ${project.name}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#6366f1">Team Invitation</h2>
      <p><strong>${inviter.name}</strong> invited you to collaborate on <strong>${project.name}</strong>.</p>
      <a href="${inviteLink}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">Accept Invitation</a>
    </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
