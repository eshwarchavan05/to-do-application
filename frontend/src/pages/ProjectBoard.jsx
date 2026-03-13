import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import PomodoroTimer from '../components/tasks/PomodoroTimer';
import { Button, StatusBadge, PriorityBadge, AvatarGroup, Spinner, EmptyState } from '../components/ui';
import { format } from 'date-fns';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { selectProject, currentProject, tasks, loading, fetchProjectTasks } = useProject();
  const [view, setView] = useState('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [defaultColumn, setDefaultColumn] = useState(null);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (projectId) selectProject(projectId);
  }, [projectId]);

  const handleAddTask = (column) => {
    setDefaultColumn(column?.id);
    setShowCreate(true);
  };

  const filteredTasks = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  if (!currentProject && !loading) return (
    <EmptyState icon="📁" title="Project not found" description="This project doesn't exist or you don't have access."
      action={<Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Project header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{currentProject?.icon}</span>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{currentProject?.name}</h1>
              {currentProject?.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{currentProject.description}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Members */}
            {currentProject?.members && (
              <AvatarGroup users={currentProject.members.map(m => m.user).filter(Boolean)} max={4} size={26} />
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}/team`)}>⚙ Settings</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}/activity`)}>📋 Activity</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowPomodoro(p => !p)}>🍅</Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>+ Task</Button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
            {[{ id: 'kanban', icon: '⊞', label: 'Board' }, { id: 'list', icon: '☰', label: 'List' }].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{ padding: '5px 10px', borderRadius: '4px', background: view === v.id ? 'var(--bg-card)' : 'none', color: view === v.id ? 'var(--accent)' : 'var(--text-muted)', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ padding: '6px 12px', fontSize: '13px', width: '200px' }} />

          {/* Filters */}
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: '6px 10px', fontSize: '13px' }}>
            <option value="all">All priorities</option>
            {['none','low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '6px 10px', fontSize: '13px' }}>
            <option value="all">All statuses</option>
            {['backlog','todo','in-progress','review','done'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{filteredTasks.length} tasks</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', gap: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={36} /></div>
        ) : view === 'kanban' ? (
          <KanbanBoard onTaskClick={t => setSelectedTaskId(t._id)} onAddTask={handleAddTask} />
        ) : (
          <ListView tasks={filteredTasks} onTaskClick={t => setSelectedTaskId(t._id)} onAddTask={() => setShowCreate(true)} />
        )}

        {/* Pomodoro sidebar */}
        {showPomodoro && (
          <div style={{ flexShrink: 0 }}>
            <PomodoroTimer />
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskDetailModal taskId={selectedTaskId} projectId={projectId} onClose={() => setSelectedTaskId(null)} />
      <CreateTaskModal isOpen={showCreate} onClose={() => { setShowCreate(false); setDefaultColumn(null); }} defaultColumnId={defaultColumn} />
    </div>
  );
};

// List view component
const ListView = ({ tasks, onTaskClick, onAddTask }) => (
  <div style={{ flex: 1 }}>
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
        {['Task', 'Status', 'Priority', 'Assignees', 'Due Date'].map(h => (
          <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
        ))}
      </div>
      {tasks.length === 0 ? (
        <EmptyState icon="📋" title="No tasks" description="Add your first task to get started"
          action={<Button size="sm" onClick={onAddTask}>+ Add Task</Button>} />
      ) : tasks.map(task => (
        <div key={task._id} onClick={() => onTaskClick(task)} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background var(--transition)', alignItems: 'center' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '500', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} className="truncate">{task.title}</p>
            {task.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                {task.tags.slice(0, 2).map(tag => <span key={tag} style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '3px', fontSize: '10px' }}>{tag}</span>)}
              </div>
            )}
          </div>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          <AvatarGroup users={task.assignees || []} max={3} size={22} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '—'}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ProjectBoard;
