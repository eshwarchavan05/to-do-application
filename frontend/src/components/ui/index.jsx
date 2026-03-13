import React from 'react';

// ── Button ──────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', icon, loading, style, ...props }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontWeight: '500', borderRadius: 'var(--radius-md)', border: 'none',
    cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
    opacity: props.disabled || loading ? 0.6 : 1,
    transition: 'all var(--transition)', whiteSpace: 'nowrap',
  };
  const sizes = {
    xs: { padding: '4px 10px', fontSize: '12px' },
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '11px 22px', fontSize: '15px' },
  };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    secondary: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' },
    ghost: { background: 'none', color: 'var(--text-secondary)' },
    danger: { background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' },
    success: { background: 'rgba(16,185,129,0.15)', color: 'var(--success)' },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} {...props}>
      {loading ? <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>◌</span> : icon}
      {children}
    </button>
  );
};

// ── Badge ──────────────────────────────────────────────────────
export const Badge = ({ children, color = 'var(--text-secondary)', bg = 'var(--bg-elevated)', style }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
    background: bg, color, whiteSpace: 'nowrap', ...style,
  }}>{children}</span>
);

// ── Priority Badge ──────────────────────────────────────────────
const PRIORITY_CONFIG = {
  none: { label: 'None', color: 'var(--priority-none)', bg: 'rgba(74,85,104,0.2)', dot: '○' },
  low: { label: 'Low', color: 'var(--priority-low)', bg: 'rgba(16,185,129,0.15)', dot: '▽' },
  medium: { label: 'Medium', color: 'var(--priority-medium)', bg: 'rgba(79,142,247,0.15)', dot: '◇' },
  high: { label: 'High', color: 'var(--priority-high)', bg: 'rgba(245,158,11,0.15)', dot: '△' },
  urgent: { label: 'Urgent', color: 'var(--priority-urgent)', bg: 'rgba(239,68,68,0.15)', dot: '▲' },
};

export const PriorityBadge = ({ priority = 'medium', showLabel = true }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <Badge color={cfg.color} bg={cfg.bg}>
      <span>{cfg.dot}</span>
      {showLabel && cfg.label}
    </Badge>
  );
};

// ── Status Badge ──────────────────────────────────────────────
const STATUS_CONFIG = {
  backlog: { label: 'Backlog', color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  todo: { label: 'To Do', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  review: { label: 'Review', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  done: { label: 'Done', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
};

export const StatusBadge = ({ status = 'todo' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  return <Badge color={cfg.color} bg={cfg.bg}>{cfg.label}</Badge>;
};

// ── Avatar ──────────────────────────────────────────────────────
export const Avatar = ({ user, size = 28, style }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: user?.avatar ? undefined : 'linear-gradient(135deg, var(--accent), #6366f1)',
    backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined,
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.4, fontWeight: '700', color: '#fff', ...style,
  }} title={user?.name}>
    {!user?.avatar && user?.name?.[0]?.toUpperCase()}
  </div>
);

// ── AvatarGroup ──────────────────────────────────────────────────
export const AvatarGroup = ({ users = [], max = 3, size = 24 }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {users.slice(0, max).map((u, i) => (
      <div key={u._id || i} style={{ marginLeft: i > 0 ? -size * 0.4 : 0, position: 'relative', zIndex: max - i }}>
        <Avatar user={u} size={size} style={{ border: '2px solid var(--bg-card)' }} />
      </div>
    ))}
    {users.length > max && (
      <div style={{
        width: size, height: size, borderRadius: '50%', marginLeft: -size * 0.4,
        background: 'var(--bg-elevated)', border: '2px solid var(--bg-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, color: 'var(--text-secondary)', fontWeight: '600',
      }}>+{users.length - max}</div>
    )}
  </div>
);

// ── Modal ──────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, width = '560px' }) => {
  if (!isOpen) return null;
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }}>
      <div className="fade-in" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', padding: '28px',
        width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', width: '28px', height: '28px', fontSize: '14px' }}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// ── Input ──────────────────────────────────────────────────────
export const Input = ({ label, error, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
    <input style={{ padding: '9px 12px', width: '100%', ...style }} {...props} />
    {error && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</span>}
  </div>
);

// ── Select ──────────────────────────────────────────────────────
export const Select = ({ label, options = [], style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
    <select style={{ padding: '9px 12px', width: '100%', ...style }} {...props}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ── Card ──────────────────────────────────────────────────────
export const Card = ({ children, style, onClick, hoverable }) => (
  <div onClick={onClick} style={{
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)', padding: '20px',
    transition: hoverable ? 'all var(--transition)' : undefined,
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  }}>
    {children}
  </div>
);

// ── Empty State ──────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '60px 20px', color: 'var(--text-muted)' }}>
    <span style={{ fontSize: '48px' }}>{icon}</span>
    {title && <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '500' }}>{title}</p>}
    {description && <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '280px' }}>{description}</p>}
    {action}
  </div>
);

// ── Spinner ──────────────────────────────────────────────────────
export const Spinner = ({ size = 20, color = 'var(--accent)' }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${color}20`, borderTopColor: color, animation: 'spin 0.7s linear infinite' }} />
);

// ── Tooltip ──────────────────────────────────────────────────────
export const Tooltip = ({ content, children }) => (
  <div style={{ position: 'relative', display: 'inline-flex' }} title={content}>
    {children}
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────
export const ProgressBar = ({ value = 0, color = 'var(--accent)', height = 4 }) => (
  <div style={{ background: 'var(--bg-elevated)', borderRadius: '99px', height, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, value)}%`, height: '100%', background: value === 100 ? 'var(--success)' : color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
  </div>
);
