const express = require('express');
const router = express.Router();
const { searchRoutes, analyzeRoute, getHistory, getCampusLocations } = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.get('/locations',  protect, getCampusLocations);
router.post('/search',    protect, searchRoutes);
router.post('/analyze',   protect, aiLimiter, analyzeRoute);
router.get('/history',    protect, getHistory);

module.exports = router;
