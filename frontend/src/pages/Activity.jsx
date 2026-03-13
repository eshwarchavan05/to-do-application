import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { timeAgo, getInitials } from '../utils/helpers';
import { useProjects } from '../context/ProjectContext';
import Topbar from '../components/layout/Topbar';

const ACTION_ICONS = { created: '✨', updated: '✏️', deleted: '🗑️', completed: '✅', commented: '💬', assigned: '👤', moved: '↗️', invited: '📩', removed: '❌' };

const Activity = () => {
  const { projects, currentProject } = useProjects();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const project = currentProject || projects[0];

  useEffect(() => {
    if (!project) return;
    api.get(`/projects/${project._id}/activity`)
      .then(({ data }) => setActivities(data.activities))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [project]);

  return (
    <div>
      <Topbar title="Activity" />
      <div style={{ padding: '24px', maxWidth: '700px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '64px' }} />)}
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🕐</div>
            <div>No activity yet</div>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{ position: 'absolute', left: '15px', top: 0, bottom: 0, width: '2px', background: 'var(--border)' }} />
            {activities.map((a, i) => (
              <div key={a._id} style={{ position: 'relative', marginBottom: '20px', animation: `slideIn 0.3s ease ${i * 0.04}s both` }}>
                <div style={{ position: 'absolute', left: '-25px', top: '8px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  {ACTION_ICONS[a.action] || '•'}
                </div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `hsl(${(a.user?.name?.charCodeAt(0) || 65) * 5}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff' }}>
                      {getInitials(a.user?.name)}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{a.user?.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{a.action}</span>
                    {a.targetTitle && <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '500' }}>"{a.targetTitle}"</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(a.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;