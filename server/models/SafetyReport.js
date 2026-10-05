const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Poor Lighting',
        'Isolated Area',
        'Security Issue',
        'Road/Path Problem',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: ['Low', 'Medium', 'High'],
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    incidentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
safetyReportSchema.index({ latitude: 1, longitude: 1 });
safetyReportSchema.index({ status: 1 });
safetyReportSchema.index({ userId: 1 });

module.exports = mongoose.model('SafetyReport', safetyReportSchema);
