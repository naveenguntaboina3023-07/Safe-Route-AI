import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileWarning, MapPin, AlertTriangle, CheckCircle, Upload, X } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers.js';
import { InlineLoader } from '../../components/Loader.jsx';

const CATEGORIES = ['Poor Lighting', 'Isolated Area', 'Security Issue', 'Road/Path Problem', 'Other'];
const SEVERITIES  = ['Low', 'Medium', 'High'];

const CAMPUS_COORDS = {
  'Main Gate':     [28.6200, 77.2100],
  'Library':       [28.6215, 77.2120],
  'CSE Block':     [28.6225, 77.2140],
  'Hostel':        [28.6240, 77.2160],
  'Cafeteria':     [28.6210, 77.2155],
  'Parking Area':  [28.6195, 77.2170],
  'Sports Ground': [28.6255, 77.2130],
  'Bus Stop':      [28.6185, 77.2095],
  'Back Gate':     [28.6260, 77.2175],
  'Hostel Road':   [28.6248, 77.2165],
};

export default function ReportLocation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: '', latitude: '', longitude: '',
    category: CATEGORIES[0], description: '',
    severity: SEVERITIES[0], incidentDate: new Date().toISOString().slice(0, 16),
  });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleLocationChange = (loc) => {
    const coords = CAMPUS_COORDS[loc];
    setForm({
      ...form,
      location: loc,
      latitude:  coords ? coords[0] : form.latitude,
      longitude: coords ? coords[1] : form.longitude,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.location.trim())           e.location    = 'Location name is required.';
    if (!form.latitude)                   e.latitude    = 'Latitude is required.';
    if (!form.longitude)                  e.longitude   = 'Longitude is required.';
    if (!form.description.trim() || form.description.trim().length < 10)
                                          e.description = 'Description must be at least 10 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);

      await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
      toast.success('Report submitted successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center text-center pt-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Report submitted!</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Your report is pending admin review. Once approved, it will contribute to campus safety scoring.
        </p>
        <div className="flex gap-3">
          <Link to="/my-reports" className="btn-primary">View my reports</Link>
          <button onClick={() => { setSubmitted(false); setForm({ location: '', latitude: '', longitude: '', category: CATEGORIES[0], description: '', severity: SEVERITIES[0], incidentDate: new Date().toISOString().slice(0, 16) }); setImage(null); setPreview(null); }}
            className="btn-secondary">Submit another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <FileWarning size={16} className="text-amber-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Report Unsafe Location</h1>
        </div>
        <p className="text-sm text-gray-500 ml-10">Help keep campus safe. Admin reviews all reports before they affect safety scores.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Location name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <MapPin size={13} className="inline mr-1 text-red-500" /> Location name *
          </label>
          <input
            list="campus-locs"
            className={`input-field ${errors.location ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="e.g. Parking Area, Back Gate…"
            value={form.location}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
          <datalist id="campus-locs">
            {Object.keys(CAMPUS_COORDS).map((n) => <option key={n} value={n} />)}
          </datalist>
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>

        {/* Lat / Lng */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude *</label>
            <input type="number" step="any" className={`input-field ${errors.latitude ? 'border-red-400' : ''}`}
              placeholder="e.g. 28.6215" value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude *</label>
            <input type="number" step="any" className={`input-field ${errors.longitude ? 'border-red-400' : ''}`}
              placeholder="e.g. 77.2130" value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-3">Coordinates auto-filled when you select a known campus location.</p>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
          <select className="input-field" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
          <div className="flex gap-3">
            {SEVERITIES.map((s) => (
              <label key={s} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                form.severity === s
                  ? s === 'High' ? 'bg-red-50 border-red-400 text-red-700'
                  : s === 'Medium' ? 'bg-amber-50 border-amber-400 text-amber-700'
                  : 'bg-green-50 border-green-400 text-green-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              }`}>
                <input type="radio" name="severity" value={s} checked={form.severity === s}
                  onChange={() => setForm({ ...form, severity: s })} className="sr-only" />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description * (min 10 chars)</label>
          <textarea
            rows={4}
            className={`input-field resize-none ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Describe the safety issue in detail…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Date/Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Incident date & time</label>
          <input type="datetime-local" className="input-field" value={form.incidentDate}
            onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Upload size={13} className="inline mr-1" /> Photo (optional, max 5MB)
          </label>
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />
              <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
              <Upload size={20} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Click to upload image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          )}
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <InlineLoader /> : <><FileWarning size={17} /> Submit report</>}
        </button>
      </form>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
        <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Reports are reviewed by administrators before affecting safety scores. Only approved reports influence route calculations.
        </p>
      </div>
    </div>
  );
}
