import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      <div className="relative mb-8">
        <h1 className="text-[120px] sm:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-300 dark:from-indigo-400 dark:to-indigo-800 drop-shadow-sm select-none">
          404
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-full p-4 shadow-xl border border-indigo-100 dark:border-white/5 rotate-12">
          <Compass className="w-12 h-12 text-indigo-500" />
        </div>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
        You're off the map!
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-10 font-medium">
        The page you are looking for doesn't exist, was moved, or you just took a wrong turn. Let's get you back.
      </p>

      <Link
        to="/dashboard"
        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-lg transition-all shadow-glow-sm hover:scale-105 active:scale-95 group"
      >
        <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        Return to Base
      </Link>
    </div>
  );
}
