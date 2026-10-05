const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { dbConnected } = require('../config/db');
const mem      = require('../config/memoryStore');

// Lazy-load Mongoose model only when DB is connected
const getUser  = () => require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_dev', { expiresIn: '7d' });

// Thin wrapper — returns a plain object safe to send as JSON
function safeUser(u) {
  if (!u) return null;
  const { password, ...rest } = typeof u.toJSON === 'function' ? u.toJSON() : u;
  return rest;
}

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });

    if (dbConnected()) {
      const User = getUser();
      if (await User.findOne({ email: email.toLowerCase() }))
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      const user  = await User.create({ name, email, password, studentId: studentId || null });
      const token = generateToken(user._id.toString());
      return res.status(201).json({ success: true, message: 'Registration successful.', data: { user: safeUser(user), token } });
    }

    // Memory store
    if (mem.findUserByEmail(email))
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    const user  = await mem.createUser({ name, email, password, studentId, role: 'user' });
    const token = generateToken(user._id);
    return res.status(201).json({ success: true, message: 'Registration successful.', data: { user: safeUser(user), token } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    if (dbConnected()) {
      const User = getUser();
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      const token = generateToken(user._id.toString());
      return res.json({ success: true, message: 'Login successful.', data: { user: safeUser(user), token } });
    }

    // Memory store
    const user = mem.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const token = generateToken(user._id);
    return res.json({ success: true, message: 'Login successful.', data: { user: safeUser(user), token } });
  } catch (err) { next(err); }
};

// GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (err) { next(err); }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, studentId } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (studentId !== undefined) updates.studentId = studentId;

    if (dbConnected()) {
      const User = getUser();
      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
      return res.json({ success: true, message: 'Profile updated.', data: { user: safeUser(user) } });
    }

    const user = mem.updateUser(req.user._id, updates);
    res.json({ success: true, message: 'Profile updated.', data: { user: safeUser(user) } });
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile, updateProfile };
