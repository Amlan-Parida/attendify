import React, { useState } from 'react';
import {
  Pencil, Trash2, AlertCircle,
  BookOpen, ChevronDown, ChevronUp, Info,
  Sparkles, ShieldCheck, ShieldAlert, Target
} from 'lucide-react';
import { formatPct, whatIfMiss } from '../utils/attendanceUtils';

const StatusBadge = ({ status }) => {
  const map = {
    safe: { label: 'Secured', icon: ShieldCheck, class: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/10' },
    warning: { label: 'At Risk', icon: AlertCircle, class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10' },
    critical: { label: 'Danger', icon: ShieldAlert, class: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/10' },
    'no-data': { label: 'No Data', icon: Info, class: 'bg-slate-500/10 text-slate-500 border-slate-500/10' },
  };
  const s = map[status] || map['no-data'];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm transition-all duration-300 ${s.class}`}>
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
    defaultWeight = 1,
    autoMarkPresent = false
  } = subject;

  const wif = whatIfMiss(attended, conducted);
  const isTheory = (defaultWeight || 1) >= 2;
  const goal = minAttendance;

  // Build the circular progress ring
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const safePct = Math.min(percentage, 100);
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  const ringColor =
    status === 'safe' ? '#10b981'
    : status === 'warning' ? '#f59e0b'
    : status === 'critical' ? '#ef4444'
    : '#64748b';

  return (
    <div className="glass-card group relative overflow-hidden flex flex-col justify-between border-t-4 p-5 bg-white/90 dark:bg-slate-900/90 shadow-md hover:shadow-xl transition-all duration-300"
      style={{ borderTopColor: color || '#6366f1' }}>

      {/* 🚀 PREMIUM SUBJECT CARD */}
      <div className="relative space-y-4">
        
        {/* Header (Subject Info & Status Badge) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight break-words leading-tight" title={name}>
              {name}
            </h3>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isTheory ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'}`}>
                {isTheory ? 'Theory' : 'Lab'} ×{defaultWeight || 1}
              </span>
              {autoMarkPresent && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                  Auto-Mark
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md border border-slate-200 dark:border-white/10">
                Target: {goal}%
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Compact stats grid with Premium look */}
        <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-inner">
          {/* Circular progress */}
          <div className="relative flex-shrink-0 flex items-center justify-center filter drop-shadow-md">
            <svg width="56" height="56" viewBox="0 0 64 64" className="relative">
              <circle cx="32" cy="32" r={radius} fill="none" className="stroke-slate-200 dark:stroke-white/10" strokeWidth="5" />
              <circle
                cx="32" cy="32" r={radius} fill="none"
                stroke={ringColor} strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 32 32)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-slate-900 dark:text-white drop-shadow-sm">{formatPct(percentage)}</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3 text-center divide-x divide-slate-200 dark:divide-white/10">
            <div className="flex flex-col justify-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Attended</p>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{attended}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Conducted</p>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{conducted}</p>
            </div>
          </div>
        </div>

        {/* Dynamic AI Status Prediction */}
        {smartForecast && (
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/80 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-700 dark:text-indigo-100 leading-snug">
              {classesNeeded > 0 
                ? `You must attend the next ${classesNeeded} classes to reach your target.` 
                : `You are safe. You can securely skip the next ${canMiss} classes.`}
            </p>
          </div>
        )}

        {/* Accordion Simulation Mode */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Simulation Engine
            </span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl space-y-3 border border-slate-200 dark:border-white/5 shadow-inner animate-slide-up">
              <div className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                <span className="font-bold text-slate-600 dark:text-slate-300">If missed today:</span>
                <span className={`font-black text-sm ${wif.newPercentage >= minAttendance ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatPct(wif.newPercentage)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                  <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">Absent</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{absences}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-200 dark:border-amber-500/20 shadow-sm">
                  <p className="text-[8px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-0.5">Bunks</p>
                  <p className="text-sm font-black text-amber-700 dark:text-amber-400">{massBunks}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                  <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">Holidays</p>
                  <p className="text-sm font-black text-slate-600 dark:text-slate-300">{holidays}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
        <button
          onClick={() => onMark(subject)}
          className="flex-1 btn-premium py-2 text-xs font-black"
        >
          Mark Attendance
        </button>
        <button
          onClick={() => onEdit(subject)}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 border border-slate-200/50 dark:border-white/5 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(subject._id)}
          className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
