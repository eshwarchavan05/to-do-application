import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from '../utils/helpers';
import TaskModal from '../components/modals/TaskModal';
import Topbar from '../components/layout/Topbar';
import { useProjects } from '../context/ProjectContext';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const { projects } = useProjects();

  const fetchAllTasks = useCallback(async () => {
    if (!projects.length) return;
    setLoading(true);
    try {
      const results = await Promise.all(projects.map(p => api.get(`/tasks/project/${p._id}`)));
      const all = results.flatMap(r => r.data.tasks);
      setTasks(all);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [projects]);

  useEffect(() => { fetchAllTasks(); }, [fetchAllTasks]);

  const filtered = tasks.filter(t => {
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'dueDate') return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
    if (sortBy === 'priority') { const order = { critical: 0, high: 1, medium: 2, low: 3 }; return order[a.priority] - order[b.priority]; }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleSave = async (formData) => {
    try {
      const { data } = await api.put(`/tasks/${selectedTask._id}`, formData);
      setTasks(prev => prev.map(t => t._id === selectedTask._id ? data.task : t));
      toast.success('Task updated!');
    } catch (err) { toast.error('Failed'); throw err; }
  };

  const toggleStatus = async (task) => {
    const next = { backlog: 'todo', todo: 'in-progress', 'in-progress': 'review', review: 'done', done: 'todo' };
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status: next[task.status], columnId: next[task.status] });
      setTasks(prev => prev.map(t => t._id === task._id ? data.task : t));
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <Topbar title="My Tasks" actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}
            placeholder="Search tasks..." style={{ width: '200px', padding: '7px 12px', fontSize: '13px' }} />
        </div>
      } />
      <div style={{ padding: '24px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {['all', 'todo', 'in-progress', 'review', 'done'].map(s => (
              <button key={s} onClick={() => setFilters({...filters, status: s})}
                style={{ padding: '5px 12px', borderRadius: '6px', background: filters.status === s ? 'var(--accent)' : 'transparent', color: filters.status === s ? '#fff' : 'var(--text-muted)', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
          <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 10px', borderRadius: '8px', fontSize: '13px', width: 'auto' }}>
            <option value="all">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.icon} {c.label}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 10px', borderRadius: '8px', fontSize: '13px', width: 'auto', marginLeft: 'auto' }}>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="created">Sort: Created</option>
          </select>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '72px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>No tasks found</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map(task => {
              const priority = PRIORITY_CONFIG[task.priority];
              const overdue = isOverdue(task.dueDate, task.status);
              const status = STATUS_CONFIG[task.status];
              return (
                <div key={task._id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${priority?.color || 'var(--border)'}`,
                  borderRadius: '10px', padding: '14px 16px', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onClick={() => { setSelectedTask(task); setShowModal(true); }}>
                  {/* Status toggle */}
                  <button onClick={e => { e.stopPropagation(); toggleStatus(task); }}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${task.status === 'done' ? 'var(--green)' : 'var(--border-hover)'}`, background: task.status === 'done' ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                    {task.status === 'done' && <span style={{ color: '#fff', fontSize: '11px' }}>✓</span>}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </div>
                    {task.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {task.tags.slice(0, 3).map(tag => <span key={tag} style={{ background: 'rgba(91,110,245,0.15)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '20px', fontSize: '10px' }}>{tag}</span>)}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ background: priority?.bg, color: priority?.color, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{priority?.icon} {priority?.label}</span>
                    <span style={{ background: status?.bg, color: status?.color, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{status?.label}</span>
                    {task.dueDate && (
                      <span style={{ fontSize: '12px', color: overdue ? 'var(--red)' : 'var(--text-muted)', fontWeight: overdue ? '600' : '400' }}>
                        {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedTask && (
        <TaskModal task={selectedTask} onSave={handleSave} onClose={() => { setShowModal(false); setSelectedTask(null); }} />
      )}
    </div>
  );
};

export default MyTasks;