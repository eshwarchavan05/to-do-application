import React, { useState, useEffect } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue, getInitials } from '../../utils/helpers';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#64748b' },
  { id: 'todo', title: 'To Do', color: '#6366f1' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'review', title: 'Review', color: '#8b5cf6' },
  { id: 'done', title: 'Done', color: '#22c55e' },
];

const TaskCard = ({ task, onClick, isDragging }) => {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${priority.color}`,
      borderRadius: '10px', padding: '12px', cursor: 'pointer',
      opacity: isDragging ? 0.5 : 1,
      transition: 'box-shadow 0.15s, transform 0.15s',
      marginBottom: '8px',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Tags */}
      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{ background: 'rgba(91,110,245,0.15)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>{tag}</span>
          ))}
        </div>
      )}

      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', lineHeight: '1.4', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
        {task.title}
      </div>

      {/* Progress bar */}
      {task.subtasks?.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ height: '3px', background: 'var(--bg-overlay)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${task.progress || 0}%`, background: 'var(--accent)', borderRadius: '10px' }} />
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ background: priority.bg, color: priority.color, padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
          {priority.icon} {priority.label}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {task.dueDate && (
            <span style={{ fontSize: '11px', color: overdue ? 'var(--red)' : 'var(--text-muted)' }}>
              {overdue ? '⚠ ' : '📅 '}{formatDate(task.dueDate)}
            </span>
          )}
          {task.assignees?.length > 0 && (
            <div style={{ display: 'flex' }}>
              {task.assignees.slice(0, 3).map((a, i) => (
                <div key={a._id || i} title={a.name} style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: `hsl(${(a.name?.charCodeAt(0) || 65) * 5}, 60%, 45%)`,
                  border: '2px solid var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: '700', color: '#fff',
                  marginLeft: i > 0 ? '-6px' : 0,
                }}>
                  {getInitials(a.name)}
                </div>
              ))}
            </div>
          )}
          {task.comments?.length > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>💬 {task.comments.length}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const SortableCard = ({ task, onTaskClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={() => onTaskClick(task)} isDragging={isDragging} />
    </div>
  );
};

const KanbanBoard = ({ tasks, onTaskClick, onNewTask, onReorder, loading }) => {
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByColumn = (colId) => tasks.filter(t => (t.columnId || t.status) === colId).sort((a, b) => a.order - b.order);

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t._id === active.id));
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;
    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    const overColumn = COLUMNS.find(c => c.id === over.id);
    const overTask = tasks.find(t => t._id === over.id);
    const newColumnId = overColumn?.id || (overTask ? (overTask.columnId || overTask.status) : activeTask.columnId);

    if (onReorder && newColumnId !== (activeTask.columnId || activeTask.status)) {
      onReorder([{ id: active.id, columnId: newColumnId, order: 0 }]);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '16px', padding: '24px', overflowX: 'auto' }}>
        {COLUMNS.map(col => (
          <div key={col.id} style={{ width: '280px', flexShrink: 0 }}>
            <div className="skeleton" style={{ height: '36px', marginBottom: '12px' }} />
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px', marginBottom: '8px' }} />)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '16px', padding: '24px', overflowX: 'auto', minHeight: 'calc(100vh - 120px)' }}>
        {COLUMNS.map(col => {
          const colTasks = getTasksByColumn(col.id);
          return (
            <div key={col.id} style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                  <span style={{ fontWeight: '700', fontSize: '13px', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.title}</span>
                  <span style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', borderRadius: '20px', padding: '1px 8px', fontSize: '12px', fontWeight: '600' }}>{colTasks.length}</span>
                </div>
                <button onClick={() => onNewTask(col.id)} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '20px', width: '28px', height: '28px', borderRadius: '6px', lineHeight: 1, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-overlay)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>+</button>
              </div>

              {/* Column Body */}
              <div style={{ flex: 1, minHeight: '100px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '10px', transition: 'background 0.15s' }}>
                <SortableContext items={colTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  {colTasks.map(task => (
                    <SortableCard key={task._id} task={task} onTaskClick={onTaskClick} />
                  ))}
                </SortableContext>
                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onClick={() => {}} isDragging={false} />}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;