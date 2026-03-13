import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import api from '../utils/api';
import { Avatar, Spinner } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';

const ACTION_ICONS = {
  created: '✨', updated: '✏️', deleted: '🗑', moved: '↔️', assigned: '👤',
  unassigned: '👤', commented: '💬', completed: '✅', reopened: '↩️',
  attached: '📎', invited: '📧', joined: '🎉', left: '👋', archived: '📦', time_logged: '⏱',
};

const ActivityPage = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject } = useProject();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) selectProject(projectId);
  }, [projectId]);

  const load = async (p = 1) => {
    try {
      const { data } = await api.get(`/projects/${projectId}/activity?page=${p}`);
      if (p === 1) setActivities(data.activities);
      else setActivities(prev => [...prev, ...data.activities]);
      setHasMore(data.activities.length === 30);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (projectId) load(1); }, [projectId]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next);
  };

  const formatActivity = (a) => {
    const target = a.targetTitle ? `"${a.targetTitle}"` : a.targetType;
    switch (a.action) {
      case 'created': return `created ${a.targetType} ${target}`;
      case 'updated': return `updated ${a.targetType} ${target}`;
      case 'deleted': return `deleted ${a.targetType} ${target}`;
      case 'moved': return `moved ${target} to a new column`;
      case 'commented': return `commented on ${target}`;
      case 'completed': return `completed ${target}`;
      case 'assigned': return `assigned ${target}`;
      case 'invited': return `invited ${target} to the project`;
      case 'time_logged': {
        const dur = a.metadata?.get ? a.metadata.get('duration') : (a.metadata?.duration);
        return `logged ${dur || '?'}m on ${target}`;
      }
      default: return `${a.action} ${target}`;
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Activity</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>All project activity in chronological order</p>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner size={32} /></div> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {activities.map((a, i) => (
              <div key={a._id} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderBottom: i < activities.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                {/* Icon */}
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>
                  {ACTION_ICONS[a.action] || '•'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <Avatar user={a.user} size={20} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{a.user?.name}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatActivity(a)}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(a.createdAt))} ago</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <p>No activity yet</p>
              </div>
            )}
          </div>
          {hasMore && (
            <button onClick={loadMore} style={{ width: '100%', padding: '12px', marginTop: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityPage;
