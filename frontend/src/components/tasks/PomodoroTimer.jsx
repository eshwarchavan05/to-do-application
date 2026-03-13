import React, { useState, useEffect, useRef } from 'react';

const MODES = { work: 'Focus', short: 'Short Break', long: 'Long Break' };

const PomodoroTimer = ({ workMinutes = 25, breakMinutes = 5 }) => {
  const [mode, setMode] = useState('work');
  const [seconds, setSeconds] = useState(workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const DURATIONS = { work: workMinutes * 60, short: breakMinutes * 60, long: 15 * 60 };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'work') setSessions(n => n + 1);
            // Auto switch
            const next = mode === 'work' ? 'short' : 'work';
            setMode(next);
            setSeconds(DURATIONS[next]);
            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`${MODES[mode]} complete!`, { body: `Time for a ${next === 'short' ? 'break' : 'focus session'}!` });
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const handleModeChange = (m) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(m);
    setSeconds(DURATIONS[m]);
  };

  const toggle = () => {
    if (!running && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setRunning(r => !r);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(DURATIONS[mode]);
  };

  const pct = ((DURATIONS[mode] - seconds) / DURATIONS[mode]) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const size = 180;
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const colors = { work: '#4f8ef7', short: '#10b981', long: '#8b5cf6' };
  const color = colors[mode];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '24px', textAlign: 'center', maxWidth: '280px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px' }}>Pomodoro Timer</h3>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: '20px' }}>
        {Object.entries(MODES).map(([key, label]) => (
          <button key={key} onClick={() => handleModeChange(key)} style={{ flex: 1, padding: '5px', borderRadius: 'var(--radius-sm)', background: mode === key ? 'var(--bg-card)' : 'none', color: mode === key ? color : 'var(--text-muted)', fontSize: '11px', fontWeight: '500', border: 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {/* SVG Circle */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 6px ${color}60)` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '32px', fontWeight: '500', color: 'var(--text-primary)' }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{MODES[mode]}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
        <button onClick={reset} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: '16px', cursor: 'pointer' }}>↺</button>
        <button onClick={toggle} style={{ background: color, border: 'none', color: '#fff', padding: '10px 28px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: `0 0 20px ${color}40` }}>
          {running ? '⏸' : '▶'}
        </button>
      </div>

      {/* Sessions */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < sessions % 4 ? color : 'var(--bg-elevated)' }} />
        ))}
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>{sessions} sessions today</p>
    </div>
  );
};

export default PomodoroTimer;
