import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, MapPin, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin/dashboard',        icon: LayoutDashboard, label: 'Dashboard'         },
  { to: '/admin/reports',          icon: ClipboardList,   label: 'Reports'           },
  { to: '/admin/safety-locations', icon: MapPin,          label: 'Safety Locations'  },
];

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/admin/login');
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-gray-950 text-white
          flex flex-col transform transition-transform duration-200
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">SafeRoute AI</p>
            <p className="text-xs text-red-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
                ${isActive ? 'bg-red-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-gray-800 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
