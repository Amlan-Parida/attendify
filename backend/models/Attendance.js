const mongoose = require('mongoose');

const VALID_STATUSES = ['Present', 'Absent', 'Holiday', 'Mass Bunk'];

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    // NEW: identifies the specific time slot (e.g., "09:00"). 
    // Defaults to "00:00" for legacy records / daily marks with no slot defined.
    startTime: {
      type: String,
      default: '00:00',
    },
    // NEW: The attendance weight for this record, captured at the time of marking.
    // Theory = 2, Lab = 1. Default 1 for legacy records.
    weight: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      },
      required: [true, 'Status is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
    },
  },
  { timestamps: true }
);

// One record per user per subject per day per time-slot
// This allows multiple records for the same subject on the same day (e.g. Theory + Lab)
attendanceSchema.index({ user: 1, subject: 1, date: 1, startTime: 1 }, { unique: true });

// IMPORTANT: Do NOT add virtual fields for total_classes or percentage.
// These are always computed dynamically in the analytics controller.

module.exports = mongoose.model('Attendance', attendanceSchema);
