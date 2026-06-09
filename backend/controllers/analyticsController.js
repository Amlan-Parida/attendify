const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE MATH ENGINE
// ─────────────────────────────────────────────────────────────────────────────
//
// Definitions:
//   conducted  = Present + Absent + Mass Bunk  (Holiday does NOT count)
//   attended   = Present only
//   percentage = (attended / conducted) * 100
//
// To reach target P% in future:
//   Need x future consecutive Present classes such that:
//     (attended + x) / (conducted + x) >= P/100
//   Solving for x:
//     attended + x >= P/100 * (conducted + x)
//     attended + x >= P*conducted/100 + P*x/100
//     x - P*x/100 >= P*conducted/100 - attended
//     x(1 - P/100) >= (P*conducted - 100*attended) / 100
//     x >= (P*conducted - 100*attended) / (100 - P)
//   Final: x = ceil((P*conducted - 100*attended) / (100 - P))
//
// Classes you can MISS and stay at/above P%:
//   (attended) / (conducted + y) >= P/100
//   100*attended >= P*(conducted + y)
//   100*attended - P*conducted >= P*y
//   y <= (100*attended - P*conducted) / P
//   Final: y = floor((100*attended - P*conducted) / P)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute attendance stats using Exact Schedule model if sessionEndDate is available
 * @param {Array} records - Attendance documents for one subject
 * @param {Object} subject - The subject document
 * @param {Date} sessionEndDate - User's session end date
 * @param {Number} customTargetPct - Optional custom target percentage
 */
