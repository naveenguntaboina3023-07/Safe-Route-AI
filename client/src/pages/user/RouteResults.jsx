import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, AlertTriangle, ArrowLeft, Brain, RefreshCw } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import RouteCard from '../../components/RouteCard.jsx';
import CampusMap from '../../components/CampusMap.jsx';
import Loader from '../../components/Loader.jsx';
import { getErrorMessage } from '../../utils/helpers.js';
import { getMockAIAnalysis } from '../../services/aiService.js';

export default function RouteResults() {
  const navigate = useNavigate();
  const [data, setData]           = useState(null);
  const [aiResult, setAiResult]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('routeResults');
    if (!raw) { navigate('/find-route'); return; }
    const parsed = JSON.parse(raw);
    setData(parsed);
    if (parsed.routes?.length) setSelectedRoute(parsed.routes[0]);
  }, [navigate]);

  const runAI = async () => {
    if (!data?.routes) return;
    setAiLoading(true);
    try {
      // Try backend AI first, fall back to client mock
      let result;
      try {
        const res = await api.post('/routes/analyze', { routes: data.routes });
        result = res.data.data;
      } catch {
        result = await getMockAIAnalysis(data.routes);
      }
      setAiResult(result);

      // Highlight recommended route on map
      const recName = result.routes?.find((r) => r.recommendation)?.routeName;
      if (recName) {
        const match = data.routes.find((r) => r.name === recName);
        if (match) setSelectedRoute(match);
      }
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  if (!data) return <Loader text="Loading route results…" />;

  const { routes = [], startData, destData, approvedReportMarkers = [], safetyPointMarkers = [], query } = data;

  // Merge AI scores back into routes if available
  const displayRoutes = routes.map((r) => {
    const aiRoute = aiResult?.routes?.find((ar) => ar.routeName === r.name);
    return aiRoute ? { ...r, safetyScore: aiRoute.safetyScore, riskLevel: aiRoute.riskLevel, reasons: aiRoute.reasons } : r;
  });

  const recommendedName = aiResult?.routes?.find((r) => r.recommendation)?.routeName
    || displayRoutes.reduce((a, b) => (a.safetyScore >= b.safetyScore ? a : b), displayRoutes[0])?.name;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/find-route" className="btn-secondary text-sm py-2">
          <ArrowLeft size={15} /> Back
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Route Results</h1>
          {query && (
            <p className="text-sm text-gray-500">
              {query.startLocation} → {query.destination} · {query.travelTime}
            </p>
          )}
        </div>
      </div>

      {/* AI recommendation banner */}
      {aiResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
          <Star size={18} className="text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" />
          <div>
            <p className="text-sm font-semibold text-green-900">{aiResult.overallRecommendation}</p>
            <p className="text-xs text-green-700 mt-0.5">{aiResult.disclaimer}</p>
            {aiResult.source && (
              <p className="text-xs text-green-600 mt-0.5">Source: {aiResult.source}</p>
            )}
          </div>
        </div>
      )}

      {/* Main grid: map + cards */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Route cards */}
        <div className="space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{routes.length} routes found</p>
            <button
              onClick={runAI}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 disabled:opacity-50 transition-colors"
            >
              {aiLoading ? <><RefreshCw size={13} className="animate-spin" /> Analyzing…</> : <><Brain size={13} /> AI Analysis</>}
            </button>
          </div>

          {displayRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              recommended={route.name === recommendedName}
              selected={selectedRoute?.id === route.id}
              onSelect={(r) => {
                setSelectedRoute(r);
                sessionStorage.setItem('selectedRoute', JSON.stringify({ route: r, query, aiResult }));
                // Don't navigate yet — let user click "View details"
              }}
            />
          ))}

          {/* View details for selected */}
          {selectedRoute && (
            <button
              onClick={() => {
                sessionStorage.setItem('selectedRoute', JSON.stringify({
                  route: displayRoutes.find((r) => r.id === selectedRoute.id) || selectedRoute,
                  query,
                  aiResult,
                  allRoutes: displayRoutes,
                }));
                navigate(`/route-details/${selectedRoute.id}`);
              }}
              className="btn-primary w-full text-sm"
            >
              View details for {selectedRoute.name}
            </button>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <CampusMap
            center={startData ? [startData.lat, startData.lng] : [28.6215, 77.213]}
            routes={displayRoutes}
            selectedRouteId={selectedRoute?.id}
            startMarker={startData ? { lat: startData.lat, lng: startData.lng, name: query?.startLocation } : null}
            destMarker={destData   ? { lat: destData.lat,  lng: destData.lng,  name: query?.destination   } : null}
            reportMarkers={approvedReportMarkers}
            safetyPoints={safetyPointMarkers}
            height="480px"
          />
          {/* Map legend */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
            {[
              { color: '#3b82f6', label: 'Start (S)' },
              { color: '#16a34a', label: 'Destination (D)' },
              { color: '#ef4444', label: 'Reports (!)' },
              { color: '#7c3aed', label: 'CCTV (C)' },
              { color: '#0891b2', label: 'Security (G)' },
              { color: '#d97706', label: 'Lighting (L)' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
        <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Safety scores are estimates based on available data and may not reflect current real-world conditions.
          This system is not an emergency service.
        </p>
      </div>
    </div>
  );
}
