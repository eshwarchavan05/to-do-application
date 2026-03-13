import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
      return data.projects;
    } catch (err) {
      toast.error('Failed to load projects');
    } finally { setLoading(false); }
  }, []);

  const createProject = useCallback(async (projectData) => {
    const { data } = await api.post('/projects', projectData);
    setProjects(prev => [data.project, ...prev]);
    toast.success('Project created!');
    return data.project;
  }, []);

  const updateProject = useCallback(async (id, updates) => {
    const { data } = await api.put(`/projects/${id}`, updates);
    setProjects(prev => prev.map(p => p._id === id ? data.project : p));
    if (currentProject?._id === id) setCurrentProject(data.project);
    return data.project;
  }, [currentProject]);

  const deleteProject = useCallback(async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p._id !== id));
    if (currentProject?._id === id) setCurrentProject(null);
    toast.success('Project deleted');
  }, [currentProject]);

  return (
    <ProjectContext.Provider value={{
      projects, currentProject, loading,
      setCurrentProject, fetchProjects, createProject, updateProject, deleteProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
