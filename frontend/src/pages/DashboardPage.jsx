import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubjects } from '../context/SubjectContext';
import SubjectCard from '../components/SubjectCard';
import SubjectModal from '../components/SubjectModal';
import MarkAttendanceModal from '../components/MarkAttendanceModal';
import api from '../utils/api';
import toast from 'react-hot-toast';
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
      
      {/* 🚀 HERO SECTION - VIBRANT ELITE */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 shadow-2xl group">
        {/* Dynamic Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-16 gap-12">
          <div className="max-w-2xl space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-glow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" /> Intelligence Active
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] text-slate-950 dark:text-white">
              Master Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Academic</span> Destiny.
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-bold max-w-lg leading-relaxed mx-auto md:mx-0">
              Sync complete. <span className="text-slate-900 dark:text-white underline decoration-indigo-500/30 underline-offset-4">{user?.name?.split(' ')[0]}</span>, your curriculum is currently at <span className="text-indigo-600">Peak Performance</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5 pt-4">
              <button onClick={() => setShowSubjectModal(true)} className="btn-premium w-full sm:w-auto py-5 px-10 text-lg shadow-glow">
                New Subject <Plus className="w-6 h-6" />
              </button>
              <button 
                onClick={() => exportDashboardToPDF(enrichedSubjects, user?.name || 'Student')} 
                className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-all flex items-center justify-center gap-3 shadow-xl group/btn"
              >
                Sync Report <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-1/3 aspect-square hidden md:block">
            <div className="absolute inset-0 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="relative z-10 w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-700">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-up">
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
      {showSubjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-3xl animate-fade-in">
          <div className="glass-card w-full max-w-lg bg-white/90 dark:bg-slate-900/90 shadow-glow-lg animate-slide-up border-white/20">
            <SubjectModal onClose={() => setShowSubjectModal(false)} onSave={handleCreateSubject} />
          </div>
        </div>
      )}
      {editSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-3xl animate-fade-in">
          <div className="glass-card w-full max-w-lg bg-white/90 dark:bg-slate-900/90 shadow-glow-lg animate-slide-up border-white/20">
            <SubjectModal subject={editSubject} onClose={() => setEditSubject(null)} onSave={handleUpdateSubject} />
          </div>
        </div>
      )}
      {markSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-3xl animate-fade-in">
          <div className="glass-card w-full max-w-lg bg-white/90 dark:bg-slate-900/90 shadow-glow-lg animate-slide-up border-white/20">
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
        </div>
      )}
    </div>
  );
}
