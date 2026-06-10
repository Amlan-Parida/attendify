const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// @desc    Get attendance records (with optional filters)
// @route   GET /api/attendance?subjectId=&startDate=&endDate=&startTime=
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { subjectId, startDate, endDate, startTime } = req.query;
    const filter = { user: req.user._id };

    if (subjectId) filter.subject = subjectId;
    if (startTime) filter.startTime = startTime;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const records = await Attendance.find(filter)
      .populate('subject', 'name color minAttendance slots')
      .sort({ date: -1, startTime: 1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// @desc    Mark or update attendance for a specific date + subject (+ optional slot)
// @route   POST /api/attendance
// @access  Private
// Body: { subjectId, date, status, note, startTime? }
const markAttendance = async (req, res) => {
  try {
    const { subjectId, date, status, note, startTime } = req.body;

    if (!subjectId || !date || !status) {
      return res.status(400).json({ message: 'subjectId, date, and status are required' });
    }

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Normalize date to midnight UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Determine weight:
    // 1. If a specific startTime slot is provided and matched → use slot weight
    // 2. Otherwise → use subject.defaultWeight (Theory=2, Lab=1)
    // This keeps the simple daily-mark flow: user just marks Present/Absent,
    // and the correct weight is applied automatically.
    let slotStartTime = startTime || '00:00';
    let slotWeight = subject.defaultWeight || 1;

    if (startTime && subject.slots && subject.slots.length > 0) {
      const matchingSlot = subject.slots.find((s) => s.startTime === startTime);
      if (matchingSlot) {
        slotWeight = matchingSlot.weight || slotWeight;
      }
    }

    // Build query to find the exact record to update
    const baseQuery = { user: req.user._id, subject: subjectId, date: normalizedDate };
    let targetQuery = { ...baseQuery };

    if (slotStartTime !== '00:00') {
      // Look for the exact specific slot first
      const exactRecord = await Attendance.findOne({ ...baseQuery, startTime: slotStartTime });
      if (exactRecord) {
        targetQuery.startTime = slotStartTime;
      } else {
        // If not found, check if there is a generic '00:00' record created from the dashboard
        const genericRecord = await Attendance.findOne({ ...baseQuery, startTime: '00:00' });
        if (genericRecord) {
          // Absorb the generic record into this specific slot
          targetQuery.startTime = '00:00';
        } else {
          targetQuery.startTime = slotStartTime;
        }
      }
    }

    // Upsert: update the matching record, and always enforce the correct startTime
    const record = await Attendance.findOneAndUpdate(
      targetQuery,
      { 
        $set: { status, note: note || '', weight: slotWeight, startTime: slotStartTime }
      },
      { new: true, upsert: true, runValidators: true }
    );

    await record.populate('subject', 'name color minAttendance');
    res.status(200).json(record);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Attendance for this slot already exists' });
    }
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
};

// @desc    Update an attendance record
// @route   PUT /api/attendance/:id
// @access  Private
const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const { status, note } = req.body;
    if (status) record.status = status;
    if (note !== undefined) record.note = note;

    const updated = await record.save();
    await updated.populate('subject', 'name color minAttendance');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
};

// @desc    Delete an attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await record.deleteOne();
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete attendance', error: error.message });
  }
};

// @desc    Get all attendance records formatted for calendar view
// @route   GET /api/attendance/calendar?month=&year=
// @access  Private
const getCalendarData = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      const start = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
      const end = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59));
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate('subject', 'name color slots')
      .sort({ date: 1, startTime: 1 });

    // Format for FullCalendar — slot-aware events
    const events = records.map((r) => {
      const slotInfo = r.subject?.slots?.find((s) => s.startTime === r.startTime);
      const typeLabel = slotInfo ? ` [${slotInfo.type}]` : '';
      const timeLabel = r.startTime && r.startTime !== '00:00' ? ` · ${r.startTime}` : '';

      return {
        id: r._id,
        title: `${r.subject?.name || 'Unknown'}${typeLabel} - ${r.status}${timeLabel}`,
        date: r.date.toISOString().split('T')[0],
        status: r.status,
        startTime: r.startTime,
        weight: r.weight,
        slotType: slotInfo?.type || null,
        subjectId: r.subject?._id,
        subjectName: r.subject?.name,
        subjectColor: r.subject?.color,
        backgroundColor: statusColor(r.status),
        borderColor: statusColor(r.status),
        textColor: '#ffffff',
        extendedProps: {
          status: r.status,
          note: r.note,
          startTime: r.startTime,
          weight: r.weight,
          slotType: slotInfo?.type || null,
          subjectId: r.subject?._id,
        },
      };
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch calendar data', error: error.message });
  }
};

const statusColor = (status) => {
  const colors = {
    Present: '#22c55e',
    Absent: '#ef4444',
    Holiday: '#94a3b8',
    'Mass Bunk': '#f97316',
  };
  return colors[status] || '#6366f1';
};

module.exports = {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getCalendarData,
};
