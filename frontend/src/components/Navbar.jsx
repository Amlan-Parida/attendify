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
  Brain
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/subjects', label: 'Library', icon: BookOpen },
  { to: '/intelligence', label: 'Intelligence', icon: Brain },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-[100] px-6 pointer-events-none">
      <div className={`max-w-6xl mx-auto flex items-center justify-between pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled 
          ? 'h-16 px-6 glass-card shadow-glow-sm scale-[0.98]' 
          : 'h-20 px-8 glass-card bg-white/20 dark:bg-surface-900/20 border-transparent shadow-none'
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
            <div className="relative group/user cursor-pointer">
              <div className="absolute inset-0 bg-primary-500 blur-lg opacity-0 group-hover/user:opacity-20 transition-opacity"></div>
              <div className="relative w-10 h-10 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-900 dark:text-white font-black text-sm shadow-sm">
                {user?.name?.[0].toUpperCase()}
              </div>
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
        <div className="fixed inset-0 z-[110] p-6 lg:hidden animate-fade-in pointer-events-auto">
          <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-2xl" onClick={() => setMenuOpen(false)}></div>
          <div className="relative h-full bg-white dark:bg-surface-900 rounded-[3rem] border border-white/20 shadow-glow-lg p-10 flex flex-col justify-between animate-slide-up">
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
                    className={`flex items-center justify-between px-8 py-6 rounded-[2rem] text-2xl font-black transition-all ${
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
    </nav>
  );
}
