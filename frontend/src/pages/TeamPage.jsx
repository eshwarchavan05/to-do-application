import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Button, Avatar, Card, Input, Spinner } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TeamPage = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject, updateProject, deleteProject } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', color: '', icon: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) selectProject(projectId);
  }, [projectId]);

  useEffect(() => {
    if (currentProject) setProjectForm({ name: currentProject.name, description: currentProject.description, color: currentProject.color, icon: currentProject.icon });
  }, [currentProject]);

  const handleInvite = async () => {
    if (!inviteEmail) return toast.error('Email required');
    setInviting(true);
    try {
      await api.post(`/projects/${projectId}/invite`, { email: inviteEmail, role: inviteRole });
      toast.success('Invitation sent!');
      setInviteEmail('');
      selectProject(projectId);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setInviting(false); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
      toast.success('Member removed');
      selectProject(projectId);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSaveProject = async () => {
    setSaving(true);
    try { await updateProject(projectId, projectForm); }
    finally { setSaving(false); }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${currentProject.name}"? All tasks will be permanently deleted.`)) return;
    await deleteProject(projectId);
    navigate('/dashboard');
  };

  const isOwner = currentProject?.owner?._id === user?._id;

  const ICONS = ['📋', '🚀', '💡', '🎯', '⚡', '🔥', '🌟', '🛠', '🎨', '📊', '🔬', '🏗'];
  const COLORS = ['#4f8ef7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];

  if (!currentProject) return <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><Spinner size={36} /></div>;

  return (
    <div style={{ padding: '28px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '28px' }}>{currentProject.icon}</span>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{currentProject.name}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Project Settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: '24px', width: 'fit-content' }}>
        {['members', 'settings'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: 'var(--radius-sm)', background: tab === t ? 'var(--bg-card)' : 'none', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Invite form */}
          {isOwner && (
            <Card>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Invite Team Member</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address" style={{ flex: 1, padding: '9px 12px' }} onKeyDown={e => e.key === 'Enter' && handleInvite()} />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ padding: '9px 12px', minWidth: '100px' }}>
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <Button onClick={handleInvite} loading={inviting}>Invite</Button>
              </div>
            </Card>
          )}

          {/* Members list */}
          <Card>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>{currentProject.members?.length || 0} Members</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Owner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <Avatar user={currentProject.owner} size={36} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{currentProject.owner?.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentProject.owner?.email}</p>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(79,142,247,0.15)', color: 'var(--accent)', padding: '3px 8px', borderRadius: '20px', fontWeight: '600' }}>Owner</span>
              </div>
              {currentProject.members?.filter(m => m.user?._id !== currentProject.owner?._id).map(member => (
                <div key={member.user?._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <Avatar user={member.user} size={36} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{member.user?.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.user?.email}</p>
                  </div>
                  <span style={{ fontSize: '11px', background: 'var(--bg-card)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '20px', textTransform: 'capitalize' }}>{member.role}</span>
                  {isOwner && <button onClick={() => handleRemoveMember(member.user?._id)} style={{ background: 'none', color: 'var(--danger)', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>✕</button>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Project Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Project Name" value={projectForm.name} onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))} />
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea value={projectForm.description} onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '9px 12px', resize: 'vertical' }} placeholder="Describe the project..." />
              </div>

              {/* Icon picker */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Icon</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setProjectForm(f => ({ ...f, icon }))} style={{ fontSize: '22px', width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: projectForm.icon === icon ? 'var(--accent-dim)' : 'var(--bg-elevated)', border: `1px solid ${projectForm.icon === icon ? 'var(--accent)' : 'transparent'}`, cursor: 'pointer' }}>{icon}</button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {COLORS.map(color => (
                    <button key={color} onClick={() => setProjectForm(f => ({ ...f, color }))} style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, border: `2px solid ${projectForm.color === color ? '#fff' : 'transparent'}`, cursor: 'pointer' }} />
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveProject} loading={saving}>Save Changes</Button>
            </div>
          </Card>

          {isOwner && (
            <Card style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--danger)', marginBottom: '8px' }}>Danger Zone</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Permanently delete this project and all its tasks. This cannot be undone.</p>
              <Button variant="danger" onClick={handleDeleteProject}>Delete Project</Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
