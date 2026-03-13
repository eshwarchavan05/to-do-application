import { format, formatDistanceToNow, isPast, isToday, isTomorrow, addDays } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d');
};

export const formatDateTime = (date) => date ? format(new Date(date), 'MMM d, yyyy HH:mm') : null;
export const timeAgo = (date) => date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : null;
export const isOverdue = (date, status) => date && status !== 'done' && isPast(new Date(date)) && !isToday(new Date(date));

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: '🔴' },
  high:     { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.15)', icon: '🟠' },
  medium:   { label: 'Medium',   color: '#eab308', bg: 'rgba(234,179,8,0.15)',  icon: '🟡' },
  low:      { label: 'Low',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  icon: '🟢' },
};

export const STATUS_CONFIG = {
  backlog:     { label: 'Backlog',     color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  todo:        { label: 'To Do',       color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  review:      { label: 'Review',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  done:        { label: 'Done',        color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
};

export const formatMinutes = (mins) => {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
