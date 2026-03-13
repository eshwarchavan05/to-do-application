import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { timeAgo } from '../../utils/helpers';

const Topbar = ({ title, actions }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header style={{
      height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{title}</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {actions}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifs(!showNotifs)} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', width: '36px', height: '36px',
            borderRadius: '8px', fontSize: '16px', position: 'relative',
          }}>
            🔔
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--red)', color: '#fff',
                borderRadius: '10px', fontSize: '10px', fontWeight: '700',
                padding: '1px 5px', minWidth: '16px', textAlign: 'center',
              }}>{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', right: 0, top: '44px', width: '340px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 200,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>Notifications</span>
                {unread > 0 && <button onClick={markAllRead} style={{ background: 'none', color: 'var(--accent)', fontSize: '12px' }}>Mark all read</button>}
              </div>
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No notifications</div>
                ) : notifications.map(n => (
                  <div key={n._id} onClick={() => { setShowNotifs(false); if (n.link) navigate(n.link); }}
                    style={{
                      padding: '12px 16px', cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      background: n.read ? 'transparent' : 'rgba(91,110,245,0.05)',
                      transition: 'background 0.15s',
                    }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      {!n.read && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '6px' }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{n.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{n.message}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{timeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/profile')} style={{
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          border: 'none', borderRadius: '50%', width: '36px', height: '36px',
          color: '#fff', fontSize: '13px', fontWeight: '700',
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
