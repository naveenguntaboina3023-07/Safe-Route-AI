import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Trash2, Eye, AlertTriangle } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import { ConfirmModal } from '../../components/Modal.jsx';
import { formatDateTime, getStatusBadge, getSeverityBadge, getErrorMessage, truncate } from '../../utils/helpers.js';

export default function MyReports() {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [viewReport, setView]   = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = useCallback(() => {
    setLoading(true);
    api.get('/reports/my')
      .then((r) => setReports(r.data.data.reports))
      .catch(() => toast.error('Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/reports/${deleteId}`);
      toast.success('Report deleted.');
      setDeleteId(null);
      fetchReports();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const pending  = reports.filter((r) => r.status === 'Pending').length;
  const approved = reports.filter((r) => r.status === 'Approved').length;
  const rejected = reports.filter((r) => r.status === 'Rejected').length;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track the status of your submitted safety reports.</p>
        </div>
        <Link to="/report" className="btn-primary text-sm">
          <Plus size={15} /> New report
        </Link>
      </div>

      {/* Status counts */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending',  count: pending,  color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
            { label: 'Approved', count: approved, color: 'bg-green-50  border-green-200  text-green-800'  },
            { label: 'Rejected', count: rejected, color: 'bg-red-50    border-red-200    text-red-800'    },
          ].map(({ label, count, color }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 text-center ${color}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? <Loader text="Loading your reports…" /> : reports.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No reports yet"
          description="Report an unsafe campus location and track its review status here."
          action={<Link to="/report" className="btn-primary text-sm"><Plus size={14} /> Report location</Link>}
        />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="card p-4 flex items-start gap-4">
              {/* Status indicator */}
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                r.status === 'Approved' ? 'bg-green-500' :
                r.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{r.location}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.category} · {formatDateTime(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <span className={getSeverityBadge(r.severity)}>{r.severity}</span>
                    <span className={getStatusBadge(r.status)}>{r.status}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{truncate(r.description, 100)}</p>

                {r.status === 'Pending' && (
                  <p className="text-xs text-yellow-700 mt-1.5 bg-yellow-50 rounded px-2 py-1 inline-block">
                    ⏳ Awaiting admin review
                  </p>
                )}
                {r.status === 'Approved' && (
                  <p className="text-xs text-green-700 mt-1.5 bg-green-50 rounded px-2 py-1 inline-block">
                    ✅ Approved — contributing to safety scores
                  </p>
                )}
                {r.status === 'Rejected' && (
                  <p className="text-xs text-red-700 mt-1.5 bg-red-50 rounded px-2 py-1 inline-block">
                    ❌ Rejected by admin
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <button onClick={() => setView(r)}
                    className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors">
                    <Eye size={13} /> View
                  </button>
                  {r.status === 'Pending' && (
                    <button onClick={() => setDeleteId(r._id)}
                      className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Image thumbnail */}
              {r.image && (
                <img src={r.image} alt="report" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* View report modal */}
      <Modal open={!!viewReport} onClose={() => setView(null)} title="Report Details" size="md">
        {viewReport && (
          <div className="space-y-3 text-sm">
            {[
              ['Location',    viewReport.location],
              ['Category',    viewReport.category],
              ['Severity',    viewReport.severity],
              ['Status',      viewReport.status],
              ['Description', viewReport.description],
              ['Submitted',   formatDateTime(viewReport.createdAt)],
              ['Reviewed',    viewReport.reviewedAt ? formatDateTime(viewReport.reviewedAt) : 'Not reviewed yet'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="text-gray-500 w-28 flex-shrink-0">{label}:</span>
                <span className="text-gray-900 flex-1">{value}</span>
              </div>
            ))}
            {viewReport.image && (
              <div>
                <p className="text-gray-500 mb-2">Image:</p>
                <img src={viewReport.image} alt="report" className="w-full max-h-64 object-cover rounded-xl" />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete report"
        message="Are you sure you want to delete this pending report? This cannot be undone."
        confirmText="Delete"
        danger
        loading={deleting}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
        <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Only admin-approved reports influence campus safety scores.
        </p>
      </div>
    </div>
  );
}
