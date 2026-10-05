import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon path (Vite asset handling)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG icon factory
function svgIcon(color, symbol) {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:2.5px solid white;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      font-size:13px;color:white;font-weight:700;
    ">${symbol}</div>`,
  });
}

const ROUTE_COLORS = ['#3b82f6', '#16a34a', '#f59e0b', '#8b5cf6'];

// Sub-component to fly to bounds
function FlyToBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const valid = points.filter((p) => p && p[0] != null && p[1] != null);
    if (valid.length === 0) return;
    try {
      const bounds = L.latLngBounds(valid);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    } catch {}
  }, [points, map]);
  return null;
}

export default function CampusMap({
  center = [28.6215, 77.2130],
  zoom   = 16,
  routes = [],
  selectedRouteId,
  startMarker,
  destMarker,
  reportMarkers = [],
  safetyPoints  = [],
  height = '450px',
}) {
  const allPoints = [];
  if (startMarker) allPoints.push([startMarker.lat, startMarker.lng]);
  if (destMarker)  allPoints.push([destMarker.lat, destMarker.lng]);

  return (
    <div style={{ height, width: '100%' }} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {allPoints.length > 0 && <FlyToBounds points={allPoints} />}

        {/* Route polylines */}
        {routes.map((route, i) => {
          if (!route.waypoints || route.waypoints.length < 2) return null;
          const isSelected = route.id === selectedRouteId;
          return (
            <Polyline
              key={route.id}
              positions={route.waypoints}
              color={ROUTE_COLORS[i % ROUTE_COLORS.length]}
              weight={isSelected ? 6 : 3}
              opacity={isSelected ? 1 : 0.5}
              dashArray={isSelected ? undefined : '8 6'}
            >
              <Popup>
                <strong>{route.name}</strong><br />
                Score: {route.safetyScore}/100<br />
                {route.riskLevel}
              </Popup>
            </Polyline>
          );
        })}

        {/* Start marker */}
        {startMarker && (
          <Marker position={[startMarker.lat, startMarker.lng]} icon={svgIcon('#3b82f6', 'S')}>
            <Popup><strong>Start:</strong> {startMarker.name}</Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destMarker && (
          <Marker position={[destMarker.lat, destMarker.lng]} icon={svgIcon('#16a34a', 'D')}>
            <Popup><strong>Destination:</strong> {destMarker.name}</Popup>
          </Marker>
        )}

        {/* Approved report markers */}
        {reportMarkers.map((r, i) => (
          <Marker
            key={r._id || i}
            position={[r.latitude, r.longitude]}
            icon={svgIcon('#ef4444', '!')}
          >
            <Popup>
              <strong>{r.category || 'Report'}</strong><br />
              {r.location && <span>{r.location}<br /></span>}
              {r.severity && <span>Severity: {r.severity}</span>}
            </Popup>
          </Marker>
        ))}

        {/* Safety point markers */}
        {safetyPoints.map((p, i) => {
          const colorMap = { CCTV: '#7c3aed', Security: '#0891b2', 'Emergency Point': '#dc2626', Lighting: '#d97706' };
          const symbolMap = { CCTV: 'C', Security: 'G', 'Emergency Point': 'E', Lighting: 'L' };
          return (
            <Marker
              key={p._id || i}
              position={[p.latitude, p.longitude]}
              icon={svgIcon(colorMap[p.type] || '#6b7280', symbolMap[p.type] || 'P')}
            >
              <Popup>
                <strong>{p.name}</strong><br />
                Type: {p.type}<br />
                {p.description && <span>{p.description}</span>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
