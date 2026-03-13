import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--bg-base)',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Left side - branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', background: 'linear-gradient(135deg, rgba(91,110,245,0.1) 0%, transparent 60%)',
        borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(91,110,245,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '42px', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-1px' }}>
            ⚡ TaskMaster<span style={{ color: 'var(--accent)' }}>Pro</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.6, maxWidth: '480px', marginBottom: '48px' }}>
            The professional task management platform that helps teams ship faster.
          </p>
          {[
            { icon: '◫', title: 'Kanban Boards', desc: 'Drag-and-drop task management' },
            { icon: '◈', title: 'Analytics', desc: 'Track your team\'s performance' },
            { icon: '⚡', title: 'Real-time Sync', desc: 'Collaborate without conflicts' },
            { icon: '◷', title: 'Time Tracking', desc: 'Built-in Pomodoro timer' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(91,110,245,0.15)', border: '1px solid rgba(91,110,245,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>{f.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - form */}
      <div style={{ width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: '600' }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Full Name</label>
                <input name="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
              </div>
            )}
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" required minLength={6} />
            </div>
            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              color: '#fff', border: 'none', borderRadius: '10px', padding: '14px',
              fontSize: '16px', fontWeight: '700', marginTop: '8px',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-display)',
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;