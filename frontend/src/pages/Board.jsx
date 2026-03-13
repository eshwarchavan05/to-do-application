import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useProjects } from '../context/ProjectContext';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskModal from '../components/modals/TaskModal';
import Topbar from '../components/layout/Topbar';

const Board = () => {
  const { projects, currentProject, setCurrentProject } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState('todo');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const activeProjectId = selectedProjectId || currentProject?._id || projects[0]?._id;
  const activeProject = projects.find(p => p._id === activeProjectId) || currentProject || projects[0];

  const fetchTasks = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks/project/${projectId}`);
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeProjectId) fetchTasks(activeProjectId);
  }, [activeProjectId, fetchTasks]);

  const handleNewTask = (columnId) => {
    setNewTaskColumn(columnId);
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedTask) {
        const { data } = await api.put(`/tasks/${selectedTask._id}`, formData);
        setTasks(prev => prev.map(t => t._id === selectedTask._id ? data.task : t));
        toast.success('Task updated!');
      } else {
        const { data } = await api.post('/tasks', { ...formData, project: activeProjectId, columnId: newTaskColumn, status: newTaskColumn });
        setTasks(prev => [data.task, ...prev]);
        toast.success('Task created!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
      throw err;
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleReorder = async (updates) => {
    try {
      setTasks(prev => prev.map(t => {
        const upd = updates.find(u => u.id === t._id);
        return upd ? { ...t, columnId: upd.columnId, status: upd.columnId, order: upd.order } : t;
      }));
      await api.patch('/tasks/reorder', { updates });
    } catch {
      toast.error('Reorder failed');
      fetchTasks(activeProjectId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar
        title={activeProject?.name || 'Board'}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {projects.length > 1 && (
              <select value={activeProjectId} onChange={e => setSelectedProjectId(e.target.value)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', width: 'auto' }}>
                {projects.map(p => <option key={p._id} value={p._id}>{p.icon} {p.name}</option>)}
              </select>
            )}
            <button onClick={() => handleNewTask('todo')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>+ New Task</button>
          </div>
        }
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} onNewTask={handleNewTask} onReorder={handleReorder} loading={loading} />
      </div>
      {showModal && (
        <TaskModal task={selectedTask} project={activeProject} onSave={handleSave} onDelete={handleDelete} onClose={() => { setShowModal(false); setSelectedTask(null); }} />
      )}
    </div>
  );
};

export default Board;