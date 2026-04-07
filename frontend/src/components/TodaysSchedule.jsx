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

      <div className="space-y-4">
        {todaysSlots.map((slot, idx) => {
          const sub = slot.subject;
          const isTheory = slot.weight >= 2;
          
          return (
            <div
              key={`${sub._id}-${idx}`}
              className="group relative overflow-hidden bg-white dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 flex items-center justify-between gap-4 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }}></div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 dark:text-white text-base truncate tracking-tight" title={sub.name}>
                    {sub.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isTheory ? 'text-indigo-600' : 'text-emerald-600'}`}>
                      {isTheory ? 'Theory ×2' : 'Lab ×1'}
                    </span>
                    {slot.startTime !== '00:00' && (
                      <>
                        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700">|</span>
                        <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> {slot.startTime}
                        </span>
                      </>
                    )}
                    <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700">|</span>
                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {sub.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onMark(sub, slot)}
                  className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-glow-sm"
                  title="Mark Present"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

