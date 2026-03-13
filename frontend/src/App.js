import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Layout from './components/layout/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import MyTasks from './pages/MyTasks';
import CalendarPage from './pages/CalendarPage';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import './styles/globals.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '18px', fontFamily: 'var(--font-display)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <div>Loading TaskMaster Pro...</div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const ProjectLayout = () => (
  <ProjectProvider>
    <Layout />
  </ProjectProvider>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="board" element={<Board />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="team" element={<Team />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="activity" element={<Activity />} />
            <Route path="settings" element={<Settings />} />
            <Route path="projects/:id" element={<Board />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;