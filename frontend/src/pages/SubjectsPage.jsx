import React, { useEffect, useState } from 'react';
import { useSubjects } from '../context/SubjectContext';
import SubjectModal from '../components/SubjectModal';
import { BookOpen, Plus, Pencil, Trash2, Search, Sparkles, Filter, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const { subjects, fetchSubjects, createSubject, updateSubject, deleteSubject, loadingSubjects } = useSubjects();
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (payload) => {
    if (editSubject) {
      await updateSubject(editSubject._id, payload);
      toast.success('Subject updated!');
      setEditSubject(null);
    } else {
      await createSubject(payload);
      toast.success('Subject added!');
      setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject and all attendance records?')) return;
    await deleteSubject(id);
    toast.success('Subject deleted');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight">Curriculum</h1>
          </div>
          <p className="text-sm font-bold text-surface-400 dark:text-surface-500 flex items-center gap-2 ml-15">
            Managing <span className="text-primary-600 dark:text-primary-400">{subjects.length} active subjects</span> in your current semester
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)} 
          className="btn-primary shadow-primary-500/20 px-8 h-14"
        >
          <Plus className="w-5 h-5" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your subjects..."
            className="input pl-14 h-14 font-bold bg-white/50 dark:bg-surface-900/50"
          />
        </div>
        <button className="h-14 px-6 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-500 hover:text-primary-500 transition-all shadow-sm flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Content */}
      {loadingSubjects ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-24 animate-pulse flex items-center gap-6">
              <div className="w-14 h-14 bg-surface-100 dark:bg-surface-800 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-surface-100 dark:bg-surface-800 rounded-full w-1/4" />
                <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded-full w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-24 text-center space-y-6">
          <div className="w-20 h-20 bg-surface-50 dark:bg-surface-800/50 rounded-3xl flex items-center justify-center mx-auto text-surface-300">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-surface-900 dark:text-white">No matches found</h3>
            <p className="text-surface-500 font-bold max-w-xs mx-auto">
              {search ? `We couldn't find any subjects matching "${search}".` : 'Your curriculum is empty. Start by adding your first subject!'}
            </p>
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="btn-secondary text-xs px-6">Clear Search</button>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
          {filtered.map((subject) => (
            <div 
              key={subject._id} 
              className="card flex flex-col sm:flex-row sm:items-center gap-6 hover:shadow-glow-sm group relative overflow-hidden border border-white/50 dark:border-surface-800/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

              <div className="flex items-center gap-6 flex-1 min-w-0 relative">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/20"
                  style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                >
                  <BookOpen className="w-7 h-7" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black text-surface-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                    {subject.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-1.5 items-center">
                    {(subject.defaultWeight || 1) >= 2 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Theory ×2
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                        Lab ×1
                      </span>
                    )}
                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
                      {subject.classesPerWeek} sessions/wk · min {subject.minAttendance}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative justify-end">
                <button
                  onClick={() => setEditSubject(subject)}
                  className="p-3 rounded-2xl bg-surface-50 dark:bg-surface-800/50 text-surface-500 hover:text-primary-600 hover:bg-white dark:hover:bg-surface-700 transition-all border border-transparent hover:border-surface-200 dark:hover:border-surface-600"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(subject._id)}
                  className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-400 hover:bg-red-600 hover:text-white transition-all border border-red-100/50 dark:border-red-900/20"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-2xl text-surface-300 hover:text-surface-600 transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Optimized Modals */}
      {(showModal || editSubject) && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && (setShowModal(false) || setEditSubject(null))}>
          <div className="modal-content">
            <SubjectModal
              subject={editSubject}
              onClose={() => { setShowModal(false); setEditSubject(null); }}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}
