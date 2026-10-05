import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Navigation, Clock, Shield, Lightbulb,
  Users, AlertTriangle, CheckCircle, Info, Map,
} from 'lucide-react';
import CampusMap from '../../components/CampusMap.jsx';
import ScoreBadge from '../../components/ScoreBadge.jsx';

export default function RouteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stored, setStored] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('selectedRoute');
    if (!raw) { navigate('/find-route'); return; }
    setStored(JSON.parse(raw));
  }, [navigate]);

  if (!stored) return null;

  const { route, query, aiResult, allRoutes = [] } = stored;
  const aiRouteData = aiResult?.routes?.find((r) => r.routeName === route?.name);
  const reasons = aiRouteData?.reasons || route?.reasons || [];
  const isRecommended = aiRouteData?.recommendation
    || (allRoutes.length > 0 && route?.safetyScore === Math.max(...allRoutes.map((r) => r.safetyScore)));

  const statRow = (icon, label, value, sub) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/route-results" className="btn-secondary text-sm py-2">
          <ArrowLeft size={15} /> Results
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 truncate">{route.name}</h1>
            {isRecommended && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                <Star size={11} fill="currentColor" /> Recommended
              </span>
            )}
          </div>
          {query && (
            <p className="text-sm text-gray-500 mt-0.5">
              {query.startLocation} → {query.destination} · {query.travelTime}
            </p>
          )}
        </div>
      </div>

      {/* Recommended disclaimer */}
      {isRecommended && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
          <Star size={17} className="text-green-600 flex-shrink-0" fill="currentColor" />
          <p className="text-sm text-green-800 font-medium">
            Recommended based on the available safety data.{' '}
            <span className="font-normal text-green-700">
              Safety recommendations are estimates and may not reflect current real-world conditions.
            </span>
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Score card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Safety Score</h2>
            <ScoreBadge score={route.safetyScore} size="lg" />
          </div>

          <div className={`rounded-xl px-4 py-3 mb-4 ${
            route.safetyScore >= 80 ? 'bg-green-50 border border-green-200' :
            route.safetyScore >= 50 ? 'bg-amber-50 border border-amber-200' :
                                       'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-semibold ${
              route.safetyScore >= 80 ? 'text-green-800' :
              route.safetyScore >= 50 ? 'text-amber-800' : 'text-red-800'
            }`}>{route.riskLevel}</p>
            <p className="text-xs text-gray-500 mt-0.5">*Estimate based on available data</p>
          </div>

          {/* Route stats */}
          <div>
            {statRow(<Navigation size={15} className="text-primary-600" />, 'Distance',        route.distance)}
            {statRow(<Clock size={15} className="text-primary-600" />,      'Estimated time',   route.estimatedTime)}
            {statRow(<Lightbulb size={15} className="text-yellow-500" />,   'Lighting quality', route.lightingQuality)}
            {statRow(<Shield size={15} className="text-blue-500" />,        'Security points',  `${route.securityPointCount} point(s)`)}
            {statRow(<AlertTriangle size={15} className="text-amber-500" />, 'Approved reports', `${route.reportCount ?? route.approvedReports?.length ?? 0} report(s)`)}
            {statRow(<Users size={15} className="text-gray-500" />,         'Crowd level',      route.crowdLevel)}
          </div>
        </div>

        {/* AI reasons */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={16} className="text-primary-600" /> Score explanation
          </h2>
          {reasons.length > 0 ? (
            <ul className="space-y-2.5">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={15} className="text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{r}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Run AI Analysis on the results page to get detailed reasons.</p>
          )}

          {aiResult?.overallRecommendation && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">AI recommendation</p>
              <p className="text-sm text-gray-800">{aiResult.overallRecommendation}</p>
            </div>
          )}

          {/* Scoring factors legend */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Scoring factors (SRS §6)</p>
            {[
              ['Lighting',         '30%'],
              ['Security points',  '25%'],
              ['Approved reports', '20%'],
              ['Crowd level',      '15%'],
              ['Time of day',      '10%'],
            ].map(([f, w]) => (
              <div key={f} className="flex justify-between text-xs text-gray-600 py-0.5">
                <span>{f}</span><span className="font-medium">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mini map */}
      <div className="card p-4">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Map size={16} className="text-primary-600" /> Route on map
        </h2>
        <CampusMap
          routes={[route]}
          selectedRouteId={route.id}
          startMarker={stored.startData ? { lat: stored.startData.lat, lng: stored.startData.lng, name: query?.startLocation } : null}
          destMarker={stored.destData   ? { lat: stored.destData.lat,  lng: stored.destData.lng,  name: query?.destination   } : null}
          height="300px"
        />
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
        <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Safety scores are estimates based on available data and are not guarantees of real-world safety.
          Always exercise personal judgment when navigating campus.
        </p>
      </div>
    </div>
  );
}
