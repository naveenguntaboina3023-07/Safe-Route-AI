const express = require('express');
const router = express.Router();
const {
  getSafetyPoints, addSafetyPoint, updateSafetyPoint,
  deleteSafetyPoint, seedSafetyPoints,
} = require('../controllers/safetyPointController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',          protect, getSafetyPoints);
router.post('/seed',     protect, adminOnly, seedSafetyPoints);
router.post('/',         protect, adminOnly, addSafetyPoint);
router.put('/:id',       protect, adminOnly, updateSafetyPoint);
router.delete('/:id',    protect, adminOnly, deleteSafetyPoint);

module.exports = router;
