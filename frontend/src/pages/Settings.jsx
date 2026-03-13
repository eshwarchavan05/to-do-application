import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/layout/Topbar';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const Section = ({ title, children }) => (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div>
      <Topbar title="Settings" />
      <div style={{ padding: '24px', maxWidth: '600px' }}>
        <Section title="Profile">
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Display Name</label>
              <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={3} placeholder="Tell your team about yourself..." style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#fff' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Avatar auto-generated from your name</div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </form>
        </Section>

        <Section title="Change Password">
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {['currentPassword', 'newPassword', 'confirm'].map(field => (
              <div key={field}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                </label>
                <input type="password" value={passwords[field]} onChange={e => setPasswords({...passwords, [field]: e.target.value})} required minLength={field !== 'currentPassword' ? 6 : 1} />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>{saving ? 'Changing...' : 'Change Password'}</button>
          </form>
        </Section>

        <Section title="Account Info">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[['Email', user?.email], ['Member since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'], ['Role', user?.role]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{val}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Settings;