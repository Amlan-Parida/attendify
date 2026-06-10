import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, AlertOctagon, Save, Key, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/update-profile', { name });
      updateUser({ name: data.name });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action is irreversible and all your data will be permanently deleted.')) {
      return;
    }
    
    setLoading(true);
    try {
      await api.delete('/auth/delete-account');
      toast.success('Account deleted successfully');
      logout();
      navigate('/signup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-glow-sm">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-slate-500 font-bold">Manage your account preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-glow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-5 h-5" /> Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-glow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-5 h-5" /> Security
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
              activeTab === 'danger'
                ? 'bg-red-600 text-white shadow-glow-sm shadow-red-500/30'
                : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
            }`}
          >
            <AlertOctagon className="w-5 h-5" /> Danger Zone
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <div className="glass-card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
            {activeTab === 'profile' && (
              <div className="animate-slide-up">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Profile Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="premium-input w-full"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="premium-input w-full opacity-60 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">Email address cannot be changed.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-slide-up">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Security Settings</h2>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="premium-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="premium-input w-full"
                      minLength={6}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50"
                  >
                    <Key className="w-4 h-4" /> Update Password
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="animate-slide-up">
                <h2 className="text-xl font-black text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5" /> Danger Zone
                </h2>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6">
                  Permanently delete your account and all associated data. This action cannot be reversed.
                </p>
                <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
                  <h3 className="font-black text-slate-900 dark:text-white mb-2">Delete Account</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm transition-all shadow-glow-sm shadow-red-500/30 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
