import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubjects } from '../context/SubjectContext';
import SubjectCard from '../components/SubjectCard';
import SubjectModal from '../components/SubjectModal';
import MarkAttendanceModal from '../components/MarkAttendanceModal';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import {
  Plus, RefreshCw, AlertTriangle, CheckCircle2, AlertCircle,
  BookOpen, Target, Zap, Sparkles,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportDashboardToPDF } from '../utils/exportPdf';
import BunkersAssistant from '../components/BunkersAssistant';
import TodaysSchedule from '../components/TodaysSchedule';

import { computeStats, getDashboardSummary, getGamification } from '../utils/analyticsEngine';

export default function DashboardPage() {
  const { user } = useAuth();
  const { subjects, fetchSubjects, createSubject, updateSubject, deleteSubject, loadingSubjects } = useSubjects();
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [markSubject, setMarkSubject] = useState(null);
  const [markSlot, setMarkSlot] = useState(null);
  const [predictSubject, setPredictSubject] = useState(null);
  const [targetPct, setTargetPct] = useState(75);
  const [predResult, setPredResult] = useState(null);
  const [predLoading, setPredLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Disable background scrolling when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showSubjectModal || !!editSubject || !!markSubject;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSubjectModal, editSubject, markSubject]);

  const handleCreateSubject = async (payload) => {
    await createSubject(payload);
    toast.success('Subject created!');
    fetchSubjects();
  };

  const handleUpdateSubject = async (payload) => {
    await updateSubject(editSubject._id, payload);
    toast.success('Subject updated!');
    setEditSubject(null);
    fetchSubjects();
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject and all its attendance records?')) return;
    await deleteSubject(id);
    toast.success('Subject deleted');
    fetchSubjects();
  };

  const handlePredict = async () => {
    if (!predictSubject) return;
    setPredLoading(true);
    try {
      const stats = computeStats(predictSubject.attendance || [], predictSubject, user?.session_end_date, targetPct);
      setPredResult({ ...stats, targetPercentage: targetPct });
    } catch (err) {
      toast.error('Prediction failed');
    } finally {
      setPredLoading(false);
    }
  };

  // Compute analytics locally
  const enrichedSubjects = subjects.map(s => {
    const stats = computeStats(s.attendance || [], s, user?.session_end_date);
    return { ...s, ...stats };
  });

  const summary = getDashboardSummary(enrichedSubjects);
  const allRecords = subjects.flatMap(s => s.attendance || []);
  const gamification = getGamification(allRecords);

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-6 space-y-12">
      
      {/* 🚀 PREMIUM COMPACT HEADER */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl group bg-white dark:bg-slate-950 animate-slide-up">
        {/* Animated Glow Backing */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-violet-500/10 dark:from-indigo-600/20 dark:via-fuchsia-600/20 dark:to-violet-600/20 animate-gradient-x opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Unique Textures & Patterns */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] dark:opacity-[0.05] pointer-events-none"></div>
        <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[60px] rounded-full animate-pulse-slow"></div>
        
        {/* Glassmorphic Inner Container */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 gap-6 bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl border-t border-white/80 dark:border-white/5 m-0">
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300 shadow-sm dark:shadow-inner animate-fade-in">
              <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400 animate-pulse" /> Executive Dashboard
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-none animate-slide-up animate-stagger-1">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400 animate-gradient-x inline-block hover:scale-105 transition-transform cursor-default">{user?.name?.split(' ')[0]}</span>
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold tracking-tight animate-slide-up animate-stagger-2">
              Curriculum running at <span className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 shadow-sm">Peak Performance</span>.
            </p>
          </div>

          <div className="flex items-center gap-5 sm:gap-6 shrink-0 animate-slide-up animate-stagger-3">
            <div className="flex flex-col items-end text-right">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Current Status</span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white drop-shadow-sm">{gamification.rank}</span>
            </div>
            
            {/* Minimal Circular Progress */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-white/50 dark:bg-slate-900/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] dark:shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow duration-700">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="42%" fill="none" strokeWidth="4" className="stroke-indigo-100 dark:stroke-white/5" />
                <circle 
                  cx="50%" cy="50%" r="42%" 
                  fill="none" 
                  strokeWidth="4" 
                  strokeDasharray="264" 
                  strokeDashoffset={264 - (264 * gamification.overallPct) / 100} 
                  className="stroke-indigo-500 dark:stroke-indigo-400 transition-all duration-1000 ease-out" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white leading-none">{Math.round(gamification.overallPct)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📚 SUBJECTS GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Your Curriculum</h2>
          </div>
          <button onClick={fetchSubjects} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loadingSubjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card h-72 animate-pulse bg-slate-200/50 dark:bg-slate-800/50 border-transparent shadow-none"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-slide-up">
            {enrichedSubjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                onEdit={(s) => setEditSubject(s)}
                onDelete={handleDeleteSubject}
                onMark={(s) => setMarkSubject(s)}
              />
            ))}

            {/* 🆕 ADD NEW SUBJECT TILE */}
            <button 
              onClick={() => setShowSubjectModal(true)}
              className="glass-card group relative overflow-hidden flex flex-col items-center justify-center gap-4 min-h-[220px] border-dashed border-2 border-indigo-200 dark:border-white/10 bg-indigo-50/30 dark:bg-slate-900/40 hover:bg-indigo-50 dark:hover:bg-slate-900 transition-all duration-500 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-glow-sm">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Expand Curriculum</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Register a new subject</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 🍱 BENTO GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        <div className="md:col-span-8 animate-slide-up animate-stagger-1">
          <BunkersAssistant subjects={enrichedSubjects} user={user} />
        </div>

        {/* Quick Stats */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4 animate-slide-up animate-stagger-2">
          {[
            { label: 'Total', value: summary.total, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { label: 'Safe', value: summary.safe, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Alert', value: summary.warning, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Critical', value: summary.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-5 flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] h-full border-slate-200 dark:border-none bg-white dark:bg-slate-900/80 shadow-md">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="mt-4">
                <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Predictor */}
        <div className="md:col-span-6 animate-slide-up animate-stagger-3 h-full">
          <div className="glass-card p-6 h-full relative overflow-hidden group border-slate-200 dark:border-none bg-white dark:bg-slate-900/80 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <Zap className="w-5 h-5 text-indigo-500" /> Strategy Lab
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <select
                className="premium-input text-sm h-12"
                value={predictSubject?._id || ''}
                onChange={(e) => {
                  const s = enrichedSubjects.find((s) => s._id === e.target.value);
                  setPredictSubject(s || null);
                  setPredResult(null);
                }}
              >
                <option value="">Select subject...</option>
                {enrichedSubjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <div className="relative">
                <input
                  type="number" min="1" max="100" value={targetPct}
                  onChange={(e) => { setTargetPct(Number(e.target.value)); setPredResult(null); }}
                  className="premium-input text-sm h-12 pl-10"
                />
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <button onClick={handlePredict} disabled={!predictSubject || predLoading} className="btn-premium w-full h-12 text-sm">
              {predLoading ? 'Analyzing...' : 'Run Simulation'}
            </button>
            {predResult && (
              <div className="mt-6 flex gap-3 animate-slide-up">
                <div className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{predResult.targetPercentage}%</p>
                </div>
                <div className={`flex-1 p-3 rounded-2xl border text-center ${
                  predResult.classesNeeded > 0 ? 'bg-red-500/5 border-red-500/20 text-red-600' : 'bg-green-500/5 border-green-500/20 text-green-600'
                }`}>
                  <p className="text-[8px] font-black uppercase tracking-widest">{predResult.classesNeeded > 0 ? 'Need' : 'Miss'}</p>
                  <p className="text-lg font-black">{Math.abs(predResult.classesNeeded || predResult.canMiss)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="md:col-span-6 animate-slide-up animate-stagger-4 h-full">
          <div className="h-full glass-card border-slate-200 dark:border-none bg-white dark:bg-slate-900/80 p-0 overflow-hidden shadow-md">
            <TodaysSchedule subjects={enrichedSubjects} onMark={(s, slot) => {
              setMarkSubject(s);
              setMarkSlot(slot);
            }} />
          </div>
        </div>

      </div>

      {/* Modals */}
      {showSubjectModal && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen top-0 left-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-fade-in"
          onClick={() => setShowSubjectModal(false)}
        >
          <div 
            className="glass-card w-full max-w-lg bg-white/90 dark:bg-slate-900/90 shadow-glow-lg animate-slide-up border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <SubjectModal onClose={() => setShowSubjectModal(false)} onSave={handleCreateSubject} />
          </div>
        </div>,
        document.body
      )}
      {editSubject && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen top-0 left-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-fade-in"
          onClick={() => setEditSubject(null)}
        >
          <div 
            className="glass-card w-full max-w-lg bg-white/90 dark:bg-slate-900/90 shadow-glow-lg animate-slide-up border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <SubjectModal subject={editSubject} onClose={() => setEditSubject(null)} onSave={handleUpdateSubject} />
          </div>
        </div>,
        document.body
      )}
      {markSubject && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen top-0 left-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-fade-in"
          onClick={() => { setMarkSubject(null); setMarkSlot(null); }}
        >
          <div 
            className="glass-card w-full max-w-md bg-white/90 dark:bg-slate-900/90 shadow-glow-lg animate-slide-up border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <MarkAttendanceModal
              subject={markSubject}
              slot={markSlot}
              onClose={() => { setMarkSubject(null); setMarkSlot(null); }}
              onSuccess={(status) => { 
                fetchSubjects(); 
                if (status === 'Present') confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#4f46e5', '#3b82f6'] });
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
