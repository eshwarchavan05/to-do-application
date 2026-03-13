import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { format } from 'date-fns';
import api from '../utils/api';
import { useProjects } from '../context/ProjectContext';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/helpers';
import Topbar from '../components/layout/Topbar';

const TOOLTIP_STYLE = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px' };

const Analytics = () => {
  const { projects, currentProject } = useProjects();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const project = selectedProject || currentProject || projects[0];

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    api.get(`/projects/${project._id}/analytics`)
      .then(({ data }) => setData(data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [project?._id]);

  const statusData = (data?.statusStats || []).map(s => ({
    name: STATUS_CONFIG[s._id]?.label || s._id,
    value: s.count,
    color: STATUS_CONFIG[s._id]?.color || '#6366f1',
  }));

  const priorityData = (data?.priorityStats || []).map(p => ({
    name: PRIORITY_CONFIG[p._id]?.label || p._id,
    value: p.count,
    color: PRIORITY_CONFIG[p._id]?.color || '#6366f1',
  }));

  const chartData = (data?.completedOverTime || []).map(d => ({
    date: format(new Date(d._id), 'MMM d'),
    completed: d.count,
  }));

  return (
    <div>
      <Topbar title="Analytics" actions={
        projects.length > 1 && (
          <select value={project?._id} onChange={e => setSelectedProject(projects.find(p => p._id === e.target.value))}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', width: 'auto' }}>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        )
      } />
      <div style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '300px' }} />)}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* Status Breakdown */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Tasks by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Priority Breakdown */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Tasks by Priority</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={priorityData} layout="vertical">
                    <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={70} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {priorityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Completion over time */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Completions Over Time</h3>
              {chartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No completed tasks yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="completed" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Member performance */}
            {data?.memberStats?.length > 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Team Performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.memberStats.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${i * 60}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>{m.name?.[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                          <span>{m.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{m.done}/{m.total}</span>
                        </div>
                        <div style={{ height: '5px', background: 'var(--bg-overlay)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${m.total > 0 ? (m.done / m.total) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--accent), var(--purple))', borderRadius: '10px' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;