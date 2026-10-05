const mongoose = require('mongoose');

const routeSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startLocation: {
      type: String,
      required: [true, 'Start location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    travelTime: {
      type: String,
      required: [true, 'Travel time is required'],
    },
    selectedRoute: {
      type: String,
      default: null,
    },
    safetyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  { timestamps: true }
);

routeSearchSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RouteSearch', routeSearchSchema);
