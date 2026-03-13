import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { getInitials } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/board', icon: '◫', label: 'Board' },
  { to: '/tasks', icon: '✓', label: 'My Tasks' },
  { to: '/calendar', icon: '◷', label: 'Calendar' },
  { to: '/team', icon: '◎', label: 'Team' },
  { to: '/analytics', icon: '◈', label: 'Analytics' },
  { to: '/activity', icon: '◉', label: 'Activity' },
];

const Sidebar = ({ onNewProject }) => {
  const { user, logout } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProjects();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      transition: 'width 0.2s ease', flexShrink: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            ⚡ TaskMaster
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '18px', padding: '4px', borderRadius: '6px', lineHeight: 1 }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px', marginBottom: '2px',
            textDecoration: 'none', fontSize: '14px', fontWeight: '500',
            transition: 'all 0.15s',
            background: isActive ? 'rgba(91,110,245,0.15)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
          })}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
            {!collapsed && label}
          </NavLink>
        ))}

        {/* Projects */}
        {!collapsed && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 8px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Projects
              <button onClick={onNewProject} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1, padding: '2px' }}>+</button>
            </div>
            {projects.slice(0, 8).map(p => (
              <button key={p._id} onClick={() => { setCurrentProject(p); navigate(`/projects/${p._id}`); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  background: currentProject?._id === p._id ? 'rgba(91,110,245,0.12)' : 'none',
                  color: currentProject?._id === p._id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: '500', marginBottom: '1px',
                  border: 'none', textAlign: 'left', transition: 'all 0.15s',
                }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color || '#6366f1', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <NavLink to="/settings" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 10px', borderRadius: '8px', textDecoration: 'none',
          color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px',
        })}>
          <span>⚙</span>{!collapsed && 'Settings'}
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700',
          }}>
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <button onClick={logout} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '11px', padding: 0 }}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
