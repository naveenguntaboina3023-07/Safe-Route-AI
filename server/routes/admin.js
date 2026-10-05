const express = require('express');
const router = express.Router();
const { getAllReports, approveReport, rejectReport, deleteReport, getStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly); // All admin routes require auth + admin role

router.get('/stats',                 getStats);
router.get('/reports',               getAllReports);
router.put('/reports/:id/approve',   approveReport);
router.put('/reports/:id/reject',    rejectReport);
router.delete('/reports/:id',        deleteReport);

module.exports = router;