const computeStats = (records, subject, sessionEndDate, customTargetPct = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ─── WEIGHT-BASED ATTENDANCE MATH ─────────────────────────────────────────────
  // Each attendance record has a `weight` field:
  //   Theory class  → weight 2  (2 attendance units per session)
  //   Lab / Practical → weight 1  (1 attendance unit per session)
  //   Legacy records (no slot) → weight 1 (backward compat)
  //
  // conducted = sum of weights for Present + Absent + Mass Bunk records
  // attended  = sum of weights for Present records only
  // percentage = (attended / conducted) * 100
  // ──────────────────────────────────────────────────────────────────────────────

  let activeRecords = records.filter((r) => ['Present', 'Absent', 'Mass Bunk'].includes(r.status));

  if (subject.autoMarkPresent) {
    const start = new Date(subject.createdAt || today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    
    const existingDates = new Set(
      records.map(r => new Date(r.date).toISOString().split('T')[0])
    );
    
    let currentDay = new Date(start);
    while (currentDay <= end) {
      const dayOfWeek = currentDay.getDay();
      const dateString = currentDay.toISOString().split('T')[0];
      
      if (!existingDates.has(dateString)) {
        if (subject.slots && subject.slots.length > 0) {
          subject.slots.forEach(slot => {
            if (Number(slot.day) === dayOfWeek) {
              activeRecords.push({
                status: 'Present',
                date: dateString,
                weight: slot.weight || 1
              });
            }
          });
        }
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }
  }

  const conducted = activeRecords.reduce((sum, r) => sum + (r.weight || 1), 0);
  const attended = activeRecords
    .filter((r) => r.status === 'Present')
    .reduce((sum, r) => sum + (r.weight || 1), 0);

  const holidays = records.filter((r) => r.status === 'Holiday').length;
  const massBunks = records.filter((r) => r.status === 'Mass Bunk').length;
  const absences = records.filter((r) => r.status === 'Absent').length;

  const percentage = conducted > 0 ? (attended / conducted) * 100 : 0;
  const P = customTargetPct !== null ? customTargetPct : subject.minAttendance;

  // ─── FUTURE PREDICTION ────────────────────────────────────────────────────────
  // Priority: slot-based (most accurate) → daysOfWeek fallback → classesPerWeek fallback
  let futureUnits = 0; // future attendance units (weight-aware)
  let smartForecast = null;
  const hasSessionEnd = !!sessionEndDate;
  const hasSlots = subject.slots && subject.slots.length > 0;
  const hasDays = subject.daysOfWeek && subject.daysOfWeek.length > 0;

  if (hasSessionEnd) {
    const end = new Date(sessionEndDate);
    end.setHours(23, 59, 59, 999);

    const futureHolidayDates = records
      .filter((r) => r.status === 'Holiday' && new Date(r.date) > today && new Date(r.date) <= end)
      .map((r) => new Date(r.date).toDateString());

    if (hasSlots) {
      // Most accurate: iterate every future day and match against defined slots
      let currentDay = new Date(today);
      currentDay.setDate(currentDay.getDate() + 1);
      while (currentDay <= end) {
        if (!futureHolidayDates.includes(currentDay.toDateString())) {
          const dayOfWeek = currentDay.getDay();
          // Sum up weights of all slots on this day
          subject.slots.forEach((slot) => {
            if (slot.day === dayOfWeek) {
              futureUnits += slot.weight || 1;
            }
          });
        }
        currentDay.setDate(currentDay.getDate() + 1);
      }
    } else if (hasDays) {
      // Fallback: count class days, each class = 1 unit
      let currentDay = new Date(today);
      currentDay.setDate(currentDay.getDate() + 1);
      while (currentDay <= end) {
        if (
          !futureHolidayDates.includes(currentDay.toDateString()) &&
          subject.daysOfWeek.includes(currentDay.getDay())
        ) {
          futureUnits++;
        }
        currentDay.setDate(currentDay.getDate() + 1);
      }
    } else {
      // Last resort: weekly estimate
      const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      const weeksLeft = daysLeft / 7;
      futureUnits = Math.max(
        0,
        Math.floor(weeksLeft * subject.classesPerWeek) - futureHolidayDates.length
      );
    }
  }

  // ─── SMART FORECAST MATH ──────────────────────────────────────────────────────
  let classesNeeded = 0;
  let canMiss = 0;

  if (hasSessionEnd) {
    const totalProjectedConducted = conducted + futureUnits;
    const targetAttended = Math.ceil((P / 100) * totalProjectedConducted);
    classesNeeded = targetAttended - attended;

    if (classesNeeded > futureUnits) {
      classesNeeded = -1; // Impossible
    } else if (classesNeeded <= 0) {
      canMiss = futureUnits - Math.max(0, classesNeeded);
      classesNeeded = 0;
    }

    const daysLeft = Math.ceil((new Date(sessionEndDate) - today) / (1000 * 60 * 60 * 24));
    smartForecast = { daysLeft, futureClasses: futureUnits, targetAttended };
  } else {
    // Legacy generic fallback (no session end date)
    if (conducted === 0) {
      classesNeeded = 0;
      canMiss = 0;
    } else if (percentage >= P) {
      canMiss = Math.floor((100 * attended - P * conducted) / P);
      canMiss = Math.max(0, canMiss);
      classesNeeded = 0;
    } else {
      classesNeeded =
        P >= 100
          ? -1
          : Math.max(0, Math.ceil((P * conducted - 100 * attended) / (100 - P)));
      canMiss = 0;
    }
  }

  // whatIfMiss uses next slot weight — assume 1 unit for simplicity
  const nextSlotWeight = 1;
  const whatIfMissNewPct = conducted > 0 ? (attended / (conducted + nextSlotWeight)) * 100 : 0;

  let status = 'safe';
  if (conducted === 0) status = 'no-data';
  else if (percentage < P) status = 'critical';
  else if (percentage < P + 5) status = 'warning';

  return {
    conducted,
    attended,
    absences,
    massBunks,
    holidays,
    percentage: parseFloat(percentage.toFixed(2)),
    minAttendance: P,
    status,
    classesNeeded,
    canMiss,
    smartForecast,
    whatIfMiss: {
      newPercentage: parseFloat(whatIfMissNewPct.toFixed(2)),
      wouldBeSafe: whatIfMissNewPct >= P,
    },
  };
};

// @desc    Get comprehensive analytics for all subjects
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id });

    if (subjects.length === 0) {
      return res.json({ subjects: [], summary: { total: 0, safe: 0, warning: 0, critical: 0 } });
    }

    const subjectIds = subjects.map((s) => s._id);
    const allRecords = await Attendance.find({
      user: req.user._id,
      subject: { $in: subjectIds },
    });

    // Group records by subject
    const recordsBySubject = {};
    subjectIds.forEach((id) => {
      recordsBySubject[id.toString()] = [];
    });
    allRecords.forEach((r) => {
      const key = r.subject.toString();
      if (recordsBySubject[key]) {
        recordsBySubject[key].push(r);
      }
    });

    const user = await require('../models/User').findById(req.user._id);

    const result = subjects.map((subject) => {
      const records = recordsBySubject[subject._id.toString()] || [];
      const stats = computeStats(records, subject, user.sessionEndDate);
      return {
        _id: subject._id,
        name: subject.name,
        color: subject.color,
        classesPerWeek: subject.classesPerWeek,
        minAttendance: subject.minAttendance,
        ...stats,
      };
    });

    // Overall summary
    const summary = {
      total: result.length,
      safe: result.filter((s) => s.status === 'safe').length,
      warning: result.filter((s) => s.status === 'warning').length,
      critical: result.filter((s) => s.status === 'critical').length,
      noData: result.filter((s) => s.status === 'no-data').length,
    };

    // Gamification Engine
    const sortedConductedRecords = allRecords
      .filter(r => ['Present', 'Absent', 'Mass Bunk'].includes(r.status))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let globalStreak = 0;
    for (const r of sortedConductedRecords) {
      if (r.status === 'Present') globalStreak++;
      else break;
    }

    let rank = 'Newcomer 🌱';
    const totalConducted = sortedConductedRecords.length;
    const totalAttended = sortedConductedRecords.filter(r => r.status === 'Present').length;
    const overallPct = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;

    if (totalConducted >= 3) {
      if (overallPct === 100) rank = 'Flawless Scholar 👑';
      else if (overallPct >= 90) rank = 'Academic Weapon ⚔️';
      else if (overallPct >= 75) rank = 'Safe Zone Surfer 🏄';
      else if (overallPct >= 50) rank = 'Living on the Edge 🧗';
      else rank = 'Professional Bunker 🥷';
    }

    res.json({ subjects: result, summary, gamification: { streak: globalStreak, rank, overallPct: parseFloat(overallPct.toFixed(2)) } });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Failed to compute analytics', error: error.message });
  }
};

