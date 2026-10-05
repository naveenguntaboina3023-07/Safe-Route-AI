/**
 * SafeRoute AI — Database Seed Script
 * Run: node server/utils/seed.js
 * Creates a demo admin account and seeds sample safety points.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User        = require('../models/User');
const SafetyPoint = require('../models/SafetyPoint');
const { SAMPLE_SAFETY_POINTS } = require('./seedData');

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in server/.env — cannot seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminEmail = 'admin@campus.edu';
  const existing   = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`ℹ️  Admin already exists (${adminEmail})`);
  } else {
    const hash = await bcrypt.hash('admin123', 12);
    await User.create({ name: 'Campus Admin', email: adminEmail, password: hash, role: 'admin' });
    console.log('✅ Admin created:');
    console.log('   Email:    admin@campus.edu');
    console.log('   Password: admin123');
  }

  // ── Demo student ──────────────────────────────────────────────────────────
  const studentEmail = 'student@campus.edu';
  const existingS    = await User.findOne({ email: studentEmail });
  if (!existingS) {
    const hash = await bcrypt.hash('student123', 12);
    await User.create({ name: 'Demo Student', email: studentEmail, password: hash, studentId: 'CS2024001', role: 'user' });
    console.log('✅ Demo student created:');
    console.log('   Email:    student@campus.edu');
    console.log('   Password: student123');
  } else {
    console.log(`ℹ️  Demo student already exists (${studentEmail})`);
  }

  // ── Safety points ─────────────────────────────────────────────────────────
  const pointCount = await SafetyPoint.countDocuments();
  if (pointCount > 0) {
    console.log(`ℹ️  ${pointCount} safety points already exist — skipping.`);
  } else {
    const toInsert = SAMPLE_SAFETY_POINTS.map((p) => ({
      name: p.name, type: p.type,
      latitude: p.lat, longitude: p.lng,
      description: p.desc,
    }));
    await SafetyPoint.insertMany(toInsert);
    console.log(`✅ Seeded ${toInsert.length} sample safety points.`);
  }

  console.log('\n🎉 Seed complete. You can now log in at /admin/login or /login.');
  process.exit(0);
}

seed().catch((err) => { console.error('❌ Seed failed:', err.message); process.exit(1); });
