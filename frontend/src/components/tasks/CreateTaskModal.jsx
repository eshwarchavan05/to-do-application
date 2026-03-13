import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../ui';
import { useProject } from '../../context/ProjectContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PRIORITIES = [
  { value: 'none', label: 'None' }, { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' },
];
const STATUSES = [
  { value: 'backlog', label: 'Backlog' }, { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' }, { value: 'review', label: 'Review' }, { value: 'done', label: 'Done' },
];

const CreateTaskModal = ({ isOpen, onClose, editTask, defaultColumnId }) => {
  const { currentProject, createTask, updateTask } = useProject();
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: '', estimatedTime: '', assignees: [], columnId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || '',
        description: editTask.description || '',
        status: editTask.status || 'todo',
        priority: editTask.priority || 'medium',
        dueDate: editTask.dueDate ? format(new Date(editTask.dueDate), 'yyyy-MM-dd') : '',
        tags: (editTask.tags || []).join(', '),
        estimatedTime: editTask.estimatedTime || '',
        assignees: editTask.assignees?.map(a => a._id || a) || [],
        columnId: editTask.columnId || defaultColumnId || '',
      });
    } else {
      setForm(f => ({ ...f, columnId: defaultColumnId || '' }));
    }
  }, [editTask, defaultColumnId]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
        estimatedTime: parseInt(form.estimatedTime) || 0,
      };
      if (editTask) await updateTask(currentProject._id, editTask._id, payload);
      else await createTask(currentProject._id, payload);
      toast.success(editTask ? 'Task updated!' : 'Task created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const columnOptions = (currentProject?.columns || []).map(c => ({ value: c.id, label: c.title }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTask ? 'Edit Task' : 'Create Task'} width="600px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Title *" name="title" value={form.title} onChange={handleChange} placeholder="What needs to be done?" autoFocus />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add details..." rows={3} style={{ padding: '9px 12px', resize: 'vertical', width: '100%' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Select label="Status" name="status" value={form.status} onChange={handleChange} options={STATUSES} />
          <Select label="Priority" name="priority" value={form.priority} onChange={handleChange} options={PRIORITIES} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
          <Input label="Estimate (minutes)" name="estimatedTime" type="number" value={form.estimatedTime} onChange={handleChange} placeholder="e.g. 60" />
        </div>

        {columnOptions.length > 0 && (
          <Select label="Column" name="columnId" value={form.columnId} onChange={handleChange} options={columnOptions} />
        )}

        <Input label="Tags (comma-separated)" name="tags" value={form.tags} onChange={handleChange} placeholder="frontend, bug, design" />

        {/* Assignees */}
        {currentProject?.members?.length > 0 && (
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Assignees</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {currentProject.members.map(m => {
                const userId = m.user?._id || m.user;
                const isSelected = form.assignees.includes(userId);
                return (
                  <button key={userId} onClick={() => setForm(f => ({ ...f, assignees: isSelected ? f.assignees.filter(id => id !== userId) : [...f.assignees, userId] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: 'var(--radius-md)', background: isSelected ? 'var(--accent-dim)' : 'var(--bg-elevated)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-default)'}`, color: isSelected ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '13px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff' }}>
                      {m.user?.name?.[0]?.toUpperCase()}
                    </div>
                    {m.user?.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>{editTask ? 'Save Changes' : 'Create Task'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