// @desc    Get analytics for a single subject
// @route   GET /api/analytics/subject/:subjectId
// @access  Private
const getSubjectAnalytics = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      user: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const records = await Attendance.find({
      user: req.user._id,
      subject: subject._id,
    }).sort({ date: 1 });

    const user = await require('../models/User').findById(req.user._id);
    const stats = computeStats(records, subject, user.sessionEndDate);

    // Monthly breakdown
    const monthly = {};
    records.forEach((r) => {
      const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) {
        monthly[key] = { Present: 0, Absent: 0, Holiday: 0, 'Mass Bunk': 0 };
      }
      monthly[key][r.status]++;
    });

    res.json({
      subject: {
        _id: subject._id,
        name: subject.name,
        color: subject.color,
        minAttendance: subject.minAttendance,
      },
      ...stats,
      monthly,
      records: records.map((r) => ({
        _id: r._id,
        date: r.date,
        status: r.status,
        note: r.note,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute subject analytics', error: error.message });
  }
};

// @desc    Predict classes needed to reach a custom target percentage
// @route   POST /api/analytics/predict
// @access  Private
// Body: { subjectId, targetPercentage }
const predictAttendance = async (req, res) => {
  try {
    const { subjectId, targetPercentage } = req.body;

    if (!subjectId || targetPercentage === undefined) {
      return res.status(400).json({ message: 'subjectId and targetPercentage are required' });
    }

    const P = parseFloat(targetPercentage);
    if (isNaN(P) || P < 0 || P > 100) {
      return res.status(400).json({ message: 'targetPercentage must be between 0 and 100' });
    }

    const subject = await Subject.findOne({ _id: subjectId, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const records = await Attendance.find({ user: req.user._id, subject: subjectId });
    const user = await require('../models/User').findById(req.user._id);
    const stats = computeStats(records, subject, user.sessionEndDate, P);

    res.json({
      subjectName: subject.name,
      targetPercentage: P,
      currentAttended: stats.attended,
      currentConducted: stats.conducted,
      currentPercentage: stats.percentage,
      classesNeeded: stats.classesNeeded,
      canMiss: stats.canMiss,
      status: stats.status,
      smartForecast: stats.smartForecast,
      // Detailed math explanation
      math: {
        formula:
          P < 100
            ? `ceil((${P} × ${stats.conducted} - 100 × ${stats.attended}) / (100 - ${P})) = ${stats.classesNeeded}`
            : 'N/A (100% target)',
        explanation:
          stats.classesNeeded === 0
            ? `You are already at ${stats.percentage}%, which is above ${P}%. You can miss ${stats.canMiss} more class(es).`
            : stats.classesNeeded === -1
            ? `It is impossible to reach ${P}% with any number of future classes (only 100% target has this issue if absences exist).`
            : `You need to attend ${stats.classesNeeded} consecutive class(es) without any absence to reach ${P}%.`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute prediction', error: error.message });
  }
};

// @desc    Get recent global actions (Pulse)
// @route   GET /api/analytics/pulse
// @access  Private
const getPulse = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    if (!user.college) return res.json([]);

    // Find users in same college, year, section
    const peers = await require('../models/User').find({
      college: user.college,
      year: user.year,
      section: user.section,
      _id: { $ne: user._id } // exclude self
    }).select('_id name');

    const peerIds = peers.map(p => p._id);
    if (peerIds.length === 0) return res.json([]);

    // Find recent 5 Mass Bunk or Holiday records from these peers
    const recentRecords = await Attendance.find({
      user: { $in: peerIds },
      status: { $in: ['Mass Bunk', 'Holiday'] }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('subject', 'name');

    const pulse = recentRecords.map(r => ({
      _id: r._id,
      userName: r.user.name.split(' ')[0],
      subjectName: r.subject.name,
      status: r.status,
      timeAgo: r.createdAt
    }));

    res.json(pulse);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pulse' });
  }
};

module.exports = { getDashboardAnalytics, getSubjectAnalytics, predictAttendance, getPulse };
