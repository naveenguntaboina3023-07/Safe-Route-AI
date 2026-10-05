const { dbConnected } = require('../config/db');
const mem = require('../config/memoryStore');
const { computeSafetyScore, classifyRisk, buildExplanation } = require('../services/scoringService');
const { analyzeRoutes } = require('../services/aiService');
const { generateCandidateRoutes, CAMPUS_LOCATIONS } = require('../utils/seedData');
const { SAMPLE_SAFETY_POINTS } = require('../utils/seedData');

const getSafetyReport = () => require('../models/SafetyReport');
const getSafetyPoint  = () => require('../models/SafetyPoint');
const getRouteSearch  = () => require('../models/RouteSearch');

// POST /api/routes/search
const searchRoutes = async (req, res, next) => {
  try {
    const { startLocation, destination, travelTime } = req.body;
    if (!startLocation || !destination)
      return res.status(400).json({ success: false, message: 'Start location and destination are required.' });
    if (startLocation.trim().toLowerCase() === destination.trim().toLowerCase())
      return res.status(400).json({ success: false, message: 'Start and destination cannot be the same.' });

    let approvedReports = [];
    let safetyPoints    = [];

    if (dbConnected()) {
      [approvedReports, safetyPoints] = await Promise.all([
        getSafetyReport().find({ status: 'Approved' }).select('latitude longitude severity category'),
        getSafetyPoint().find().select('latitude longitude type name'),
      ]);
    } else {
      approvedReports = mem.getApprovedReports();
      safetyPoints    = mem.getSafetyPoints().length
        ? mem.getSafetyPoints()
        : SAMPLE_SAFETY_POINTS.map((p, i) => ({ _id: `sp-${i}`, latitude: p.lat, longitude: p.lng, type: p.type, name: p.name }));
    }

    const { routes: candidateRoutes, startData, destData } = generateCandidateRoutes(
      startLocation, destination, travelTime || 'Morning', approvedReports, safetyPoints
    );

    const scoredRoutes = candidateRoutes.map((route) => {
      const { score, factors } = computeSafetyScore({
        lightingQuality:    route.lightingQuality,
        securityPointCount: route.securityPointCount,
        approvedReports:    route.approvedReports,
        crowdLevel:         route.crowdLevel,
        travelTime:         route.travelTime,
      });
      const { level, color } = classifyRisk(score);
      const reasons = buildExplanation(factors, { securityPointCount: route.securityPointCount, approvedReports: route.approvedReports });
      return { ...route, safetyScore: score, riskLevel: level, riskColor: color, reasons, reportCount: route.approvedReports.length };
    });

    const bestRoute = scoredRoutes.reduce((a, b) => (a.safetyScore >= b.safetyScore ? a : b));
    const uid = String(req.user._id || req.user.id);

    if (dbConnected()) {
      await getRouteSearch().create({ userId: uid, startLocation, destination, travelTime: travelTime || 'Morning', safetyScore: bestRoute.safetyScore });
    } else {
      mem.createRouteSearch({ userId: uid, startLocation, destination, travelTime: travelTime || 'Morning', safetyScore: bestRoute.safetyScore });
    }

    res.json({
      success: true,
      data: {
        routes: scoredRoutes, startData, destData,
        campusLocations: CAMPUS_LOCATIONS,
        approvedReportMarkers: approvedReports,
        safetyPointMarkers:    safetyPoints,
        disclaimer: 'Safety scores are estimates based on available data and are not guarantees of real-world safety.',
      },
    });
  } catch (err) { next(err); }
};

// POST /api/routes/analyze
const analyzeRoute = async (req, res, next) => {
  try {
    const { routes } = req.body;
    if (!routes || !Array.isArray(routes) || routes.length === 0)
      return res.status(400).json({ success: false, message: 'Routes data is required.' });
    const result = await analyzeRoutes(routes);
    res.json({ success: true, data: { ...result, disclaimer: 'Safety recommendations are estimates based on available data and may not reflect current real-world conditions.' } });
  } catch (err) { next(err); }
};

// GET /api/routes/history
const getHistory = async (req, res, next) => {
  try {
    const uid = String(req.user._id || req.user.id);
    if (dbConnected()) {
      const searches = await getRouteSearch().find({ userId: uid }).sort({ createdAt: -1 }).limit(10);
      return res.json({ success: true, data: { searches } });
    }
    res.json({ success: true, data: { searches: mem.getRouteHistory(uid) } });
  } catch (err) { next(err); }
};

// GET /api/routes/locations
const getCampusLocations = async (req, res, next) => {
  try {
    res.json({ success: true, data: { locations: CAMPUS_LOCATIONS } });
  } catch (err) { next(err); }
};

module.exports = { searchRoutes, analyzeRoute, getHistory, getCampusLocations };
