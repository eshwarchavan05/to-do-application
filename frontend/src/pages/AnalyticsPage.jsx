import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Card, Spinner, Avatar } from '../components/ui';
import { CompletionTrendChart, StatusBreakdownChart, PriorityBreakdownChart, WeeklyActivityChart } from '../components/analytics/Charts';
import api from '../utils/api';

const AnalyticsPage = () => {
  const { projects, selectProject } = useProject();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) setSelectedProject(projects[0]._id);
  }, [projects]);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api.get(`/projects/${selectedProject}/stats`)
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const project = projects.find(p => p._id === selectedProject);

  return (
    <div style={{ padding: '28px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Project performance insights</p>
        </div>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ padding: '8px 14px', fontSize: '13px', minWidth: '200px' }}>
          {projects.map(p => <option key={p._id} value={p._id}>{p.icon} {p.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner size={36} /></div>
      ) : stats ? (
        <>
          {/* Status summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { key: 'backlog', label: 'Backlog', color: '#64748b' },
              { key: 'todo', label: 'To Do', color: 'var(--accent)' },
              { key: 'in-progress', label: 'In Progress', color: 'var(--warning)' },
              { key: 'review', label: 'Review', color: '#8b5cf6' },
              { key: 'done', label: 'Done', color: 'var(--success)' },
            ].map(s => {
              const found = stats.statusStats?.find(d => d._id === s.key);
              return (
                <Card key={s.key} style={{ textAlign: 'center', padding: '16px' }}>
                  <p style={{ fontSize: '26px', fontWeight: '700', color: s.color }}>{found?.count || 0}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</p>
                </Card>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <Card>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px' }}>Completion Trend</h3>
              <CompletionTrendChart data={stats.completionTrend} />
            </Card>
            <Card>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px' }}>Tasks by Status</h3>
              <StatusBreakdownChart data={stats.statusStats} />
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Card>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px' }}>Priority Distribution</h3>
              <PriorityBreakdownChart data={stats.priorityStats} />
            </Card>
            <Card>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px' }}>Team Performance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.assigneeStats?.map(a => (
                  <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar user={a.user} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{a.user.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.done}/{a.count} done</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ width: `${a.count > 0 ? (a.done / a.count) * 100 : 0}%`, height: '100%', background: 'var(--success)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  </div>
                ))}
                {!stats.assigneeStats?.length && <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No assignee data</p>}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <p>Select a project to view analytics</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
