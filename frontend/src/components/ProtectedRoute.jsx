import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';

export default function ProtectedRoute({ children, requireOnboarding = true }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurora">
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-glow animate-float">
              <GraduationCap className="w-12 h-12 text-white animate-pulse-slow" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-950 dark:text-white text-lg font-black tracking-tighter uppercase">Initializing Intelligence</p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireOnboarding && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboarding && user.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
