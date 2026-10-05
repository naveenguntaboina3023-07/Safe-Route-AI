import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, FileWarning, ClipboardList, User, Clock, Shield, AlertTriangle, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, getStatusBadge, getSeverityBadge, truncate } from '../../utils/helpers.js';

const quickActions = [
  { to: '/find-route',  icon: Map,         label: 'Find Safe Route',        color: 'bg-primary-600', desc: 'Compare routes with safety scores' },
  { to: '/report',      icon: FileWarning, label: 'Report Unsafe Location', color: 'bg-amber-500',   desc: 'Flag a hazard for admin review'    },
  { to: '/my-reports',  icon: ClipboardList,label: 'My Reports',            color: 'bg-green-600',   desc: 'Track your submitted reports'      },
  { to: '/profile',     icon: User,         label: 'Profile',               color: 'bg-purple-600',  desc: 'Manage your account'               },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/my').then((r) => setMyReports(r.data.data.reports.slice(0, 5))).catch(() => {}),
      api.get('/routes/history').then((r) => setHistory(r.data.data.searches.slice(0, 5))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const pending  = myReports.filter((r) => r.status === 'Pending').length;
  const approved = myReports.filter((r) => r.status === 'Approved').length;

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm mb-1">Welcome back 👋</p>
        <h1 className="text-2xl font-bold">{user?.name}</h1>
        <p className="text-blue-200 text-sm mt-1">
          {user?.studentId ? `ID: ${user.studentId} · ` : ''}Stay safe on campus.
        </p>
      </div>

      {/* Stats row */}
      {loading ? <Loader text="Loading your data…" /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ClipboardList} label="My Reports"      value={myReports.length} color="primary" />
          <StatCard icon={Clock}         label="Pending"          value={pending}          color="amber"   />
          <StatCard icon={Shield}        label="Approved"         value={approved}         color="green"   />
          <StatCard icon={Navigation}    label="Route Searches"   value={history.length}   color="blue"    />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ to, icon: Icon, label, color, desc }) => (
            <Link key={to} to={to}
              className="card p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent route searches */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Recent route searches</h2>
            <Link to="/find-route" className="text-xs text-primary-600 hover:underline">New search</Link>
          </div>
          {history.length === 0 ? (
            <EmptyState icon={Navigation} title="No searches yet"
              description="Find a safe route to get started."
              action={<Link to="/find-route" className="btn-primary text-sm">Find route</Link>} />
          ) : (
            <ul className="divide-y divide-gray-50">
              {history.map((s) => (
                <li key={s._id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {s.startLocation} → {s.destination}
                    </p>
                    <p className="text-xs text-gray-500">{s.travelTime} · {formatDate(s.createdAt)}</p>
                  </div>
                  {s.safetyScore != null && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      s.safetyScore >= 80 ? 'bg-green-100 text-green-700' :
                      s.safetyScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{s.safetyScore}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent my reports */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">My recent reports</h2>
            <Link to="/my-reports" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {myReports.length === 0 ? (
            <EmptyState icon={FileWarning} title="No reports yet"
              description="Report an unsafe location on campus."
              action={<Link to="/report" className="btn-primary text-sm">Report location</Link>} />
          ) : (
            <ul className="divide-y divide-gray-50">
              {myReports.map((r) => (
                <li key={r._id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{truncate(r.location, 30)}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-500">{r.category}</span>
                      <span className={getSeverityBadge(r.severity)}>{r.severity}</span>
                    </div>
                  </div>
                  <span className={`${getStatusBadge(r.status)} flex-shrink-0`}>{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> Safety scores displayed are estimates based on available campus data
          and are not guarantees of real-world safety. This system is an academic prototype and not an
          emergency or security service.
        </p>
      </div>
    </div>
  );
}
