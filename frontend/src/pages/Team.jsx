import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useProjects } from '../context/ProjectContext';
import { timeAgo, getInitials } from '../utils/helpers';
import Topbar from '../components/layout/Topbar';

const Team = () => {
  const { projects, currentProject } = useProjects();
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const project = selectedProject || currentProject || projects[0];

  useEffect(() => {
    if (project) setMembers(project.members || []);
  }, [project]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!project) return toast.error('Select a project first');
    setInviting(true);
    try {
      const { data } = await api.post(`/projects/${project._id}/invite`, { email: inviteEmail, role: inviteRole });
      setMembers(data.project.members);
      setInviteEmail('');
      toast.success('Member invited!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to invite'); }
    finally { setInviting(false); }
  };

  return (
    <div>
      <Topbar title="Team" />
      <div style={{ padding: '24px', maxWidth: '900px' }}>
        {/* Project selector */}
        {projects.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {projects.map(p => (
                <button key={p._id} onClick={() => setSelectedProject(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', background: (selectedProject || project)?._id === p._id ? 'rgba(91,110,245,0.2)' : 'var(--bg-surface)', border: `1px solid ${(selectedProject || project)?._id === p._id ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />{p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Invite form */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Invite Member</h3>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px' }}>
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="teammate@company.com" required style={{ flex: 1 }} />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', width: 'auto' }}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <button type="submit" disabled={inviting} className="btn btn-primary">{inviting ? 'Inviting...' : 'Send Invite'}</button>
          </form>
        </div>

        {/* Members list */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-display)' }}>{members.length} Members</span>
          </div>
          {members.map((m, i) => (
            <div key={m._id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `hsl(${(m.user?.name?.charCodeAt(0) || 65) * 5}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                {getInitials(m.user?.name || 'U')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{m.user?.name || 'Unknown'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.user?.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {m.user?.isOnline && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />}
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                  background: m.role === 'admin' ? 'rgba(91,110,245,0.2)' : 'rgba(255,255,255,0.05)',
                  color: m.role === 'admin' ? 'var(--accent)' : 'var(--text-muted)',
                }}>{m.role}</span>
              </div>
            </div>
          ))}
          {members.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No members yet</div>}
        </div>
      </div>
    </div>
  );
};

export default Team;