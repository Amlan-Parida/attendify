// ─────────────────────────────────────────────────────────────────────────────
// CLIENT-SIDE ATTENDANCE MATH ENGINE (mirrors backend logic)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute how many consecutive classes to attend to reach targetPct%.
 * @param {number} attended - Current classes attended (Present)
 * @param {number} conducted - Total classes conducted (Present + Absent + Mass Bunk)
 * @param {number} targetPct - Target percentage (e.g., 75)
 * @returns {number} - Minimum future classes to attend (0 if already safe, -1 if impossible)
 */
export const classesNeededToReach = (attended, conducted, targetPct) => {
  if (targetPct >= 100) return -1; // impossible if any absence
  if (conducted === 0) return 0;

  const current = (attended / conducted) * 100;
  if (current >= targetPct) return 0; // already safe

  const numerator = targetPct * conducted - 100 * attended;
  const denominator = 100 - targetPct;
  return Math.ceil(numerator / denominator);
};

/**
 * Compute how many classes can be skipped while staying at/above targetPct%.
 * @param {number} attended
 * @param {number} conducted
 * @param {number} targetPct
 * @returns {number}
 */
export const classesCanMiss = (attended, conducted, targetPct) => {
  if (conducted === 0) return 0;
  const current = (attended / conducted) * 100;
  if (current < targetPct) return 0;
  return Math.max(0, Math.floor((100 * attended - targetPct * conducted) / targetPct));
};

/**
 * Get the attendance status label.
 */
export const getStatus = (percentage, minAttendance, conducted) => {
  if (conducted === 0) return 'no-data';
  if (percentage < minAttendance) return 'critical';
  if (percentage < minAttendance + 5) return 'warning';
  return 'safe';
};

/**
 * What-if: if I miss the next class, what will my percentage be?
 */
export const whatIfMiss = (attended, conducted) => {
  if (conducted === 0) return { newPercentage: 0, newConducted: 1, newAttended: 0 };
  return {
    newPercentage: parseFloat(((attended / (conducted + 1)) * 100).toFixed(2)),
    newConducted: conducted + 1,
    newAttended: attended,
  };
};

/**
 * Format a decimal percentage for display.
 */
export const formatPct = (value) =>
  typeof value === 'number' ? value.toFixed(1) + '%' : '—';

/**
 * Status color map.
 */
export const STATUS_COLORS = {
  safe: { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-500', dot: '#22c55e' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-500', dot: '#f59e0b' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500', dot: '#ef4444' },
  'no-data': { bg: 'bg-gray-100', text: 'text-gray-500', ring: 'ring-gray-300', dot: '#94a3b8' },
};

export const ATTENDANCE_STATUS_COLORS = {
  Present: { bg: '#22c55e', label: 'Present' },
  Absent: { bg: '#ef4444', label: 'Absent' },
  Holiday: { bg: '#94a3b8', label: 'Holiday' },
  'Mass Bunk': { bg: '#f97316', label: 'Mass Bunk' },
};
