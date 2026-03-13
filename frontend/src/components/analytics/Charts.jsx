import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { accent: '#4f8ef7', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6', teal: '#14b8a6' };
const PRIORITY_COLORS = { none: '#4a5568', low: '#10b981', medium: '#4f8ef7', high: '#f59e0b', urgent: '#ef4444' };
const STATUS_COLORS = { backlog: '#64748b', todo: '#4f8ef7', 'in-progress': '#f59e0b', review: '#8b5cf6', done: '#10b981' };

const tooltipStyle = {
  contentStyle: { background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px' },
  itemStyle: { color: 'var(--text-secondary)' },
  labelStyle: { color: 'var(--text-primary)', fontWeight: '600' },
};

export const CompletionTrendChart = ({ data }) => {
  const chartData = data?.map(d => ({ date: d._id?.slice(5), count: d.count })) || [];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} />
        <Line type="monotone" dataKey="count" stroke={COLORS.accent} strokeWidth={2} dot={false} name="Tasks Completed" activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const PriorityBreakdownChart = ({ data }) => {
  const chartData = data?.map(d => ({ name: d._id, value: d.count, color: PRIORITY_COLORS[d._id] || COLORS.accent })) || [];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
          {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend formatter={(value) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const StatusBreakdownChart = ({ data }) => {
  const chartData = data?.map(d => ({ name: d._id === 'in-progress' ? 'In Progress' : d._id.charAt(0).toUpperCase() + d._id.slice(1), value: d.count, color: STATUS_COLORS[d._id] })) || [];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Tasks">
          {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const WeeklyActivityChart = ({ data }) => {
  const chartData = data?.map(d => ({ day: d._id?.slice(5), actions: d.count })) || [];
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={chartData} barCategoryGap="20%">
        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="actions" fill={COLORS.accent} radius={[3, 3, 0, 0]} name="Actions" />
      </BarChart>
    </ResponsiveContainer>
  );
};
