import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatMinutes } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TaskModal = ({ task, project, onSave, onClose, onDelete }) => {
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    dueDate: '', estimatedHours: '', tags: '', assignees: [],
  });
  const [subtaskInput, setSubtaskInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '', description: task.description || '',
        status: task.status || 'todo', priority: task.priority || 'medium',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        estimatedHours: task.estimatedHours || '',
        tags: task.tags?.join(', ') || '',
        assignees: task.assignees?.map(a => a._id || a) || [],
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
        project: project?._id,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  const TABS = ['details', 'subtasks', 'comments', 'time'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px' }}>{task ? 'Edit Task' : 'New Task'}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {task && onDelete && (
              <button onClick={() => { onDelete(task._id); onClose(); }} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '13px' }}>Delete</button>
            )}
            <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '20px' }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        {task && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '12px 16px', background: 'none', color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize', marginBottom: '-1px' }}>
                {tab}
              </button>
            ))}
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
          {/* Details Tab */}
          {(!task || activeTab === 'details') && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Task title" required style={{ fontSize: '18px', fontWeight: '600', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '8px 0' }} />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Add description..." rows={4} style={{ resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ background: 'var(--bg-overlay)' }}>
                    {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ background: 'var(--bg-overlay)' }}>
                    {Object.entries(PRIORITY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Est. Hours</label>
                  <input type="number" min="0" step="0.5" value={form.estimatedHours} onChange={e => setForm({...form, estimatedHours: e.target.value})} placeholder="0" />
                </div>
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Tags</label>
                <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="design, backend, bug (comma separated)" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          )}

          {/* Subtasks Tab */}
          {task && activeTab === 'subtasks' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input value={subtaskInput} onChange={e => setSubtaskInput(e.target.value)}
                  placeholder="Add a subtask..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); /* handled by parent */ }}} />
                <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => setSubtaskInput('')}>Add</button>
              </div>
              {task.progress !== undefined && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span>Progress</span><span>{task.progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-overlay)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${task.progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--purple))', borderRadius: '10px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              {task.subtasks?.map(st => (
                <div key={st._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${st.completed ? 'var(--green)' : 'var(--border-hover)'}`, background: st.completed ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    {st.completed && <span style={{ color: '#fff', fontSize: '11px' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '14px', textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>{st.title}</span>
                </div>
              ))}
              {!task.subtasks?.length && <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '32px' }}>No subtasks yet</div>}
            </div>
          )}

          {/* Comments Tab */}
          {task && activeTab === 'comments' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <textarea value={commentInput} onChange={e => setCommentInput(e.target.value)}
                  placeholder="Write a comment..." rows={2} style={{ resize: 'none' }} />
                <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', alignSelf: 'flex-end' }}>Post</button>
              </div>
              {task.comments?.map(c => (
                <div key={c._id} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                    {c.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius)', padding: '12px', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{c.user?.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{c.text}</div>
                  </div>
                </div>
              ))}
              {!task.comments?.length && <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '32px' }}>No comments yet</div>}
            </div>
          )}

          {/* Time Tracking Tab */}
          {task && activeTab === 'time' && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button className="btn btn-primary">▶ Start Timer</button>
                <div style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', fontSize: '20px', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: '700' }}>00:00:00</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-overlay)', borderRadius: 'var(--radius)', marginBottom: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Total Logged</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>{formatMinutes(task.totalTimeLogged)}</div>
              </div>
              {task.timeEntries?.map(e => (
                <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{e.user?.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{formatMinutes(e.duration)}</span>
                </div>
              ))}
              {!task.timeEntries?.length && <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '32px' }}>No time entries yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;