import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, XCircle, Coffee, Users, BookType, FlaskConical, Target, ClipboardList, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  {
    value: 'Present',
    label: 'Present',
    icon: CheckCircle2,
    description: 'I attended this class',
    baseClass: 'bg-green-500/5 text-green-600 dark:text-green-400 border-green-500/20',
    activeClass: 'bg-green-600 text-white border-green-600 shadow-glow-sm',
  },
  {
    value: 'Absent',
    label: 'Absent',
    icon: XCircle,
    description: 'Class happened, I was absent',
    baseClass: 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20',
    activeClass: 'bg-red-600 text-white border-red-600 shadow-glow-sm',
  },
  {
    value: 'Holiday',
    label: 'Holiday',
    icon: Coffee,
    description: 'No class conducted today',
    baseClass: 'bg-surface-500/5 text-surface-600 dark:text-surface-400 border-surface-500/20',
    activeClass: 'bg-surface-600 text-white border-surface-600 shadow-glow-sm',
  },
  {
    value: 'Mass Bunk',
    label: 'Mass Bunk',
    icon: Users,
    description: 'Class happened, everyone bunked',
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

  // Use slot-specific data if available, otherwise fallback to subject defaults
  const slotStartTime = slot?.start_time || slot?.startTime || '00:00';
  const weight = slot?.weight || subject?.default_weight || subject?.defaultWeight || 1;
  const isTheory = weight >= 2;

  // Check if there's an existing record for selected date AND time-slot
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
    setLoading(true);
    try {
      await api.post('/attendance', {
        subjectId: subject._id || subject.id,
        date,
        startTime: slotStartTime,
        status,
        note,
      });

      toast.success(`Marked ${status} for ${subject.name} on ${format(new Date(date + 'T00:00:00'), 'dd MMM yyyy')}`);
      onSuccess?.(status);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-h-[90vh] overflow-y-auto">
      {/* Header Section */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 blur-lg opacity-20" style={{ backgroundColor: subject.color }}></div>
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: subject.color }}>
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">Record Attendance</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-surface-400 uppercase tracking-widest">{subject.name}</span>
                <div className="h-1 w-1 bg-surface-300 rounded-full"></div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  isTheory ? 'text-indigo-500 bg-indigo-500/10' : 'text-emerald-500 bg-emerald-500/10'
                }`}>
                  {isTheory ? <BookType className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                  {isTheory ? 'Theory ×2' : 'Lab ×1'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {isTheory && (
          <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              This session grants 2 attendance units
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date Selector */}
        <div className="space-y-3">
          <label className="label">Session Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="date"
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className="input pl-12 font-bold"
            />
          </div>
          {existingRecord && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" />
              Existing entry found: {existingRecord.status}
            </div>
          )}
        </div>

        {/* Status Grid */}
        <div className="space-y-3">
          <label className="label">Update Status</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STATUS_OPTIONS.map(({ value, label, icon: Icon, description, baseClass, activeClass }) => {
              const isActive = status === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`flex items-center gap-4 p-4 rounded-[1.25rem] border-2 text-left transition-all duration-300 group ${
                    isActive ? activeClass : `${baseClass} hover:scale-[1.02]`
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-white/20' : 'bg-white dark:bg-surface-800'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight leading-none mb-1">{label}</p>
                    <p className={`text-[10px] font-bold leading-tight ${isActive ? 'text-white/70' : 'text-surface-400'}`}>
                      {description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <label className="label">Session Notes (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Extra class for exam prep..."
            className="input font-bold min-h-[80px] resize-none"
            maxLength={200}
          />
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Discard</button>
          <button type="submit" disabled={loading} className="btn-primary flex-[2] shadow-primary-500/20">
            {loading ? 'Processing...' : existingRecord ? 'Update Entry' : 'Commit Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
