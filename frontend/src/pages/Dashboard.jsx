import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PRIORITY_CONFIG, formatDate, isOverdue } from '../utils/helpers';
import Topbar from '../components/layout/Topbar';

const StatCard = ({ label, value, icon, color, sub, onClick }) => (
  <div onClick={onClick} style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px', cursor: onClick ? 'pointer' : 'default',
    transition: 'border-color 0.15s, transform 0.15s',
  }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-display)', color: color || 'var(--text-primary)', lineHeight: 1 }}>{value ?? 0}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>}
      </div>
      <span style={{ fontSize: '28px', opacity: 0.7 }}>{icon}</span>
    </div>
  </div>
);

const TOOLTIP_STYLE = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px' };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const priorityData = (data?.tasksByPriority || []).map(p => ({
    name: PRIORITY_CONFIG[p._id]?.label || p._id,
    value: p.count,
    color: PRIORITY_CONFIG[p._id]?.color || '#6366f1',
  }));

  return (
    <div>
      <Topbar title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user?.name?.split(' ')[0]} 👋`} />
      <div style={{ padding: '24px', maxWidth: '1400px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <StatCard label="Total Tasks" value={stats.total} icon="📋" />
          <StatCard label="In Progress" value={stats.inProgress} icon="🔄" color="var(--amber)" />
          <StatCard label="Completed" value={stats.done} icon="✅" color="var(--green)" sub={`${completionRate}% completion rate`} />
          <StatCard label="Overdue" value={stats.overdue} icon="⚠️" color="var(--red)" />
          <StatCard label="This Week" value={stats.completedThisWeek} icon="🏆" color="var(--purple)" sub="tasks completed" />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Completion Chart */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Task Completion (30 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.completionChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={d => format(new Date(d), 'MMM d')} interval={6} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Breakdown */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>By Priority</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {priorityData.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                  </div>
                  <span style={{ fontWeight: '600' }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)' }}>Upcoming Due</h3>
            <button onClick={() => navigate('/tasks')} style={{ background: 'none', color: 'var(--accent)', fontSize: '13px', fontWeight: '600' }}>View all →</button>
          </div>
          {data?.upcomingTasks?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>No upcoming tasks 🎉</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(data?.upcomingTasks || []).map(task => (
              <div key={task._id} onClick={() => navigate(`/board`)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '16px' }}>{PRIORITY_CONFIG[task.priority]?.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{task.project?.name}</div>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: isOverdue(task.dueDate, task.status) ? 'var(--red)' : 'var(--text-muted)', fontWeight: '500' }}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;