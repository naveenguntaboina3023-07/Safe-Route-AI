import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Plus, Edit3, Trash2, RefreshCw, Map } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import { ConfirmModal } from '../../components/Modal.jsx';
import CampusMap from '../../components/CampusMap.jsx';
import { getErrorMessage } from '../../utils/helpers.js';
import { InlineLoader } from '../../components/Loader.jsx';

const TYPES = ['CCTV', 'Security', 'Emergency Point', 'Lighting'];

const emptyForm = { name: '', type: TYPES[0], latitude: '', longitude: '', description: '' };

const TYPE_COLORS = {
  CCTV:             'bg-purple-100 text-purple-800',
  Security:         'bg-blue-100   text-blue-800',
  'Emergency Point':'bg-red-100    text-red-800',
  Lighting:         'bg-amber-100  text-amber-800',
};

export default function SafetyLocations() {
  const [points, setPoints]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [formOpen, setFormOpen]   = useState(false);
  const [editPoint, setEditPoint] = useState(null); // null = add mode
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [errors, setErrors]       = useState({});
  const [seeding, setSeeding]     = useState(false);

  const fetchPoints = useCallback(() => {
    setLoading(true);
    api.get('/safety-points')
      .then((r) => setPoints(r.data.data.points))
      .catch(() => toast.error('Failed to load safety points.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);

  const openAdd = () => { setEditPoint(null); setForm(emptyForm); setErrors({}); setFormOpen(true); };
  const openEdit = (p) => {
    setEditPoint(p);
    setForm({ name: p.name, type: p.type, latitude: p.latitude, longitude: p.longitude, description: p.description || '' });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name      = 'Name is required.';
    if (!form.type)          e.type      = 'Type is required.';
    if (!form.latitude)      e.latitude  = 'Latitude is required.';
    if (!form.longitude)     e.longitude = 'Longitude is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editPoint) {
        await api.put(`/safety-points/${editPoint._id}`, form);
        toast.success('Safety point updated.');
      } else {
        await api.post('/safety-points', form);
        toast.success('Safety point added.');
      }
      setFormOpen(false);
      fetchPoints();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/safety-points/${deleteId}`);
      toast.success('Safety point deleted.');
      setDeleteId(null);
      fetchPoints();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/safety-points/seed');
      toast.success(res.data.message);
      fetchPoints();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSeeding(false);
    }
  };

  const realPoints = points.filter((p) => !p.isSample);
  const mapPoints  = points.map((p) => ({ ...p, latitude: Number(p.latitude), longitude: Number(p.longitude) }));

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Safety Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage CCTV cameras, security posts, emergency points, and lighting installations.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSeed} disabled={seeding} className="btn-secondary text-sm py-2">
            {seeding ? <InlineLoader /> : <RefreshCw size={14} />} Seed sample data
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2">
            <Plus size={14} /> Add point
          </button>
        </div>
      </div>

      {/* Type summary pills */}
      {!loading && points.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const count = points.filter((p) => p.type === t).length;
            return (
              <span key={t} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${TYPE_COLORS[t]}`}>
                <MapPin size={11} /> {t}: {count}
              </span>
            );
          })}
        </div>
      )}

      {/* Map */}
      {!loading && points.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Map size={16} className="text-primary-600" /> Safety points on campus map
          </h2>
          <CampusMap safetyPoints={mapPoints} height="340px" zoom={16} />
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
            {[
              { color: '#7c3aed', label: 'CCTV (C)' },
              { color: '#0891b2', label: 'Security (G)' },
              { color: '#dc2626', label: 'Emergency (E)' },
              { color: '#d97706', label: 'Lighting (L)' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <Loader text="Loading safety points…" /> : points.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No safety points yet"
          description="Add CCTV cameras, security posts, emergency points, and lighting to the campus map."
          action={
            <div className="flex gap-2">
              <button onClick={handleSeed} className="btn-secondary text-sm">Seed sample data</button>
              <button onClick={openAdd}    className="btn-primary text-sm"><Plus size={13} /> Add point</button>
            </div>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">{points.length} safety point{points.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  {['Name', 'Type', 'Lat', 'Lng', 'Description', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {points.map((p) => (
                  <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${p.isSample ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.name}
                      {p.isSample && <span className="ml-1.5 text-xs text-gray-400">(sample)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[p.type]}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono">{Number(p.latitude).toFixed(4)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono">{Number(p.longitude).toFixed(4)}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{p.description || '—'}</td>
                    <td className="px-4 py-3">
                      {!p.isSample && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-700 transition-colors" title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => setDeleteId(p._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)}
        title={editPoint ? `Edit: ${editPoint.name}` : 'Add Safety Point'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
            <input type="text" className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              placeholder="e.g. Main Gate CCTV" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
            <select className="input-field" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude *</label>
              <input type="number" step="any" className={`input-field ${errors.latitude ? 'border-red-400' : ''}`}
                placeholder="28.6215" value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude *</label>
              <input type="number" step="any" className={`input-field ${errors.longitude ? 'border-red-400' : ''}`}
                placeholder="77.2130" value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea rows={2} className="input-field resize-none" placeholder="Optional description"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? <InlineLoader /> : editPoint ? 'Save changes' : 'Add point'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete safety point"
        message="Are you sure you want to delete this safety point? It will no longer appear on the map or contribute to route scoring."
        confirmText="Delete" danger loading={deleting}
      />
    </div>
  );
}
