import React, { useState, useEffect } from 'react';
import { X, BookOpen, BookType, FlaskConical, Target, CalendarDays, Palette, Sparkles, Check, Plus, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4',
];

const PRESETS = ['Mathematics', 'Physics', 'Data Structures', 'DBMS', 'Operating Systems', 'English'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function SubjectModal({ subject, onClose, onSave }) {
  const [name, setName] = useState(subject?.name || '');
  const [slots, setSlots] = useState(subject?.slots || []);
  const [minAttendance, setMinAttendance] = useState(subject?.minAttendance || 75);
  const [color, setColor] = useState(subject?.color || '#6366f1');
  const [autoMarkPresent, setAutoMarkPresent] = useState(subject?.autoMarkPresent || false);
  const [loading, setLoading] = useState(false);

  const isEdit = !!subject?._id;

  // Migration logic for legacy subjects (daysOfWeek -> slots)
  useEffect(() => {
    if (isEdit && (!subject.slots || subject.slots.length === 0) && subject.daysOfWeek?.length > 0) {
      const initialSlots = subject.daysOfWeek.map(day => ({
        day,
        startTime: '00:00',
        endTime: '00:00',
        type: (subject.defaultWeight || 1) >= 2 ? 'Theory' : 'Lab',
        weight: subject.defaultWeight || 1
      }));
      setSlots(initialSlots);
    }
  }, [isEdit, subject]);

  const addSlot = () => {
    setSlots([...slots, { day: 1, startTime: '09:00', endTime: '10:00', type: 'Theory', weight: 1 }]);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Subject name is required');
    if (slots.length === 0) return toast.error('Please add at least one session');
    if (minAttendance < 0 || minAttendance > 100) return toast.error('Min attendance must be 0–100');

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        slots,
        // Keep these for backward compatibility
        daysOfWeek: Array.from(new Set(slots.map(s => s.day))),
        classesPerWeek: slots.length,
        defaultWeight: slots[0]?.weight || 1,
        minAttendance: Number(minAttendance),
        color,
        autoMarkPresent,
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 blur-lg opacity-20" style={{ backgroundColor: color }}></div>
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: color }}>
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEdit ? 'Refine Subject' : 'New Academic Entry'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Configure Curriculum Details
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name & Quick Picks */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Subject Identifier</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Advanced Calculus..."
              className="premium-input text-base"
              maxLength={100}
              autoFocus
            />
          </div>
          {!isEdit && (
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button 
                  key={p} 
                  type="button" 
                  onClick={() => setName(p)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sessions Manager */}
        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Active Sessions
            </label>
            <button 
              type="button" 
              onClick={addSlot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-glow-sm"
            >
              <Plus className="w-3 h-3" /> Add Session
            </button>
          </div>

          <div className="space-y-3">
            {slots.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No sessions scheduled yet.</p>
              </div>
            ) : (
              slots.map((slot, idx) => (
                <div key={idx} className="glass-card p-4 border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 space-y-4 animate-slide-up">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Day Picker */}
                    <div className="flex-1">
                      <select 
                        value={slot.day} 
                        onChange={(e) => updateSlot(idx, 'day', Number(e.target.value))}
                        className="premium-input h-12 text-xs font-black uppercase"
                      >
                        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                    </div>

                    {/* Weight / Type Toggle */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateSlot(idx, 'type', 'Theory');
                          updateSlot(idx, 'weight', 2);
                        }}
                        className={`flex-1 sm:flex-none px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          slot.weight >= 2 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-glow-sm' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <BookType className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase">Theory ×2</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateSlot(idx, 'type', 'Lab');
                          updateSlot(idx, 'weight', 1);
                        }}
                        className={`flex-1 sm:flex-none px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          slot.weight === 1 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-glow-sm' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <FlaskConical className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase">Lab ×1</span>
                      </button>
                    </div>

                    {/* Remove */}
                    <button 
                      type="button" 
                      onClick={() => removeSlot(idx)}
                      className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Min Attendance & Color Palette - Condensed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-400" />
              Goal (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={minAttendance}
                onChange={(e) => setMinAttendance(e.target.value)}
                min="0" max="100"
                className="premium-input font-black text-xl text-center pr-10 h-14"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400" />
              Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all relative flex items-center justify-center ${
                    color === c ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-Mark Present Toggle */}
        <div className="space-y-3 p-4 bg-indigo-50/35 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoMarkPresent} 
              onChange={(e) => setAutoMarkPresent(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Auto-Mark Present
              </span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Automatically assume present for past sessions unless manually marked absent.
              </p>
            </div>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="px-8 py-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex-1">Abort</button>
          <button type="submit" disabled={loading} className="btn-premium flex-[2]">
            {loading ? 'Processing...' : isEdit ? 'Update Curriculum' : 'Add to Curriculum'}
          </button>
        </div>
      </form>
    </div>
  );
}

