import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Button, PriorityBadge, StatusBadge, Avatar, AvatarGroup, ProgressBar, Spinner } from '../ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

const TaskDetailModal = ({ taskId, projectId, onClose }) => {
  const { user } = useAuth();
  const { updateTask, deleteTask, currentProject } = useProject();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!taskId) return;
    api.get(`/projects/${projectId}/tasks/${taskId}`)
      .then(({ data }) => { setTask(data.task); setEditForm(data.task); })
      .catch(() => toast.error('Failed to load task'))
      .finally(() => setLoading(false));
  }, [taskId, projectId]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    setTimerRunning(true);
    timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
  };

  const stopTimer = async () => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    const minutes = Math.round(timerSeconds / 60);
    if (minutes > 0) {
      try {
        await api.post(`/projects/${projectId}/tasks/${taskId}/time`, { duration: minutes });
        toast.success(`Logged ${minutes}m`);
      } catch {}
    }
    setTimerSeconds(0);
  };

  const formatTimer = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSave = async () => {
    try {
      const updated = await updateTask(projectId, taskId, editForm);
      setTask(updated);
      setEditing(false);
      toast.success('Task updated');
    } catch {}
  };

  const handleSubtaskToggle = async (subtaskId, completed) => {
    try {
      const { data } = await api.patch(`/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`, { completed });
      setTask(prev => ({ ...prev, subtasks: data.subtasks }));
    } catch {}
  };

  const handleAddSubtask = async (title) => {
    if (!title.trim()) return;
    try {
      const { data } = await api.post(`/projects/${projectId}/tasks/${taskId}/subtasks`, { title });
      setTask(prev => ({ ...prev, subtasks: data.subtasks }));
    } catch {}
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content: comment });
      setTask(prev => ({ ...prev, comments: [...(prev.comments || []), data.comment] }));
      setComment('');
    } catch {} finally { setPosting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(projectId, taskId);
    onClose();
  };

  if (!taskId) return null;

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
    }}>
      <div className="fade-in" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '800px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <Spinner size={32} />
          </div>
        ) : !task ? null : (
          <>
            {/* Header */}
            <div style={{ padding: '24px 28px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                {editing ? (
                  <input value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    style={{ fontSize: '20px', fontWeight: '600', flex: 1, marginRight: '16px', padding: '6px 10px' }}
                    autoFocus />
                ) : (
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', flex: 1, lineHeight: '1.3', marginRight: '16px', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                    {task.title}
                  </h2>
                )}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {editing ? (
                    <>
                      <Button onClick={handleSave} size="sm">Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>✏ Edit</Button>
                      <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                      <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', paddingBottom: '16px' }}>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.dueDate && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
                {task.estimatedTime > 0 && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    ⏱ {task.estimatedTime}m estimated
                  </span>
                )}
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  Created {formatDistanceToNow(new Date(task.createdAt))} ago
                </span>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0' }}>
                {['details', 'subtasks', 'comments', 'time'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '10px 16px', background: 'none', fontSize: '13px', fontWeight: '500',
                    color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                    borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                    textTransform: 'capitalize', transition: 'all var(--transition)',
                  }}>
                    {tab} {tab === 'comments' && task.comments?.length > 0 && `(${task.comments.length})`}
                    {tab === 'subtasks' && task.subtasks?.length > 0 && `(${task.subtasks.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 240px', gap: '28px', flex: 1 }}>
              {/* Left: Tab content */}
              <div>
                {activeTab === 'details' && (
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Description</p>
                    {editing ? (
                      <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        rows={6} style={{ width: '100%', padding: '10px 12px', resize: 'vertical' }}
                        placeholder="Add a description..." />
                    ) : (
                      <p style={{ color: task.description ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', fontStyle: task.description ? 'normal' : 'italic' }}>
                        {task.description || 'No description'}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags?.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Tags</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {task.tags.map(tag => (
                            <span key={tag} style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'subtasks' && (
                  <SubtasksTab task={task} onToggle={handleSubtaskToggle} onAdd={handleAddSubtask} />
                )}

                {activeTab === 'comments' && (
                  <CommentsTab task={task} comment={comment} setComment={setComment} onPost={handleComment} posting={posting} user={user} />
                )}

                {activeTab === 'time' && (
                  <TimeTab task={task} timerRunning={timerRunning} timerSeconds={timerSeconds} formatTimer={formatTimer} onStart={startTimer} onStop={stopTimer} />
                )}
              </div>

              {/* Right: Properties */}
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <PropertyRow label="Assignees">
                  {task.assignees?.length > 0
                    ? <AvatarGroup users={task.assignees} max={4} size={24} />
                    : <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Unassigned</span>}
                </PropertyRow>
                <PropertyRow label="Status">
                  {editing ? (
                    <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ padding: '5px 8px', fontSize: '13px' }}>
                      {['backlog','todo','in-progress','review','done'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : <StatusBadge status={task.status} />}
                </PropertyRow>
                <PropertyRow label="Priority">
                  {editing ? (
                    <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))} style={{ padding: '5px 8px', fontSize: '13px' }}>
                      {['none','low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : <PriorityBadge priority={task.priority} />}
                </PropertyRow>
                <PropertyRow label="Due Date">
                  {editing ? (
                    <input type="date" value={editForm.dueDate ? format(new Date(editForm.dueDate), 'yyyy-MM-dd') : ''} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} style={{ padding: '5px 8px', fontSize: '13px' }} />
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                    </span>
                  )}
                </PropertyRow>
                <PropertyRow label="Creator">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Avatar user={task.creator} size={20} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{task.creator?.name}</span>
                  </div>
                </PropertyRow>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PropertyRow = ({ label, children }) => (
  <div>
    <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</p>
    {children}
  </div>
);

const SubtasksTab = ({ task, onToggle, onAdd }) => {
  const [newTitle, setNewTitle] = useState('');
  const progress = task.subtasks?.length ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100) : 0;
  return (
    <div>
      {task.subtasks?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} completed</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        {task.subtasks?.map(sub => (
          <label key={sub._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--bg-elevated)' }}>
            <input type="checkbox" checked={sub.completed} onChange={e => onToggle(sub._id, e.target.checked)} style={{ width: '15px', height: '15px', accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: '13px', color: sub.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: sub.completed ? 'line-through' : 'none' }}>{sub.title}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Add subtask..." style={{ flex: 1, padding: '8px 12px' }}
          onKeyDown={e => { if (e.key === 'Enter') { onAdd(newTitle); setNewTitle(''); } }} />
        <Button size="sm" onClick={() => { onAdd(newTitle); setNewTitle(''); }}>Add</Button>
      </div>
    </div>
  );
};

const CommentsTab = ({ task, comment, setComment, onPost, posting, user }) => (
  <div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
      {task.comments?.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No comments yet</p>}
      {task.comments?.map(c => (
        <div key={c._id} style={{ display: 'flex', gap: '10px' }}>
          <Avatar user={c.author} size={28} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.author?.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(c.createdAt))} ago</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--bg-elevated)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>{c.content}</p>
          </div>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <Avatar user={user} size={28} style={{ flexShrink: 0, marginTop: '4px' }} />
      <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..."
          rows={2} style={{ flex: 1, padding: '9px 12px', resize: 'none' }}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) onPost(); }} />
        <Button size="sm" onClick={onPost} loading={posting}>Post</Button>
      </div>
    </div>
  </div>
);

const TimeTab = ({ task, timerRunning, timerSeconds, formatTimer, onStart, onStop }) => {
  const totalMinutes = task.timeEntries?.reduce((s, e) => s + (e.duration || 0), 0) || 0;
  return (
    <div>
      {/* Timer */}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '36px', fontWeight: '500', color: timerRunning ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '16px', letterSpacing: '2px' }}>
          {formatTimer(timerSeconds)}
        </p>
        <Button onClick={timerRunning ? onStop : onStart} variant={timerRunning ? 'danger' : 'primary'}>
          {timerRunning ? '⏹ Stop & Log' : '▶ Start Timer'}
        </Button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center' }}>
          <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--accent)' }}>{totalMinutes}m</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total logged</p>
        </div>
        {task.estimatedTime > 0 && (
          <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center' }}>
            <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--warning)' }}>{task.estimatedTime}m</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Estimated</p>
          </div>
        )}
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {task.timeEntries?.slice().reverse().map((entry, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{entry.duration}m</span>
              {entry.note && <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>{entry.note}</span>}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{format(new Date(entry.createdAt), 'MMM d')}</span>
          </div>
        ))}
        {!task.timeEntries?.length && <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No time logged yet</p>}
      </div>
    </div>
  );
};

const { formatDistanceToNow } = require('date-fns');

export default TaskDetailModal;
