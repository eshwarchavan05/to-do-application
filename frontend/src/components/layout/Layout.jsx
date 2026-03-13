import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ProjectModal from '../modals/ProjectModal';
import { useProjects } from '../../context/ProjectContext';

const Layout = () => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const { createProject } = useProjects();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar onNewProject={() => setShowProjectModal(true)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
      {showProjectModal && (
        <ProjectModal
          onSave={createProject}
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </div>
  );
};

export default Layout;
