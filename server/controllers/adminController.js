const { dbConnected } = require('../config/db');
const mem = require('../config/memoryStore');
const getSafetyReport = () => require('../models/SafetyReport');
const getUser         = () => require('../models/User');

const getAllReports = async (req, res, next) => {
  try {
    const { status, category, severity, page = 1, limit = 15 } = req.query;
    if (dbConnected()) {
      const filter = {};
      if (status)   filter.status   = status;
      if (category) filter.category = category;
      if (severity) filter.severity = severity;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [reports, total] = await Promise.all([
        getSafetyReport().find(filter).populate('userId','name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
        getSafetyReport().countDocuments(filter),
      ]);
      return res.json({ success: true, data: { reports, total, page: parseInt(page), limit: parseInt(limit) } });
    }
    const result = mem.getAllReports({ status, category, severity, page: parseInt(page), limit: parseInt(limit) });
    res.json({ success: true, data: { ...result, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
};

const approveReport = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const report = await getSafetyReport().findByIdAndUpdate(req.params.id, { status: 'Approved', reviewedAt: new Date() }, { new: true });
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      return res.json({ success: true, message: 'Report approved.', data: { report } });
    }
    const report = mem.updateReportStatus(req.params.id, 'Approved');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, message: 'Report approved.', data: { report } });
  } catch (err) { next(err); }
};

const rejectReport = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const report = await getSafetyReport().findByIdAndUpdate(req.params.id, { status: 'Rejected', reviewedAt: new Date() }, { new: true });
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      return res.json({ success: true, message: 'Report rejected.', data: { report } });
    }
    const report = mem.updateReportStatus(req.params.id, 'Rejected');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, message: 'Report rejected.', data: { report } });
  } catch (err) { next(err); }
};

const deleteReport = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const report = await getSafetyReport().findByIdAndDelete(req.params.id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      return res.json({ success: true, message: 'Report deleted.' });
    }
    const ok = mem.deleteReport(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, message: 'Report deleted.' });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const SR = getSafetyReport();
      const U  = getUser();
      const [totalUsers, totalReports, pendingReports, approvedReports, rejectedReports, categoryStats] = await Promise.all([
        U.countDocuments({ role: 'user' }),
        SR.countDocuments(),
        SR.countDocuments({ status: 'Pending' }),
        SR.countDocuments({ status: 'Approved' }),
        SR.countDocuments({ status: 'Rejected' }),
        SR.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ]);
      const higherRiskLocations = await SR.find({ status: 'Approved', severity: 'High' }).select('location latitude longitude category severity').limit(10);
      const recentReports       = await SR.find().populate('userId', 'name').sort({ createdAt: -1 }).limit(5);
      return res.json({ success: true, data: { totalUsers, totalReports, pendingReports, approvedReports, rejectedReports, higherRiskLocations: higherRiskLocations.length, categoryStats, recentReports } });
    }
    res.json({ success: true, data: mem.getStats() });
  } catch (err) { next(err); }
};

module.exports = { getAllReports, approveReport, rejectReport, deleteReport, getStats };
