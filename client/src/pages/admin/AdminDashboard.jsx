import React, { useEffect, useState } from 'react';
import { Users, ClipboardList, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import Loader from '../../components/Loader.jsx';
import { formatDateTime, getStatusBadge, getSeverityBadge, truncate } from '../../utils/helpers.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#16a34a', '#dc2626', '#d97706', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading dashboard…" />;

  const statusChartData = stats ? [
    { name: 'Pending',  value: stats.pendingReports  },
    { name: 'Approved', value: stats.approvedReports },
    { name: 'Rejected', value: stats.rejectedReports },
  ] : [];

  const categoryData = (stats?.categoryStats || []).map((c) => ({
    name: c._id || 'Other',
    count: c.count,
  }));

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of reports, users, and campus safety data.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users}         label="Total Users"       value={stats?.totalUsers        ?? 0} color="primary" />
        <StatCard icon={ClipboardList} label="Total Reports"     value={stats?.totalReports      ?? 0} color="blue"    />
        <StatCard icon={Clock}         label="Pending"           value={stats?.pendingReports    ?? 0} color="amber"   />
        <StatCard icon={CheckCircle}   label="Approved"          value={stats?.approvedReports   ?? 0} color="green"   />
        <StatCard icon={XCircle}       label="Rejected"          value={stats?.rejectedReports   ?? 0} color="red"     />
        <StatCard icon={AlertTriangle} label="Higher-Risk Locs"  value={stats?.higherRiskLocations ?? 0} color="red"   />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reports by status — pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-600" /> Reports by status
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusChartData.map((_, i) => (
                  <Cell key={i} fill={['#d97706', '#16a34a', '#dc2626'][i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Reports by category — bar */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-600" /> Reports by category
          </h2>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent reports table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent reports</h2>
          <a href="/admin/reports" className="text-xs text-primary-600 hover:underline">View all →</a>
        </div>
        {!stats?.recentReports?.length ? (
          <p className="text-sm text-gray-400 p-6 text-center">No reports yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  {['User', 'Location', 'Category', 'Severity', 'Date', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentReports.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">{r.userId?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{r.location}</td>
                    <td className="px-4 py-3 text-gray-600">{r.category}</td>
                    <td className="px-4 py-3"><span className={getSeverityBadge(r.severity)}>{r.severity}</span></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3"><span className={getStatusBadge(r.status)}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
