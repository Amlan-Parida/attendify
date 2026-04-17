const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true, // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    },
    startTime: {
      type: String,
      required: true, // e.g., "09:00"
    },
    endTime: {
      type: String,
      required: true, // e.g., "10:00"
    },
    type: {
      type: String,
      enum: ['Theory', 'Lab'],
      default: 'Theory',
    },
    // weight: Theory classes have 2 attendance units, Labs have 1 unit
    weight: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    // Legacy field — kept for backward compat + fallback
    classesPerWeek: {
      type: Number,
      required: [true, 'Classes per week is required'],
      min: [1, 'Must have at least 1 class per week'],
      max: [28, 'Cannot exceed 28 slots per week'],
    },
    // Legacy field — kept for backward compat + fallback
    daysOfWeek: {
      type: [Number],
      default: [],
      // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    },
    // NEW: Granular time-slot definitions
    slots: {
      type: [slotSchema],
      default: [],
    },
    // NEW: Per-session attendance weight.
    // Theory (2hr class) = 2 attendance units per session.
    // Lab / Practical = 1 attendance unit per session.
    // This is the simple version — no time-slot complexity needed.
    defaultWeight: {
      type: Number,
      default: 1,
      enum: [1, 2, 3],
    },
    minAttendance: {
      type: Number,
      default: 75,
      min: [0, 'Minimum attendance cannot be negative'],
      max: [100, 'Minimum attendance cannot exceed 100'],
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

// Ensure a user cannot have duplicate subject names
subjectSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
