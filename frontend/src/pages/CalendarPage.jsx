import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import api from '../utils/api';
import { useProjects } from '../context/ProjectContext';
import { PRIORITY_CONFIG, isOverdue } from '../utils/helpers';
import Topbar from '../components/layout/Topbar';

const CalendarPage = () => {
  const { projects } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!projects.length) return;
    try {
      const results = await Promise.all(projects.map(p => api.get(`/tasks/project/${p._id}`)));
      setTasks(results.flatMap(r => r.data.tasks).filter(t => t.dueDate));
    } catch {}
  }, [projects]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getTasksForDay = (day) => tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <Topbar title="Calendar" />
      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        {/* Calendar */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}>‹</button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>{format(currentDate, 'MMMM yyyy')}</h3>
            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {WEEKDAYS.map(d => (
              <div key={d} style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((day, i) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const selected = selectedDay && isSameDay(day, selectedDay);
              const today = isToday(day);
              return (
                <div key={i} onClick={() => setSelectedDay(day)}
                  style={{
                    minHeight: '90px', padding: '8px', border: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: selected ? 'rgba(91,110,245,0.15)' : today ? 'rgba(91,110,245,0.07)' : 'transparent',
                    opacity: isCurrentMonth ? 1 : 0.35,
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = today ? 'rgba(91,110,245,0.07)' : 'transparent'; }}>
                  <div style={{
                    fontSize: '13px', fontWeight: today ? '800' : '500',
                    color: today ? 'var(--accent)' : selected ? 'var(--text-primary)' : isCurrentMonth ? 'var(--text-secondary)' : 'var(--text-muted)',
                    marginBottom: '6px',
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: today ? 'var(--accent-glow)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{format(day, 'd')}</div>
                  {dayTasks.slice(0, 3).map(t => (
                    <div key={t._id} style={{
                      fontSize: '10px', fontWeight: '600', padding: '2px 5px', borderRadius: '4px', marginBottom: '2px',
                      background: PRIORITY_CONFIG[t.priority]?.bg || 'rgba(99,102,241,0.15)',
                      color: PRIORITY_CONFIG[t.priority]?.color || 'var(--accent)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{t.title}</div>
                  ))}
                  {dayTasks.length > 3 && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{dayTasks.length - 3} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', fontSize: '15px' }}>
            {selectedDay ? format(selectedDay, 'MMMM d, yyyy') : 'Select a day'}
          </h4>
          {selectedDayTasks.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>No tasks due {selectedDay ? 'this day' : ''}</div>
          ) : selectedDayTasks.map(task => (
            <div key={task._id} style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '8px', borderLeft: `3px solid ${PRIORITY_CONFIG[task.priority]?.color}` }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{task.title}</div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', background: PRIORITY_CONFIG[task.priority]?.bg, color: PRIORITY_CONFIG[task.priority]?.color, padding: '2px 6px', borderRadius: '10px', fontWeight: '600' }}>{task.priority}</span>
                {isOverdue(task.dueDate, task.status) && <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: '600' }}>OVERDUE</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;