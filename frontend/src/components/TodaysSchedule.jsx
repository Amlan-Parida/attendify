import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';

export default function TodaysSchedule({ subjects, onMark }) {
  const today = new Date().getDay();
  
  // Flatten all subjects into their individual slots for today
  const todaysSlots = subjects.flatMap((subject) => {
    // If subject has slots, filter those for today
    if (subject.slots && subject.slots.length > 0) {
      return subject.slots
        .filter((slot) => slot.day === today)
        .map((slot) => ({ ...slot, subject }));
    }
    
    // Fallback for legacy subjects using daysOfWeek
    if (subject.daysOfWeek?.includes(today)) {
      return [{
        day: today,
        startTime: '00:00',
        weight: subject.defaultWeight || 1,
        type: (subject.defaultWeight || 1) >= 2 ? 'Theory' : 'Lab',
        subject
      }];
    }
    
    return [];
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysSlots.length === 0) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-black text-slate-900 dark:text-white">Day Off!</p>
          <p className="text-sm font-bold text-slate-500">No sessions scheduled for today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Daily Sessions</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {todaysSlots.length} session{todaysSlots.length !== 1 ? 's' : ''} active
            </p>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory hide-scrollbar pb-4 -mx-6 px-6 md:-mx-8 md:px-8 sm:mx-0 sm:px-0 sm:pb-0">
        {todaysSlots.map((slot, idx) => {
          const sub = slot.subject;
          
          // Calculate specific what-if-miss parameters for this slot
          const slotWeight = slot.weight || 1;
          const newConducted = (sub.conducted || 0) + slotWeight;
          const newPercentage = newConducted > 0 ? ((sub.attended || 0) / newConducted) * 100 : 0;
          const isSafeToBunk = newPercentage >= (sub.minAttendance || 75);
          
          return (
            <div
              key={`${sub._id}-${idx}`}
              className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 shadow-sm hover:shadow-lg w-[85vw] sm:w-auto shrink-0 snap-center"
            >
              <div className="flex items-center gap-5 min-w-0 flex-1">
                <div className="w-2 h-12 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: sub.color }}></div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-slate-900 dark:text-white text-lg break-words tracking-tight leading-tight mb-1" title={sub.name}>
                    {sub.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${slot.type === 'Theory' ? 'bg-indigo-50/50 border-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' : 'bg-emerald-50/50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'}`}>
                      {slot.type || 'Theory'} ×{slot.weight || 1}
                    </span>
                    {slot.startTime !== '00:00' && (
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest shadow-inner">
                        <Clock className="w-3 h-3 text-slate-400" /> {slot.startTime}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest shadow-inner">
                      Current: <span className={sub.percentage < sub.minAttendance ? 'text-red-500' : 'text-emerald-500'}>{sub.percentage}%</span>
                    </span>
                  </div>
                  
                  {/* Bunk Advisory Badge */}
                  <div className="mt-3">
                    {sub.conducted === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 shadow-sm">
                        No History
                      </span>
                    ) : isSafeToBunk ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Safe to Bunk <span className="opacity-75 normal-case tracking-normal">(drops to {newPercentage.toFixed(1)}%)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-200 dark:border-red-500/20 shadow-sm animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> Attend Class! <span className="opacity-75 normal-case tracking-normal">(drops to {newPercentage.toFixed(1)}%)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 dark:border-white/5 sm:border-0">
                <button
                  onClick={() => onMark(sub, slot)}
                  className="w-12 h-12 rounded-[1rem] bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-glow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                  title="Mark Present"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

