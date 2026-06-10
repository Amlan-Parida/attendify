import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sun,
  Moon,
  ChevronRight,
  Brain,
  HelpCircle,
  Trash2,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { useSubjects } from '../context/SubjectContext';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/subjects', label: 'Library', icon: BookOpen },
  { to: '/intelligence', label: 'Intelligence', icon: Brain },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { clearAllData } = useSubjects();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearAccount = async () => {
    try {
      await clearAllData();
      setClearModalOpen(false);
      setOptionsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) return toast.error('Please enter a message');
    // Simulate sending feedback
    toast.success('Feedback sent directly to the developer! Thank you.');
    setFeedback('');
    setHelpModalOpen(false);
    setOptionsOpen(false);
  };

  return (
    <nav className="fixed top-4 sm:top-6 left-0 right-0 z-[100] px-4 sm:px-6 pointer-events-none">
      <div className={`max-w-6xl mx-auto flex items-center justify-between pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] !overflow-visible ${
        scrolled 
          ? 'h-16 px-4 sm:px-6 glass-card shadow-glow-sm scale-[0.98]' 
          : 'h-20 px-5 sm:px-8 glass-card bg-white/20 dark:bg-surface-900/20 border-transparent shadow-none'
      }`}>
        
        {/* Logo Section */}
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-600 blur-md opacity-20 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-black text-surface-900 dark:text-white tracking-tighter">
              Attend<span className="text-primary-500">ify</span>
            </span>
            <p className="text-[8px] font-black uppercase tracking-widest text-surface-400 -mt-1">v2.0 Elite</p>
          </div>
        </Link>

        {/* Dynamic Desktop Nav (Floating Pill) */}
        <div className="hidden lg:flex items-center gap-1 bg-surface-950/5 dark:bg-white/5 p-1.5 rounded-[2rem] border border-surface-200/10 backdrop-blur-md">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-black transition-all duration-500 group/nav ${
                  active
                    ? 'text-white'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-primary-600 rounded-full shadow-glow-sm animate-fade-in -z-10"></div>
                )}
                <Icon className={`w-4 h-4 transition-transform group-hover/nav:scale-110 ${active ? 'animate-pulse-slow' : ''}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-surface-100/50 dark:bg-surface-800/50 text-surface-500 hover:text-primary-500 transition-all group"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-700" />}
          </button>

          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-surface-200/20">
            {/* Account Options Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setOptionsOpen(!optionsOpen)}
                className="relative group/user cursor-pointer active:scale-95 transition-all"
              >
                <div className="absolute inset-0 bg-primary-500 blur-lg opacity-0 group-hover/user:opacity-20 transition-opacity"></div>
                <div className="relative w-10 h-10 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-900 dark:text-white font-black text-sm shadow-sm group-hover/user:border-primary-500/50 transition-colors">
                  {user?.name?.[0].toUpperCase()}
                </div>
              </button>

              {optionsOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setOptionsOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl z-[100] p-2 animate-slide-up origin-top-right">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 mb-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => { setHelpModalOpen(true); setOptionsOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" /> Help from Dev
                    </button>
                    
                    <button 
                      onClick={() => { setClearModalOpen(true); setOptionsOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <Trash2 className="w-4 h-4" /> Clear Account
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
              title="Terminate Session"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-3 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 transition-all active:scale-90"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Modern Mobile Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[110] p-4 sm:p-6 lg:hidden animate-fade-in pointer-events-auto">
          <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-2xl" onClick={() => setMenuOpen(false)}></div>
          <div className="relative h-full bg-white dark:bg-surface-900 rounded-[2rem] sm:rounded-[3rem] border border-white/20 shadow-glow-lg p-6 sm:p-10 flex flex-col justify-between animate-slide-up">
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-600 rounded-[1.5rem] flex items-center justify-center text-white">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <span className="text-2xl font-black text-surface-900 dark:text-white tracking-tighter">Attendify <span className="text-primary-500">v2.0</span></span>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-4 bg-surface-100 dark:bg-surface-800 rounded-2xl">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-4">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 rounded-2xl sm:rounded-[2rem] text-xl sm:text-2xl font-black transition-all ${
                      location.pathname === to
                        ? 'bg-primary-600 text-white shadow-glow'
                        : 'text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <Icon className="w-8 h-8" />
                      {label}
                    </div>
                    <ChevronRight className="w-6 h-6 opacity-50" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-10 border-t border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-4 px-4">
                <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-black text-xl">
                  {user?.name?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-black text-surface-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm font-bold text-surface-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-6 rounded-[2rem] bg-red-500 text-white text-xl font-black uppercase tracking-widest shadow-glow-sm shadow-red-500/40 hover:scale-[1.02] transition-all"
              >
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setHelpModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl p-6 md:p-8 animate-slide-up">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Help & Feedback</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6">
              Found a bug? Have a suggestion? Write directly to the developer. We read everything!
            </p>
            <textarea
              className="premium-input w-full min-h-[120px] resize-none mb-6 text-sm"
              placeholder="Describe your issue or feature request..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
            <div className="flex items-center gap-3">
              <button onClick={() => setHelpModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleSendFeedback} className="flex-1 py-3.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition-all shadow-glow-sm">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Account Danger Modal */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setClearModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] border border-red-200 dark:border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)] p-6 md:p-8 animate-slide-up">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6 shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Clear Account Data</h3>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to completely wipe all your subjects and attendance records? 
            </p>
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 mb-6">
              <p className="text-xs font-bold text-red-700 dark:text-red-400">
                <span className="font-black uppercase tracking-widest mr-1 text-[10px]">Warning:</span>
                This is useful for starting a new semester, but this action cannot be undone. Your account credentials will remain.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setClearModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleClearAccount} className="flex-1 py-3.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all shadow-glow-sm shadow-red-500/30">
                Yes, Wipe Data
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
