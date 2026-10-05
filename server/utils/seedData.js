/**
 * Sample campus data for demonstration purposes.
 * Clearly labelled as sample data — not real incidents.
 * Base coordinates: generic college campus (approx. 28.6°N, 77.2°E)
 */

const CAMPUS_LOCATIONS = [
  { name: 'Main Gate',     lat: 28.6200, lng: 77.2100, lighting: 'Good',     securityPoints: 2 },
  { name: 'Library',       lat: 28.6215, lng: 77.2120, lighting: 'Good',     securityPoints: 2 },
  { name: 'CSE Block',     lat: 28.6225, lng: 77.2140, lighting: 'Good',     securityPoints: 1 },
  { name: 'Hostel',        lat: 28.6240, lng: 77.2160, lighting: 'Moderate', securityPoints: 1 },
  { name: 'Cafeteria',     lat: 28.6210, lng: 77.2155, lighting: 'Moderate', securityPoints: 0 },
  { name: 'Parking Area',  lat: 28.6195, lng: 77.2170, lighting: 'Poor',     securityPoints: 0 },
  { name: 'Sports Ground', lat: 28.6255, lng: 77.2130, lighting: 'Moderate', securityPoints: 0 },
  { name: 'Bus Stop',      lat: 28.6185, lng: 77.2095, lighting: 'Good',     securityPoints: 1 },
  { name: 'Back Gate',     lat: 28.6260, lng: 77.2175, lighting: 'Poor',     securityPoints: 0 },
  { name: 'Hostel Road',   lat: 28.6248, lng: 77.2165, lighting: 'Moderate', securityPoints: 1 },
];

const SAMPLE_SAFETY_POINTS = [
  { name: 'Main Gate CCTV',       type: 'CCTV',            lat: 28.6200, lng: 77.2100, desc: 'CCTV camera at main entrance' },
  { name: 'Library Security',     type: 'Security',        lat: 28.6215, lng: 77.2120, desc: 'Security guard post at library' },
  { name: 'CSE Block CCTV',       type: 'CCTV',            lat: 28.6225, lng: 77.2140, desc: 'CCTV camera outside CSE building' },
  { name: 'Hostel Security Post', type: 'Security',        lat: 28.6240, lng: 77.2160, desc: 'Security post at hostel entrance' },
  { name: 'Main Gate Emergency',  type: 'Emergency Point', lat: 28.6198, lng: 77.2098, desc: 'Emergency call point near main gate' },
  { name: 'Library Lights',       type: 'Lighting',        lat: 28.6213, lng: 77.2118, desc: 'High-intensity street lighting' },
  { name: 'Bus Stop Light',       type: 'Lighting',        lat: 28.6185, lng: 77.2095, desc: 'Lighting near bus stop' },
  { name: 'Parking CCTV',         type: 'CCTV',            lat: 28.6195, lng: 77.2170, desc: 'CCTV monitoring parking area' },
];

// Candidate route generator — returns 2-3 routes between two campus points
function generateCandidateRoutes(start, destination, travelTime, approvedReports, safetyPoints) {
  const startData = CAMPUS_LOCATIONS.find(
    (l) => l.name.toLowerCase() === start.toLowerCase()
  ) || CAMPUS_LOCATIONS[0];

  const destData = CAMPUS_LOCATIONS.find(
    (l) => l.name.toLowerCase() === destination.toLowerCase()
  ) || CAMPUS_LOCATIONS[4];

  // Simple distance approximation (Haversine would be better in production)
  const baseDist = Math.abs(startData.lat - destData.lat) * 111 +
                   Math.abs(startData.lng - destData.lng) * 85;
  const baseDistKm = Math.max(0.2, baseDist).toFixed(2);

  // Helper: count safety points within ~200m radius of a midpoint
  function countNearbyPoints(midLat, midLng, type) {
    return safetyPoints.filter((p) => {
      const dist = Math.sqrt(
        Math.pow((p.latitude - midLat) * 111, 2) +
        Math.pow((p.longitude - midLng) * 85, 2)
      );
      return dist < 0.2 && (!type || p.type === type);
    }).length;
  }

  function countNearbyReports(midLat, midLng) {
    return approvedReports.filter((r) => {
      const dist = Math.sqrt(
        Math.pow((r.latitude - midLat) * 111, 2) +
        Math.pow((r.longitude - midLng) * 85, 2)
      );
      return dist < 0.25;
    });
  }

  const midLat1 = (startData.lat + destData.lat) / 2;
  const midLng1 = (startData.lng + destData.lng) / 2;
  const midLat2 = midLat1 + 0.001;
  const midLng2 = midLng1 - 0.001;
  const midLat3 = midLat1 - 0.001;
  const midLng3 = midLng1 + 0.001;

  const routes = [
    {
      id: 'route-a',
      name: 'Route A (Main Path)',
      distance: `${baseDistKm} km`,
      estimatedTime: `${Math.round(baseDistKm * 12)} min walk`,
      lightingQuality: startData.lighting,
      securityPointCount: countNearbyPoints(midLat1, midLng1),
      approvedReports: countNearbyReports(midLat1, midLng1),
      crowdLevel: 'Medium',
      travelTime,
      waypoints: [
        [startData.lat, startData.lng],
        [midLat1, midLng1],
        [destData.lat, destData.lng],
      ],
    },
    {
      id: 'route-b',
      name: 'Route B (Inner Road)',
      distance: `${(parseFloat(baseDistKm) * 1.15).toFixed(2)} km`,
      estimatedTime: `${Math.round(baseDistKm * 14)} min walk`,
      lightingQuality: 'Good',
      securityPointCount: countNearbyPoints(midLat2, midLng2) + 1,
      approvedReports: countNearbyReports(midLat2, midLng2),
      crowdLevel: 'High',
      travelTime,
      waypoints: [
        [startData.lat, startData.lng],
        [midLat2, midLng2],
        [destData.lat, destData.lng],
      ],
    },
    {
      id: 'route-c',
      name: 'Route C (Back Road)',
      distance: `${(parseFloat(baseDistKm) * 0.9).toFixed(2)} km`,
      estimatedTime: `${Math.round(baseDistKm * 10)} min walk`,
      lightingQuality: 'Poor',
      securityPointCount: Math.max(0, countNearbyPoints(midLat3, midLng3) - 1),
      approvedReports: countNearbyReports(midLat3, midLng3),
      crowdLevel: 'Low',
      travelTime,
      waypoints: [
        [startData.lat, startData.lng],
        [midLat3, midLng3],
        [destData.lat, destData.lng],
      ],
    },
  ];

  return { routes, startData, destData, campusLocations: CAMPUS_LOCATIONS };
}

module.exports = { CAMPUS_LOCATIONS, SAMPLE_SAFETY_POINTS, generateCandidateRoutes };
