import React, { useState } from 'react';
import {
  Pencil, Trash2, AlertCircle,
  BookOpen, ChevronDown, ChevronUp, Info,
  Sparkles, ShieldCheck, ShieldAlert, Target
} from 'lucide-react';
import { formatPct, whatIfMiss } from '../utils/attendanceUtils';

const StatusBadge = ({ status }) => {
  const map = {
    safe: { label: 'Secured', icon: ShieldCheck, class: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
    warning: { label: 'At Risk', icon: AlertCircle, class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    critical: { label: 'Danger', icon: ShieldAlert, class: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
    'no-data': { label: 'No Data', icon: Info, class: 'bg-surface-500/10 text-surface-500 border-surface-500/20' },
  };
  const s = map[status] || map['no-data'];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500 ${s.class}`}>
      <Icon className="w-2.5 h-2.5" />
      {s.label}
    </span>
  );
};

export default function SubjectCard({ subject, onEdit, onDelete, onMark }) {
  const [expanded, setExpanded] = useState(false);

  const {
    name, color, minAttendance,
    percentage = 0, attended = 0, conducted = 0,
    absences = 0, massBunks = 0, holidays = 0,
    classesNeeded = 0, canMiss = 0, status = 'no-data',
    smartForecast,
    defaultWeight = 1
  } = subject;

  const wif = whatIfMiss(attended, conducted);
  const isTheory = (defaultWeight || 1) >= 2;
  const goal = minAttendance;

  // Build the circular progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const safePct = Math.min(percentage, 100);
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  const ringColor =
    status === 'safe' ? '#22c55e'
    : status === 'warning' ? '#f59e0b'
    : status === 'critical' ? '#ef4444'
    : '#94a3b8';

  return (
    <div className="card group relative overflow-hidden flex flex-col justify-between border-l-4 hover:border-l-8 p-5"
      style={{ borderLeftColor: color || '#6366f1' }}>
      
      {/* Glossy Overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 dark:bg-black/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="relative">
        {/* Header - More Compact */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/20"
              style={{ backgroundColor: `${color}15`, color }}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-950 dark:text-white text-xl md:text-2xl truncate tracking-tighter" title={name}>
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${isTheory ? 'bg-indigo-600/10 text-indigo-600' : 'bg-emerald-600/10 text-emerald-600'}`}>
                  {isTheory ? 'Theory ×2' : 'Lab ×1'}
                </span>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {goal}% Target
                </span>
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Stats Row - Compact Hybrid */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72" className="relative">
              <circle cx="36" cy="36" r={radius} fill="none" className="stroke-surface-50 dark:stroke-surface-800/50" strokeWidth="6" />
              <circle
                cx="36" cy="36" r={radius} fill="none"
                stroke={ringColor} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 36 36)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-surface-900 dark:text-white">{formatPct(percentage)}</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1">Presence</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{attended}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1">Total</p>
              <p className="text-xl font-black text-slate-950 dark:text-white leading-none">{conducted}</p>
            </div>
          </div>
        </div>

        {/* Forecast - Slimmer */}
        <div className="mb-3">
          {smartForecast && (
            <div className="px-4 py-3 bg-indigo-50 dark:bg-primary-500/10 rounded-2xl border border-indigo-100 dark:border-primary-500/10 relative overflow-hidden group/forecast">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <p className="text-xs font-black text-slate-800 dark:text-surface-300 uppercase tracking-tight">
                  {classesNeeded > 0 
                    ? `Attend ${classesNeeded} more sessions.` 
                    : `Safe! Can miss ${canMiss} sessions.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Simulator Toggle - Minimal */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between py-1 px-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all mb-1"
        >
          <div className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-surface-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-surface-400">Risk Simulation</span>
          </div>
          {expanded ? <ChevronUp className="w-3 h-3 opacity-40" /> : <ChevronDown className="w-3 h-3 opacity-40" />}
        </button>

        {expanded && (
          <div className="mb-3 p-3 bg-slate-900 dark:bg-black rounded-xl space-y-3 animate-slide-up shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">If missed today</span>
              <span className={`text-sm font-black ${wif.newPercentage >= minAttendance ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatPct(wif.newPercentage)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Absent', val: absences, color: 'text-surface-400' },
                { label: 'Bunks', val: massBunks, color: 'text-orange-500' },
                { label: 'Off', val: holidays, color: 'text-surface-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 rounded-lg py-1 px-2 text-center">
                  <p className="text-[7px] font-black uppercase text-white/30">{stat.label}</p>
                  <p className={`text-[11px] font-black ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Smaller/Sleek */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
        <button
          onClick={() => onMark(subject)}
          className="flex-[2] btn-premium py-2 text-xs"
        >
          <span>Mark Presence</span>
        </button>
        <button
          onClick={() => onEdit(subject)}
          className="flex-1 py-2 rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-500 hover:text-indigo-600 transition-all flex items-center justify-center"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(subject._id)}
          className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
