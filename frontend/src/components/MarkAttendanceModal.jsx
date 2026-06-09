import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, XCircle, Coffee, Users, BookType, FlaskConical, ClipboardList, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  {
    value: 'Present',
    label: 'Present',
    icon: CheckCircle2,
    baseClass: 'bg-green-500/5 text-green-600 dark:text-green-400 border-green-500/20',
    activeClass: 'bg-green-600 text-white border-green-600 shadow-glow-sm',
  },
  {
    value: 'Absent',
    label: 'Absent',
    icon: XCircle,
    baseClass: 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20',
    activeClass: 'bg-red-600 text-white border-red-600 shadow-glow-sm',
  },
  {
    value: 'Holiday',
    label: 'Holiday',
    icon: Coffee,
    baseClass: 'bg-surface-500/5 text-surface-600 dark:text-surface-400 border-surface-500/20',
    activeClass: 'bg-surface-600 text-white border-surface-600 shadow-glow-sm',
  },
  {
    value: 'Mass Bunk',
    label: 'Mass Bunk',
    icon: Users,
    baseClass: 'bg-orange-500/5 text-orange-600 dark:text-orange-400 border-orange-500/20',
    activeClass: 'bg-orange-600 text-white border-orange-600 shadow-glow-sm',
  },
];

export default function MarkAttendanceModal({ subject, onClose, onSuccess, presetDate, slot }) {
  const [date, setDate] = useState(presetDate || format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState('Present');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);
  const [isInterchanged, setIsInterchanged] = useState(false);

  const slotStartTime = slot?.start_time || slot?.startTime || '00:00';
  const weight = slot?.weight || subject?.default_weight || subject?.defaultWeight || 1;

  const selectedDay = new Date(date + 'T00:00:00').getDay();
  const hasClassOnSelectedDay = subject.slots?.some(s => Number(s.day) === selectedDay);

  useEffect(() => {
    setIsInterchanged(false);
  }, [date]);

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const { data } = await api.get(`/attendance?subjectId=${subject._id || subject.id}&startDate=${date}&endDate=${date}&startTime=${slotStartTime}`);
        if (data && data.length > 0) {
          setExistingRecord(data[0]);
          setStatus(data[0].status);
          setNote(data[0].note || '');
        } else {
          setExistingRecord(null);
          setStatus('Present');
          setNote('');
        }
      } catch (err) {
        console.error('Error checking existing attendance:', err);
      }
    };
    if (subject && date) checkExisting();
  }, [date, subject, slotStartTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasClassOnSelectedDay && !isInterchanged) {
      toast.error('Please verify if this was an interchanged class.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/attendance', {
        subjectId: subject._id || subject.id,
        date,
        startTime: slotStartTime,
        status,
        note: isInterchanged ? `[Interchanged] ${note}`.trim() : note,
      });

      toast.success(`Marked ${status} for ${subject.name}`);
      onSuccess?.(status);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = hasClassOnSelectedDay || isInterchanged;

  const slotType = slot?.type || (weight >= 2 ? 'Theory' : 'Lab');

  return (
    <div className="p-5 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: subject.color }}>
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Record Attendance</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{subject.name}</span>
              <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                slotType === 'Theory' ? 'text-indigo-500 bg-indigo-500/10' : 'text-emerald-500 bg-emerald-500/10'
              }`}>
                {slotType === 'Theory' ? <BookType className="w-3.5 h-3.5" /> : <FlaskConical className="w-3.5 h-3.5" />}
                {slotType} ×{weight}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Session Date</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className="premium-input pl-10 text-xs h-10 font-bold"
            />
          </div>

          {/* Timetable Check Warning */}
          {!hasClassOnSelectedDay && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold leading-tight">
                  No class scheduled for **{subject.name}** on this day of the week.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-white/40 dark:bg-black/20 rounded-lg border border-amber-500/10">
                <input 
                  type="checkbox" 
                  checked={isInterchanged} 
                  onChange={(e) => setIsInterchanged(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-350">
                  This class was interchanged / rescheduled
                </span>
              </label>
            </div>
          )}

          {existingRecord && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/5 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20 text-[9px] font-black uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              Existing entry: {existingRecord.status}
            </div>
          )}
        </div>

        {/* Status Grid */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map(({ value, label, icon: Icon, baseClass, activeClass }) => {
              const isActive = status === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 ${
                    isActive ? activeClass : `${baseClass} hover:bg-slate-100/50`
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-black text-[11px] uppercase tracking-wider">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Notes (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Extra class for exam prep..."
            className="premium-input text-xs h-10 font-bold"
            maxLength={200}
          />
        </div>

        {/* Submit Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary py-2.5 text-xs flex-1">Discard</button>
          <button 
            type="submit" 
            disabled={loading || !canSubmit} 
            className={`btn-premium py-2.5 text-xs flex-1 ${!canSubmit ? 'opacity-50 cursor-not-allowed filter grayscale' : ''}`}
          >
            {loading ? 'Processing...' : existingRecord ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
