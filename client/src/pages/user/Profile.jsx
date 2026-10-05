import React, { useState } from 'react';
import { User, Mail, Hash, Shield, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import { getErrorMessage, formatDate } from '../../utils/helpers.js';
import { InlineLoader } from '../../components/Loader.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: user?.name || '', studentId: user?.studentId || '' });
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', studentId: user?.studentId || '' });
    setErrors({});
    setEditing(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information.</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <User size={28} className="text-primary-700" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user?.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'
          }`}>
            <Shield size={10} className="mr-1" />
            {user?.role === 'admin' ? 'Administrator' : 'Student'}
          </span>
        </div>
      </div>

      {/* Profile details / edit form */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Account details</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-1.5">
              <Edit3 size={14} /> Edit
            </button>
          ) : (
            <button onClick={handleCancel} className="btn-secondary text-sm py-1.5">
              <X size={14} /> Cancel
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Student / College ID</label>
              <input
                type="text"
                className="input-field"
                placeholder="Optional"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <InlineLoader /> : <><Save size={15} /> Save changes</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {[
              { icon: User,   label: 'Full name',          value: user?.name        },
              { icon: Mail,   label: 'Email address',       value: user?.email       },
              { icon: Hash,   label: 'Student / College ID',value: user?.studentId || '—' },
              { icon: Shield, label: 'Account role',        value: user?.role === 'admin' ? 'Administrator' : 'Student' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 py-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member since</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account notice */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>Privacy note:</strong> Your data is used only within SafeRoute AI and is not shared with third parties.
          Passwords are always stored encrypted and never returned in plain text.
        </p>
      </div>
    </div>
  );
}
