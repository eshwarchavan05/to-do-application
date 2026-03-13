import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Button, Spinner } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  task_assigned: '📋', task_due: '⏰', task_overdue: '⚠️', comment_mention: '💬',
  comment_added: '💬', project_invite: '👥', member_joined: '🎉', task_completed: '✅',
  task_updated: '✏️', subtask_completed: '✓',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.notifications);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '28px', maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>}
      </div>

      {loading ? <Spinner /> : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => (
            <div key={n._id} onClick={() => { markRead(n._id); if (n.link) navigate(n.link); }} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '14px 16px', borderRadius: 'var(--radius-lg)',
              background: n.read ? 'var(--bg-card)' : 'var(--bg-elevated)',
              border: `1px solid ${n.read ? 'var(--border-subtle)' : 'var(--border-default)'}`,
              cursor: 'pointer', transition: 'all var(--transition)',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {TYPE_ICONS[n.type] || '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: n.read ? '400' : '600', color: 'var(--text-primary)', marginBottom: '3px' }}>{n.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{formatDistanceToNow(new Date(n.createdAt))} ago</p>
              </div>
              {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '4px' }} />}
              <button onClick={e => { e.stopPropagation(); deleteNotif(n._id); }} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '16px', padding: '4px', borderRadius: '4px', opacity: 0.5 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
