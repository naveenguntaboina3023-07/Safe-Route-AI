import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers.js';
import { InlineLoader } from '../../components/Loader.jsx';

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPwd, setShow]  = useState(false);
  const [loading, setLoad]  = useState(false);
  const [errors, setErrors] = useState({});

  if (user?.role === 'admin') { navigate('/admin/dashboard', { replace: true }); return null; }

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required.';
    if (!form.password.trim()) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoad(true);
    try {
      const res = await api.post('/auth/login', form);
      const { user, token } = res.data.data;
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin account required.');
        return;
      }
      login(user, token);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <Shield size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-sm text-gray-500 mt-1">SafeRoute AI — Restricted Access</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <Lock size={14} className="text-red-600 flex-shrink-0" />
            <p className="text-xs text-red-800">This area is for authorized administrators only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin email</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="admin@college.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="Admin password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShow((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <InlineLoader /> : <><Lock size={16} /> Sign in as Admin</>}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Student?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">Sign in here</Link>
          </p>
        </div>

        {/* Seed hint */}
        <div className="mt-4 bg-white/10 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-300">
            <strong>Demo admin:</strong> Run the seed script or register with role:admin in MongoDB.
          </p>
        </div>
      </div>
    </div>
  );
}
