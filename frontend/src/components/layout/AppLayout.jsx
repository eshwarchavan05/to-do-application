import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
    <Sidebar />
    <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', maxHeight: '100vh' }}>
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
