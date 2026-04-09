import React, { useMemo } from 'react';
import { Sparkles, BrainCircuit, Command } from 'lucide-react';

export default function BunkersAssistant({ subjects, user }) {
  const message = useMemo(() => {
    if (!subjects || subjects.length === 0) return "Add some subjects and I'll tell you when you can sleep in! 😴";

    const today = new Date().getDay();
    const tomorrow = (today + 1) % 7;

    // Find subjects tomorrow
    const tomorrowSubjects = subjects.filter(s => s.daysOfWeek?.includes(tomorrow));

    if (tomorrowSubjects.length === 0) {
      return "No classes tomorrow! Enjoy your day off. 🎉";
    }

    // Find if any tomorrow subject is critical
    const critical = tomorrowSubjects.find(s => s.status === 'critical' || s.classesNeeded > 0);
    
    if (critical) {
      return `Hey ${user?.name?.split(' ')[0] || 'there'}, you have ${critical.name} tomorrow. You MUST attend it to stay on track. Don't hit snooze! ⏰`;
    }

    // Find if all tomorrow subjects are very safe
    const allSafe = tomorrowSubjects.every(s => s.canMiss > 0);
    if (allSafe) {
      return `Good news! You're safe in all your classes tomorrow (${tomorrowSubjects.map(s => s.name).join(', ')}). You can sleep in! 🛌`;
    }

    return `You have ${tomorrowSubjects.length} class(es) tomorrow. Keep up the good work! 🔥`;

  }, [subjects, user]);

  return (
    <div className="relative group overflow-hidden rounded-[2rem] bg-indigo-600 dark:bg-slate-950 p-1 shadow-glow-sm hover:shadow-glow transition-all duration-700 animate-slide-up">
      {/* Animated Mesh Gradient Background - Adaptive */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-600 to-indigo-700 dark:from-primary-900 dark:via-indigo-950 dark:to-surface-950 opacity-90 dark:opacity-80"></div>
      
      <div className="relative z-10 p-5 md:p-6 flex flex-col md:flex-row gap-5 items-center text-center md:text-left">
        {/* AI Brain Icon - Scaled Down */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-white/40 dark:bg-primary-500 blur-lg opacity-30 animate-pulse"></div>
          <div className="relative w-12 h-12 rounded-[1rem] bg-white/20 backdrop-blur-2xl flex items-center justify-center border border-white/20 shadow-glow-sm">
            <BrainCircuit className="w-7 h-7 text-white dark:text-primary-400 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600 dark:border-surface-950 animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
              <Command className="w-4 h-4 text-white/70" />
              Bunker's Intel
            </h3>
            <div className="px-2.5 py-0.5 bg-white/20 border border-white/30 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5">
              <Sparkles className="w-2.5 h-2.5" />
              Live Simulation
            </div>
          </div>
          
          <p className="text-white text-sm md:text-base font-bold leading-snug">
            "{message}"
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-[8px] font-black text-white/60 uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-white/60"></div>
              Predictive Engine
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-white/60 uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-white/60"></div>
              Session-Aware
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
