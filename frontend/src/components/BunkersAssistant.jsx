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
    <div className="relative group overflow-hidden rounded-[2rem] bg-white dark:bg-slate-950 p-1 shadow-xl dark:shadow-2xl hover:shadow-2xl transition-all duration-700 animate-slide-up border border-slate-200 dark:border-white/10">
      {/* Animated Mesh Gradient Background - Adaptive */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-fuchsia-50 to-violet-100 dark:from-indigo-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40 opacity-90 dark:opacity-80"></div>
      
      {/* Carbon Fibre Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-center sm:items-start text-center sm:text-left bg-white/40 dark:bg-slate-950/40 backdrop-blur-md rounded-[1.8rem]">
        {/* AI Brain Icon - Premium glowing orb */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-indigo-500/30 blur-xl opacity-60 animate-pulse-slow"></div>
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[1.2rem] bg-white dark:bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/50 dark:border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-500">
            <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-[3px] border-white dark:border-slate-900 shadow-sm animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-3 flex-1 min-w-0 flex flex-col items-center md:items-start">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
              <Command className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Bunker's Intel
            </h3>
            <div className="px-3 py-1 bg-indigo-600/10 dark:bg-white/10 border border-indigo-600/20 dark:border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 shadow-inner">
              <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400 animate-pulse" />
              Live Simulation
            </div>
          </div>
          
          <p className="text-slate-800 dark:text-slate-200 text-base md:text-lg font-bold leading-relaxed break-words w-full">
            {message}
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-5 pt-2 flex-wrap">
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              Predictive Engine
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Session-Aware
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
