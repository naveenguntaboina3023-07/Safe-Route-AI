const { dbConnected } = require('../config/db');
const mem = require('../config/memoryStore');
const getSafetyReport = () => require('../models/SafetyReport');

const createReport = async (req, res, next) => {
  try {
    const { location, latitude, longitude, category, description, severity, incidentDate } = req.body;
    if (!location || !latitude || !longitude || !category || !description || !severity)
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });

    const data = {
      userId: req.user._id || req.user.id,
      location, category, description, severity,
      latitude: parseFloat(latitude), longitude: parseFloat(longitude),
      incidentDate: incidentDate || new Date(),
      image: req.file ? `/uploads/${req.file.filename}` : null,
    };

    if (dbConnected()) {
      const report = await getSafetyReport().create(data);
      return res.status(201).json({ success: true, message: 'Report submitted successfully.', data: { report } });
    }
    const report = mem.createReport(data);
    res.status(201).json({ success: true, message: 'Report submitted successfully.', data: { report } });
  } catch (err) { next(err); }
};

const getApprovedReports = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const reports = await getSafetyReport().find({ status: 'Approved' })
        .populate('userId', 'name').sort({ createdAt: -1 }).limit(100);
      return res.json({ success: true, data: { reports } });
    }
    res.json({ success: true, data: { reports: mem.getApprovedReports() } });
  } catch (err) { next(err); }
};

const getMyReports = async (req, res, next) => {
  try {
    const uid = String(req.user._id || req.user.id);
    if (dbConnected()) {
      const reports = await getSafetyReport().find({ userId: uid }).sort({ createdAt: -1 });
      return res.json({ success: true, data: { reports } });
    }
    res.json({ success: true, data: { reports: mem.getMyReports(uid) } });
  } catch (err) { next(err); }
};

const getReport = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const report = await getSafetyReport().findById(req.params.id).populate('userId', 'name email');
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      return res.json({ success: true, data: { report } });
    }
    const report = mem.getReportById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, data: { report } });
  } catch (err) { next(err); }
};

const updateReport = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const report = await getSafetyReport().findById(req.params.id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      if (report.userId.toString() !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not your report.' });
      if (report.status !== 'Pending') return res.status(400).json({ success: false, message: 'Only pending reports can be edited.' });
      const allowed = ['location','latitude','longitude','category','description','severity','incidentDate'];
      allowed.forEach((f) => { if (req.body[f] !== undefined) report[f] = req.body[f]; });
      await report.save();
      return res.json({ success: true, message: 'Report updated.', data: { report } });
    }
    res.json({ success: true, message: 'Report updated.', data: { report: {} } });
  } catch (err) { next(err); }
};

const deleteReport = async (req, res, next) => {
  try {
    const uid = String(req.user._id || req.user.id);
    if (dbConnected()) {
      const report = await getSafetyReport().findById(req.params.id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      if (report.userId.toString() !== uid) return res.status(403).json({ success: false, message: 'Not your report.' });
      await report.deleteOne();
      return res.json({ success: true, message: 'Report deleted.' });
    }
    const report = mem.getReportById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (String(report.userId) !== uid) return res.status(403).json({ success: false, message: 'Not your report.' });
    mem.deleteReport(req.params.id);
    res.json({ success: true, message: 'Report deleted.' });
  } catch (err) { next(err); }
};

module.exports = { createReport, getApprovedReports, getMyReports, getReport, updateReport, deleteReport };
