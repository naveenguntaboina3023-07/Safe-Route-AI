import React, { useEffect, useState, useCallback } from 'react';
import { ClipboardList, CheckCircle, XCircle, Trash2, Eye, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import { ConfirmModal } from '../../components/Modal.jsx';
import { formatDateTime, getStatusBadge, getSeverityBadge, getErrorMessage, truncate } from '../../utils/helpers.js';
import { InlineLoader } from '../../components/Loader.jsx';

const STATUS_OPTS   = ['', 'Pending', 'Approved', 'Rejected'];
const CATEGORY_OPTS = ['', 'Poor Lighting', 'Isolated Area', 'Security Issue', 'Road/Path Problem', 'Other'];
const SEVERITY_OPTS = ['', 'Low', 'Medium', 'High'];

export default function AdminReports() {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [filters, setFilters]     = useState({ status: '', category: '', severity: '' });
  const [viewReport, setView]     = useState(null);
  const [confirmAction, setConfirm] = useState(null); // { type, id, label }
  const [actionLoading, setActLoad] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filters.status)   params.append('status',   filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.severity) params.append('severity', filters.severity);
      const res = await api.get(`/admin/reports?${params}`);
      setReports(res.data.data.reports);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load reports.'); }
    finally  { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActLoad(true);
    try {
      const { type, id } = confirmAction;
      if (type === 'approve') await api.put(`/admin/reports/${id}/approve`);
      else if (type === 'reject') await api.put(`/admin/reports/${id}/reject`);
      else if (type === 'delete') await api.delete(`/admin/reports/${id}`);
      toast.success(`Report ${type}d successfully.`);
      setConfirm(null);
      fetchReports();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActLoad(false); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total report{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchReports} className="btn-secondary text-sm py-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'status',   label: 'Status',   opts: STATUS_OPTS   },
            { key: 'category', label: 'Category', opts: CATEGORY_OPTS },
            { key: 'severity', label: 'Severity', opts: SEVERITY_OPTS },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <select className="input-field text-sm py-2"
                value={filters[key]}
                onChange={(e) => { setFilters((f) => ({ ...f, [key]: e.target.value })); setPage(1); }}>
                {opts.map((o) => <option key={o} value={o}>{o || `All ${label}s`}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? <Loader text="Loading reports…" /> : reports.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No reports found" description="Try adjusting your filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  {['#', 'User', 'Location', 'Category', 'Severity', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((r, i) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * 15 + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{r.userId?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px]">
                      <span title={r.location}>{truncate(r.location, 25)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.category}</td>
                    <td className="px-4 py-3"><span className={getSeverityBadge(r.severity)}>{r.severity}</span></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3"><span className={getStatusBadge(r.status)}>{r.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="View"
                          onClick={() => setView(r)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        ><Eye size={14} /></button>

                        {r.status === 'Pending' && (
                          <>
                            <button
                              title="Approve"
                              onClick={() => setConfirm({ type: 'approve', id: r._id, label: 'approve this report' })}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                            ><CheckCircle size={14} /></button>
                            <button
                              title="Reject"
                              onClick={() => setConfirm({ type: 'reject', id: r._id, label: 'reject this report' })}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            ><XCircle size={14} /></button>
                          </>
                        )}

                        <button
                          title="Delete"
                          onClick={() => setConfirm({ type: 'delete', id: r._id, label: 'permanently delete this report' })}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        ><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary text-xs py-1.5 px-3">Previous</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-secondary text-xs py-1.5 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Report Modal */}
      <Modal open={!!viewReport} onClose={() => setView(null)} title="Report Details" size="md">
        {viewReport && (
          <div className="space-y-3 text-sm">
            {[
              ['Report ID',   viewReport._id],
              ['Submitted by',viewReport.userId?.name || '—'],
              ['Email',       viewReport.userId?.email || '—'],
              ['Location',    viewReport.location],
              ['Lat / Lng',   `${viewReport.latitude}, ${viewReport.longitude}`],
              ['Category',    viewReport.category],
              ['Severity',    viewReport.severity],
              ['Status',      viewReport.status],
              ['Submitted',   formatDateTime(viewReport.createdAt)],
              ['Reviewed at', viewReport.reviewedAt ? formatDateTime(viewReport.reviewedAt) : 'Not reviewed yet'],
              ['Description', viewReport.description],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="text-gray-500 w-28 flex-shrink-0 text-xs pt-0.5">{label}:</span>
                <span className="text-gray-900 flex-1 text-xs break-all">{value}</span>
              </div>
            ))}
            {viewReport.image && (
              <div>
                <p className="text-gray-500 text-xs mb-2">Attached image:</p>
                <img src={viewReport.image} alt="report" className="w-full max-h-64 object-cover rounded-xl" />
              </div>
            )}

            {/* Quick actions inside modal */}
            {viewReport.status === 'Pending' && (
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setView(null); setConfirm({ type: 'approve', id: viewReport._id, label: 'approve this report' }); }}
                  className="btn-primary text-sm flex-1"
                ><CheckCircle size={14} /> Approve</button>
                <button
                  onClick={() => { setView(null); setConfirm({ type: 'reject', id: viewReport._id, label: 'reject this report' }); }}
                  className="btn-secondary text-sm flex-1"
                ><XCircle size={14} /> Reject</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm action modal */}
      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title={`Confirm action`}
        message={`Are you sure you want to ${confirmAction?.label}? ${confirmAction?.type === 'delete' ? 'This cannot be undone.' : 'Only approved reports influence safety scores.'}`}
        confirmText={confirmAction?.type === 'approve' ? 'Approve' : confirmAction?.type === 'reject' ? 'Reject' : 'Delete'}
        danger={confirmAction?.type === 'delete' || confirmAction?.type === 'reject'}
        loading={actionLoading}
      />
    </div>
  );
}
