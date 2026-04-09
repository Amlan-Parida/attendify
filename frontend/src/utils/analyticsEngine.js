/**
 * FRONTEND ATTENDANCE MATH ENGINE
 * Ported from backend/controllers/analyticsController.js
 */

export const computeStats = (records, subject, sessionEndDate, customTargetPct = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // conducted = sum of weights for Present + Absent + Mass Bunk records
  // attended  = sum of weights for Present records only
  const activeRecords = records.filter((r) => ['Present', 'Absent', 'Mass Bunk'].includes(r.status));
  const conducted = activeRecords.reduce((sum, r) => sum + (r.weight || 1), 0);
  const attended = records
    .filter((r) => r.status === 'Present')
    .reduce((sum, r) => sum + (r.weight || 1), 0);

  const holidays = records.filter((r) => r.status === 'Holiday').length;
  const massBunks = records.filter((r) => r.status === 'Mass Bunk').length;
  const absences = records.filter((r) => r.status === 'Absent').length;

  const percentage = conducted > 0 ? (attended / conducted) * 100 : 0;
  const P = customTargetPct !== null ? customTargetPct : subject.min_attendance || 75;

  // ─── FUTURE PREDICTION ────────────────────────────────────────────────────────
  let futureUnits = 0; 
  let smartForecast = null;
  const hasSessionEnd = !!sessionEndDate;
  const hasSlots = subject.slots && subject.slots.length > 0;

  if (hasSessionEnd) {
    const end = new Date(sessionEndDate);
    end.setHours(23, 59, 59, 999);

    const futureHolidayDates = records
      .filter((r) => r.status === 'Holiday' && new Date(r.date) > today && new Date(r.date) <= end)
      .map((r) => new Date(r.date).toDateString());

    if (hasSlots) {
      let currentDay = new Date(today);
      currentDay.setDate(currentDay.getDate() + 1);
      while (currentDay <= end) {
        if (!futureHolidayDates.includes(currentDay.toDateString())) {
          const dayOfWeek = currentDay.getDay();
          subject.slots.forEach((slot) => {
            if (slot.day === dayOfWeek) {
              futureUnits += slot.weight || 1;
            }
          });
        }
        currentDay.setDate(currentDay.getDate() + 1);
      }
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
    if (conducted === 0) {
      classesNeeded = 0;
      canMiss = 0;
    } else if (percentage >= P) {
      canMiss = Math.floor((100 * attended - P * conducted) / P);
      canMiss = Math.max(0, canMiss);
      classesNeeded = 0;
    } else {
      classesNeeded = P >= 100 ? -1 : Math.max(0, Math.ceil((P * conducted - 100 * attended) / (100 - P)));
      canMiss = 0;
    }
  }

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

export const getDashboardSummary = (enrichedSubjects) => {
  if (!enrichedSubjects.length) return { total: 0, safe: 0, warning: 0, critical: 0, noData: 0 };

  return {
    total: enrichedSubjects.length,
    safe: enrichedSubjects.filter((s) => s.status === 'safe').length,
    warning: enrichedSubjects.filter((s) => s.status === 'warning').length,
    critical: enrichedSubjects.filter((s) => s.status === 'critical').length,
    noData: enrichedSubjects.filter((s) => s.status === 'no-data').length,
  };
};

export const getGamification = (allRecords) => {
  const sortedConductedRecords = allRecords
    .filter(r => ['Present', 'Absent', 'Mass Bunk'].includes(r.status))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  for (const r of sortedConductedRecords) {
    if (r.status === 'Present') streak++;
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

  return { streak, rank, overallPct: parseFloat(overallPct.toFixed(2)) };
};
