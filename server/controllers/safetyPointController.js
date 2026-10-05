const { dbConnected } = require('../config/db');
const mem = require('../config/memoryStore');
const { SAMPLE_SAFETY_POINTS } = require('../utils/seedData');
const getSafetyPoint = () => require('../models/SafetyPoint');

const getSafetyPoints = async (req, res, next) => {
  try {
    if (dbConnected()) {
      let points = await getSafetyPoint().find().sort({ createdAt: -1 });
      if (points.length === 0) {
        const mapped = SAMPLE_SAFETY_POINTS.map((p) => ({ _id: `seed-${p.name.replace(/\s+/g,'-').toLowerCase()}`, name: p.name, type: p.type, latitude: p.lat, longitude: p.lng, description: p.desc, isSample: true }));
        return res.json({ success: true, data: { points: mapped } });
      }
      return res.json({ success: true, data: { points } });
    }
    // Memory store — return seeded sample data if empty
    let points = mem.getSafetyPoints();
    if (points.length === 0) {
      points = SAMPLE_SAFETY_POINTS.map((p) => ({ _id: `seed-${p.name.replace(/\s+/g,'-').toLowerCase()}`, name: p.name, type: p.type, latitude: p.lat, longitude: p.lng, description: p.desc, isSample: true }));
    }
    res.json({ success: true, data: { points } });
  } catch (err) { next(err); }
};

const addSafetyPoint = async (req, res, next) => {
  try {
    const { name, type, latitude, longitude, description } = req.body;
    if (!name || !type || latitude === undefined || longitude === undefined)
      return res.status(400).json({ success: false, message: 'Name, type, latitude, and longitude are required.' });
    const data = { name, type, latitude: parseFloat(latitude), longitude: parseFloat(longitude), description: description || '' };
    if (dbConnected()) {
      const point = await getSafetyPoint().create(data);
      return res.status(201).json({ success: true, message: 'Safety point added.', data: { point } });
    }
    const point = mem.createSafetyPoint(data);
    res.status(201).json({ success: true, message: 'Safety point added.', data: { point } });
  } catch (err) { next(err); }
};

const updateSafetyPoint = async (req, res, next) => {
  try {
    const { name, type, latitude, longitude, description } = req.body;
    const updates = {};
    if (name)      updates.name      = name;
    if (type)      updates.type      = type;
    if (latitude)  updates.latitude  = parseFloat(latitude);
    if (longitude) updates.longitude = parseFloat(longitude);
    if (description !== undefined) updates.description = description;

    if (dbConnected()) {
      const point = await getSafetyPoint().findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
      if (!point) return res.status(404).json({ success: false, message: 'Safety point not found.' });
      return res.json({ success: true, message: 'Safety point updated.', data: { point } });
    }
    const point = mem.updateSafetyPoint(req.params.id, updates);
    if (!point) return res.status(404).json({ success: false, message: 'Safety point not found.' });
    res.json({ success: true, message: 'Safety point updated.', data: { point } });
  } catch (err) { next(err); }
};

const deleteSafetyPoint = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const point = await getSafetyPoint().findByIdAndDelete(req.params.id);
      if (!point) return res.status(404).json({ success: false, message: 'Safety point not found.' });
      return res.json({ success: true, message: 'Safety point deleted.' });
    }
    const ok = mem.deleteSafetyPoint(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Safety point not found.' });
    res.json({ success: true, message: 'Safety point deleted.' });
  } catch (err) { next(err); }
};

const seedSafetyPoints = async (req, res, next) => {
  try {
    if (dbConnected()) {
      const existing = await getSafetyPoint().countDocuments();
      if (existing > 0) return res.json({ success: true, message: `Already have ${existing} safety points.` });
      await getSafetyPoint().insertMany(SAMPLE_SAFETY_POINTS.map((p) => ({ name: p.name, type: p.type, latitude: p.lat, longitude: p.lng, description: p.desc })));
      return res.json({ success: true, message: `Seeded ${SAMPLE_SAFETY_POINTS.length} sample safety points.` });
    }
    // Seed into memory
    if (mem.getSafetyPoints().length > 0)
      return res.json({ success: true, message: `Already have ${mem.getSafetyPoints().length} safety points in memory.` });
    SAMPLE_SAFETY_POINTS.forEach((p) => mem.createSafetyPoint({ name: p.name, type: p.type, latitude: p.lat, longitude: p.lng, description: p.desc }));
    res.json({ success: true, message: `Seeded ${SAMPLE_SAFETY_POINTS.length} sample safety points into memory.` });
  } catch (err) { next(err); }
};

module.exports = { getSafetyPoints, addSafetyPoint, updateSafetyPoint, deleteSafetyPoint, seedSafetyPoints };
