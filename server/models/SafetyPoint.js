const mongoose = require('mongoose');

const safetyPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Safety point name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['CCTV', 'Security', 'Emergency Point', 'Lighting'],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

safetyPointSchema.index({ latitude: 1, longitude: 1 });
safetyPointSchema.index({ type: 1 });

module.exports = mongoose.model('SafetyPoint', safetyPointSchema);
