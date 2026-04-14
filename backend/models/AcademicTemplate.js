const mongoose = require('mongoose');

const templateSlotSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { type: String, enum: ['Theory', 'Lab'], default: 'Theory' },
    weight: { type: Number, default: 1, min: 1, max: 4 },
  },
  { _id: false }
);

const academicTemplateSchema = new mongoose.Schema(
  {
    college: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      lowercase: true,
    },
    year: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      lowercase: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      lowercase: true,
    },
    subjects: [
      {
        name: { type: String, required: true, trim: true },
        classesPerWeek: { type: Number, required: true },
        daysOfWeek: { type: [Number], default: [] },
        // NEW: Granular slot-based schedule
        slots: { type: [templateSlotSchema], default: [] },
        minAttendance: { type: Number, default: 75 },
        color: { type: String, default: '#6366f1' },
      },
    ],
    holidays: [
      {
        date: { type: String, required: true },
        name: { type: String, trim: true },
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure one template per college/year/section
academicTemplateSchema.index({ college: 1, year: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('AcademicTemplate', academicTemplateSchema);
