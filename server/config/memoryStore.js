/**
 * In-memory data store — used when MongoDB is unavailable.
 * Gives the app full functionality for demo/development without a DB.
 */
const bcrypt = require('bcryptjs');

// Pre-seeded demo accounts
const ADMIN_HASH    = bcrypt.hashSync('admin123',    10);
const STUDENT_HASH  = bcrypt.hashSync('student123',  10);

const store = {
  users: [
    { _id: 'user-admin-1',   name: 'Campus Admin',  email: 'admin@campus.edu',   password: ADMIN_HASH,   role: 'admin',  studentId: null,         createdAt: new Date('2024-01-01') },
    { _id: 'user-student-1', name: 'Demo Student',  email: 'student@campus.edu', password: STUDENT_HASH, role: 'user',   studentId: 'CS2024001',  createdAt: new Date('2024-01-01') },
  ],
  reports:      [],
  safetyPoints: [],
  routeSearches:[],
  _nextId: 1000,
};

function nextId() { return `mem-${++store._nextId}`; }

// ── User ops ────────────────────────────────────────────────────────────────
store.findUserByEmail = (email) =>
  store.users.find((u) => u.email === email.toLowerCase()) || null;

store.findUserById = (id) =>
  store.users.find((u) => u._id === id) || null;

store.createUser = async ({ name, email, password, studentId, role = 'user' }) => {
  const hash = await bcrypt.hash(password, 12);
  const user = { _id: nextId(), name, email: email.toLowerCase(), password: hash, role, studentId: studentId || null, createdAt: new Date() };
  store.users.push(user);
  return user;
};

store.updateUser = (id, updates) => {
  const idx = store.users.findIndex((u) => u._id === id);
  if (idx === -1) return null;
  store.users[idx] = { ...store.users[idx], ...updates };
  return store.users[idx];
};

// ── Report ops ──────────────────────────────────────────────────────────────
store.createReport = (data) => {
  const report = { _id: nextId(), ...data, status: 'Pending', createdAt: new Date(), reviewedAt: null };
  store.reports.push(report);
  return report;
};

store.getApprovedReports = () => store.reports.filter((r) => r.status === 'Approved');
store.getMyReports       = (userId) => store.reports.filter((r) => r.userId === userId);
store.getReportById      = (id) => store.reports.find((r) => r._id === id) || null;

store.updateReportStatus = (id, status) => {
  const r = store.reports.find((r) => r._id === id);
  if (!r) return null;
  r.status = status; r.reviewedAt = new Date();
  return r;
};

store.deleteReport = (id) => {
  const idx = store.reports.findIndex((r) => r._id === id);
  if (idx === -1) return false;
  store.reports.splice(idx, 1);
  return true;
};

store.getAllReports = ({ status, category, severity, page = 1, limit = 15 } = {}) => {
  let list = [...store.reports];
  if (status)   list = list.filter((r) => r.status   === status);
  if (category) list = list.filter((r) => r.category === category);
  if (severity) list = list.filter((r) => r.severity === severity);
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total  = list.length;
  const paged  = list.slice((page - 1) * limit, page * limit);
  return { reports: paged, total };
};

// ── SafetyPoint ops ─────────────────────────────────────────────────────────
store.getSafetyPoints  = () => [...store.safetyPoints];
store.createSafetyPoint = (data) => {
  const p = { _id: nextId(), ...data, createdAt: new Date() };
  store.safetyPoints.push(p);
  return p;
};
store.updateSafetyPoint = (id, data) => {
  const idx = store.safetyPoints.findIndex((p) => p._id === id);
  if (idx === -1) return null;
  store.safetyPoints[idx] = { ...store.safetyPoints[idx], ...data };
  return store.safetyPoints[idx];
};
store.deleteSafetyPoint = (id) => {
  const idx = store.safetyPoints.findIndex((p) => p._id === id);
  if (idx === -1) return false;
  store.safetyPoints.splice(idx, 1);
  return true;
};

// ── RouteSearch ops ─────────────────────────────────────────────────────────
store.createRouteSearch = (data) => {
  const s = { _id: nextId(), ...data, createdAt: new Date() };
  store.routeSearches.push(s);
  return s;
};
store.getRouteHistory = (userId) =>
  store.routeSearches.filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

// ── Stats ────────────────────────────────────────────────────────────────────
store.getStats = () => {
  const reports = store.reports;
  const cats    = {};
  reports.forEach((r) => { cats[r.category] = (cats[r.category] || 0) + 1; });
  return {
    totalUsers:        store.users.filter((u) => u.role === 'user').length,
    totalReports:      reports.length,
    pendingReports:    reports.filter((r) => r.status === 'Pending').length,
    approvedReports:   reports.filter((r) => r.status === 'Approved').length,
    rejectedReports:   reports.filter((r) => r.status === 'Rejected').length,
    higherRiskLocations: reports.filter((r) => r.status === 'Approved' && r.severity === 'High').length,
    categoryStats:     Object.entries(cats).map(([_id, count]) => ({ _id, count })),
    recentReports:     [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((r) => ({ ...r, userId: store.findUserById(r.userId) || { name: 'Unknown' } })),
  };
};

module.exports = store;
