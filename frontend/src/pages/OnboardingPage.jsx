import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubjects } from '../context/SubjectContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AiScanner from '../components/AiScanner';
import {
  GraduationCap, BookOpen, Search, CheckCircle2, AlertTriangle, ArrowRight, 
  Plus, Calendar, Sparkles, Check, ChevronRight, X, Globe
} from 'lucide-react';

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const { fetchSubjects } = useSubjects();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [wizardStep, setWizardStep] = useState(1); // 1: Subjects, 2: Holidays, 3: Final Review
  
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(null);

  // Wizard States
  const [subjects, setSubjects] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!college || !year || !section) return toast.error('Please fill all fields');
    
    setLoading(true);
    try {
      const { data } = await api.get(`/templates/search?college=${encodeURIComponent(college)}&year=${encodeURIComponent(year)}&section=${encodeURIComponent(section)}`);
      if (data.template) {
        setTemplate(data.template);
        setStep(2);
      } else {
        setTemplate(null);
        setStep(2);
      }
    } catch (err) {
      console.error('Search failed', err);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneTemplate = async () => {
    setLoading(true);
    try {
      await api.post(`/templates/${template._id}/clone`);

      await completeOnboarding({ college: template.college, year: template.year, section: template.section });
      fetchSubjects();
      toast.success('Template applied! Welcome to your dashboard.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Clone failed', err);
      toast.error('Failed to apply template');
    } finally {
      setLoading(false);
    }
  };


  const handleSaveTemplate = async () => {
    // Filter out subjects with empty names
    const activeSubjects = subjects.filter(s => s.name && s.name.trim() !== '');
    if (activeSubjects.length === 0) {
      return toast.error('Please add at least one subject with a name');
    }

    setLoading(true);
    try {
      // 1. Create personal subjects
      for (const sub of activeSubjects) {
        const payload = {
          name: sub.name,
          color: sub.color || '#6366f1',
          minAttendance: sub.minAttendance || 75,
          defaultWeight: sub.defaultWeight || 1,
          classesPerWeek: sub.classesPerWeek,
          daysOfWeek: sub.daysOfWeek || [],
          slots: sub.slots && sub.slots.length > 0 ? sub.slots : (sub.daysOfWeek ? sub.daysOfWeek.map(day => ({
            day,
            startTime: '09:00',
            endTime: '10:00',
            type: 'Theory',
            weight: 1
          })) : [])
        };
        const { data: createdSubject } = await api.post('/subjects', payload);
        
        // 2. Create holidays for this subject
        for (const hol of holidays) {
          await api.post('/attendance', {
            subjectId: createdSubject._id,
            date: hol.date,
            status: 'Holiday',
            note: hol.name || 'Holiday'
          });
        }
      }

      // 3. Create the template for other users at the same college/year/section to search and use
      try {
        await api.post('/templates', {
          college,
          year,
          section,
          subjects: activeSubjects.map(sub => ({
            name: sub.name,
            classesPerWeek: sub.classesPerWeek,
            daysOfWeek: sub.daysOfWeek || [],
            slots: sub.slots && sub.slots.length > 0 ? sub.slots : (sub.daysOfWeek ? sub.daysOfWeek.map(day => ({
              day,
              startTime: '09:00',
              endTime: '10:00',
              type: 'Theory',
              weight: 1
            })) : []),
            minAttendance: sub.minAttendance || 75,
            color: sub.color || '#6366f1'
          })),
          holidays: holidays.map(h => ({
            date: h.date,
            name: h.name || 'Holiday'
          }))
        });
      } catch (templateErr) {
        // If it already exists (409) or fails, log it but don't block the onboarding flow
        console.warn('Template creation skipped or failed:', templateErr.response?.data?.message || templateErr.message);
      }

      // 4. Mark onboarding complete in backend
      await api.post('/templates/skip');
      
      // 4. Update local auth state and navigate
      await completeOnboarding({ college, year, section });
      await fetchSubjects();
      toast.success('Your dashboard is ready!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Save failed', err);
      toast.error(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => setSubjects([...subjects, { name: '', classesPerWeek: 3, daysOfWeek: [], color: '#6366f1' }]);
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i, f, v) => {
    const next = [...subjects];
    next[i][f] = v;
    setSubjects(next);
  };
  
  const toggleSubjectDay = (i, day) => {
    const next = [...subjects];
    if (!next[i].daysOfWeek) next[i].daysOfWeek = [];
    if (next[i].daysOfWeek.includes(day)) {
      next[i].daysOfWeek = next[i].daysOfWeek.filter(d => d !== day);
    } else {
      next[i].daysOfWeek.push(day);
    }
    // Update classesPerWeek based on days
    next[i].classesPerWeek = Math.max(1, next[i].daysOfWeek.length);
    setSubjects(next);
  };

  const addHoliday = () => setHolidays([...holidays, { name: '', date: new Date().toISOString().split('T')[0] }]);
  const removeHoliday = (i) => setHolidays(holidays.filter((_, idx) => idx !== i));
  const updateHoliday = (i, f, v) => {
    const next = [...holidays];
    next[i][f] = v;
    setHolidays(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-aurora p-4 sm:p-6 md:p-12 pt-24 sm:pt-6">
      <div className="w-full max-w-xl glass-card animate-fade-in group">
        
        {/* Header */}
        <div className="relative p-8 text-center overflow-hidden border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1]"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow rotate-3 group-hover:rotate-6 transition-transform duration-700">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-955 dark:text-white mb-1 tracking-tighter">
              Welcome, <span className="text-indigo-600">{(user?.full_name || user?.name || 'Student').split(' ')[0]}</span>!
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Let's set up your profile
            </p>
          </div>
          
          {step === 3 && (
            <div className="flex justify-center gap-2 mt-6 relative z-10">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${wizardStep === i ? 'w-12 bg-indigo-600' : 'w-3 bg-slate-200 dark:bg-slate-800'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="p-8 md:p-10">
          {step === 1 ? (
            <form onSubmit={handleSearch} className="space-y-6 animate-slide-up">
              <div className="space-y-2">
                <label className="label">College / University Name</label>
                <div className="relative group/input">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
                  <input type="text" className="premium-input pl-16 h-16" value={college} onChange={e => setCollege(e.target.value)} placeholder="e.g. Stanford University" autoFocus required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="label">Academic Year (1-8)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="8" 
                    className="premium-input h-16" 
                    value={year} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || (Number(val) >= 1 && Number(val) <= 8)) {
                        setYear(val);
                      }
                    }} 
                    onKeyDown={e => {
                      if (['e', 'E', '-', '+', '.'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="e.g. 1" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">Section / Batch</label>
                  <input type="text" className="premium-input h-16" value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. CS-A" required />
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <button type="submit" disabled={loading} className="btn-premium w-full h-16 text-lg group">
                  {loading ? 'Searching...' : (
                    <>Search for Existing Template <Search className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (!college || !year || !section) return toast.error('Please fill in college, year, and section details first');
                    setStep(3);
                  }} 
                  disabled={loading} 
                  className="w-full flex items-center justify-center gap-3 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Setup schedule manually
                </button>
              </div>
            </form>
          ) : step === 2 ? (
            <div className="animate-slide-up space-y-8">
              {template ? (
                <>
                  <div className="glass-card bg-emerald-500/5 border-emerald-500/20 p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Template Found</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Created by {template.creator?.name || 'Student'} • {template.subjects?.length || 0} subjects configured
                    </p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1 h-16">Go Back</button>
                    <button onClick={handleCloneTemplate} disabled={loading} className="btn-premium flex-1 h-16">
                      {loading ? 'Applying...' : 'Use Template'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="glass-card bg-amber-500/5 border-amber-500/20 p-8 mb-8">
                    <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">No Template Found</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      No schedule template found for <strong>{college}</strong>.
                      Let's set up your subjects manually.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button onClick={() => setStep(3)} className="btn-premium w-full h-16 text-lg group">
                      Setup Manually <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => setStep(1)} className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                      Retry Search
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : step === 3 ? (
            <div className="animate-slide-up space-y-8">
              
              {/* Wizard Step 1: Subjects */}
              {wizardStep === 1 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Step 1: Your Subjects</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Add your current subjects</p>
                    </div>
                  </div>
                  
                  <div className="glass-card p-1 border-indigo-500/10">
                    <AiScanner 
                      mode="subjects" 
                      college={college} 
                      onDataParsed={(data) => {
                        if (data.subjects && Array.isArray(data.subjects)) {
                          setSubjects([...subjects, ...data.subjects]);
                          if (data.subjects.length === 0) toast.error('No subjects detected in this file.');
                        } else if (data.text) {
                          toast.error('Could not identify a table structure. Please try a clearer image.');
                        }
                      }} 
                    />
                  </div>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/5"></div></div>
                    <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]"><span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Manual Entry</span></div>
                  </div>

                  {subjects.length > 0 ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {subjects.map((sub, i) => (
                          <div key={i} className="glass-card p-6 border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30 space-y-4">
                            <div className="flex items-center gap-3">
                              <input type="text" className="premium-input h-12 text-sm flex-grow" placeholder="Subject Name" value={sub.name} onChange={e => updateSubject(i, 'name', e.target.value)} />
                              
                              <div className="relative w-20 shrink-0">
                                <input 
                                  type="number" 
                                  min="0" max="100"
                                  className="premium-input h-12 text-xs text-center pr-5" 
                                  value={sub.minAttendance || 75} 
                                  onChange={e => updateSubject(i, 'minAttendance', Number(e.target.value))} 
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">%</span>
                              </div>

                              <button onClick={() => removeSubject(i)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex justify-between gap-1">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => toggleSubjectDay(i, idx)}
                                  className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all duration-300 ${
                                    sub.daysOfWeek?.includes(idx)
                                      ? 'bg-indigo-600 text-white shadow-glow-sm scale-110'
                                      : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50'
                                  }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button onClick={addSubject} className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[10px] text-slate-400 font-black uppercase tracking-widest hover:border-indigo-500/50 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Add Subject
                        </button>
                      </div>

                      {subjects.every(sub => sub.name && sub.name.trim() !== '') ? (
                        <button 
                          onClick={() => setWizardStep(2)} 
                          className="btn-premium w-full h-16 text-lg group mt-4 animate-scale-in"
                        >
                          Proceed to Holidays <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <div className="text-center text-xs font-semibold text-slate-400 py-3 uppercase tracking-wider animate-pulse">
                          Please enter subject names to proceed
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={addSubject} className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[10px] text-slate-400 font-black uppercase tracking-widest hover:border-indigo-500/50 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 mt-4">
                      <Plus className="w-4 h-4" /> Set Up Subjects Manually
                    </button>
                  )}
                </div>
              )}

              {/* Wizard Step 2: Holidays */}
              {wizardStep === 2 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Step 2: Holidays & Breaks</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Add scheduled off-days</p>
                    </div>
                  </div>
                  
                  <div className="glass-card p-1 border-indigo-500/10">
                    <AiScanner 
                      mode="holidays" 
                      college={college} 
                      onDataParsed={(data) => {
                        if (data.holidays && Array.isArray(data.holidays)) {
                          setHolidays([...holidays, ...data.holidays]);
                        } else {
                          toast.error('No holiday dates detected.');
                        }
                      }} 
                    />
                  </div>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/5"></div></div>
                    <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]"><span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Manual Entry</span></div>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {holidays.map((hol, i) => (
                      <div key={i} className="glass-card p-4 border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-4">
                        <input type="text" className="premium-input h-12 text-sm flex-1" value={hol.name} onChange={e => updateHoliday(i, 'name', e.target.value)} />
                        <button onClick={() => removeHoliday(i)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
                      </div>
                    ))}
                    <button onClick={addHoliday} className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[10px] text-slate-400 font-black uppercase tracking-widest hover:border-indigo-500/50 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add Holiday
                    </button>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button onClick={() => setWizardStep(1)} className="btn-secondary flex-1 h-16">Back</button>
                    <button onClick={() => setWizardStep(3)} className="btn-premium flex-1 h-16">Review Details</button>
                  </div>
                </div>
              )}

              {/* Wizard Step 3: Final Review */}
              {wizardStep === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Step 3: Review Details</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Confirm your schedule setup</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card p-8 border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Added Subjects</h4>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-600/10 px-3 py-1 rounded-full">{subjects.length} Units</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {subjects.map((s, i) => (
                          <span key={i} className="text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 uppercase tracking-tight">{s.name}</span>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card p-8 border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Holidays</h4>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-600/10 px-3 py-1 rounded-full">{holidays.length} Events</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {holidays.map((h, i) => (
                          <span key={i} className="text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 uppercase tracking-tight">{h.name || 'Holiday'}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-card bg-indigo-600/5 border-indigo-600/20 p-6 flex gap-4">
                    <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                    <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest leading-relaxed">
                      This will set up your personalized college attendance tracker dashboard.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setWizardStep(2)} className="btn-secondary flex-1 h-16">Back</button>
                    <button onClick={handleSaveTemplate} disabled={loading} className="btn-premium flex-1 h-16 flex items-center justify-center gap-3">
                      {loading ? 'Setting up...' : <><Check className="w-6 h-6" /> Get Started</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
