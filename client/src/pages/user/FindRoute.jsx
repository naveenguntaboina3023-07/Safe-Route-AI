import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Navigation, Clock, Search, AlertTriangle, ChevronRight } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers.js';
import { InlineLoader } from '../../components/Loader.jsx';

const TRAVEL_TIMES = ['Morning (6am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)', 'Night (8pm–12am)'];

export default function FindRoute() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [form, setForm]           = useState({ startLocation: '', destination: '', travelTime: TRAVEL_TIMES[0] });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    api.get('/routes/locations')
      .then((r) => setLocations(r.data.data.locations))
      .catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.startLocation) e.startLocation = 'Select or enter a start location.';
    if (!form.destination)   e.destination   = 'Select or enter a destination.';
    if (form.startLocation && form.destination &&
        form.startLocation.toLowerCase() === form.destination.toLowerCase())
      e.destination = 'Start and destination cannot be the same.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/routes/search', form);
      // Store results in sessionStorage so RouteResults can read them
      sessionStorage.setItem('routeResults', JSON.stringify({ ...res.data.data, query: form }));
      navigate('/route-results');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const locationNames = locations.map((l) => l.name);

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Map size={16} className="text-primary-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Find Safe Route</h1>
        </div>
        <p className="text-sm text-gray-500 ml-10">
          Compare campus routes by safety score, lighting, and security coverage.
        </p>
      </div>

      <form onSubmit={handleSearch} className="card p-6 space-y-5">
        {/* Start location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Navigation size={13} className="inline mr-1 text-primary-500" />
            Start location
          </label>
          <input
            list="start-list"
            className={`input-field ${errors.startLocation ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="e.g. Hostel, Main Gate…"
            value={form.startLocation}
            onChange={(e) => setForm({ ...form, startLocation: e.target.value })}
          />
          <datalist id="start-list">
            {locationNames.map((n) => <option key={n} value={n} />)}
          </datalist>
          {errors.startLocation && <p className="text-xs text-red-500 mt-1">{errors.startLocation}</p>}
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Navigation size={13} className="inline mr-1 text-green-500 rotate-180" />
            Destination
          </label>
          <input
            list="dest-list"
            className={`input-field ${errors.destination ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="e.g. Library, CSE Block…"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
          <datalist id="dest-list">
            {locationNames.map((n) => <option key={n} value={n} />)}
          </datalist>
          {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
        </div>

        {/* Travel time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Clock size={13} className="inline mr-1 text-primary-500" />
            Preferred travel time
          </label>
          <select
            className="input-field"
            value={form.travelTime}
            onChange={(e) => setForm({ ...form, travelTime: e.target.value })}
          >
            {TRAVEL_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading
            ? <><InlineLoader /> Searching routes…</>
            : <><Search size={17} /> Find safe routes</>}
        </button>
      </form>

      {/* Campus locations grid */}
      {locations.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Available campus locations</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {locations.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => {
                  if (!form.startLocation) setForm({ ...form, startLocation: loc.name });
                  else if (!form.destination && loc.name !== form.startLocation)
                    setForm({ ...form, destination: loc.name });
                }}
                className="text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all group"
              >
                <p className="text-xs font-medium text-gray-900 group-hover:text-primary-700">{loc.name}</p>
                <p className={`text-xs mt-0.5 ${
                  loc.lighting === 'Good' ? 'text-green-600' :
                  loc.lighting === 'Moderate' ? 'text-amber-600' : 'text-red-500'
                }`}>Lighting: {loc.lighting}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Click a location to auto-fill start or destination.</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Safety scores are estimates based on available data. They are not guarantees of real-world safety.
        </p>
      </div>
    </div>
  );
}
