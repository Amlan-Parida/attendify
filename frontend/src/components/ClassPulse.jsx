import React, { useEffect, useState } from 'react';
import { Users, Coffee, Activity, Radio, Clock } from 'lucide-react';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

export default function ClassPulse() {
  const [pulse, setPulse] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const { data } = await api.get('/analytics/pulse');
        setPulse(data);
      } catch (err) {
        console.error('Failed to fetch pulse');
      } finally {
        setLoading(false);
      }
    };
    fetchPulse();
    const interval = setInterval(fetchPulse, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (pulse.length === 0) return null;

  return (
    <div className="card group relative overflow-hidden mb-8 border border-white/50 dark:border-surface-800/50">
      {/* Pulse background effect */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Activity className="w-24 h-24 text-primary-500 animate-pulse-slow" />
      </div>

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500 blur-md opacity-20 animate-pulse"></div>
            <div className="relative w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-500/20 shadow-sm">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-surface-900 dark:text-white tracking-tight uppercase text-sm">Classmate Pulse</h3>
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Activity
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 relative">
        {pulse.map((record, idx) => (
          <div 
            key={record._id} 
            className="flex items-center gap-4 group/item animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="relative flex-shrink-0">
              {record.status === 'Mass Bunk' ? (
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200/50 dark:border-surface-700/50 flex items-center justify-center shadow-sm">
                  <Coffee className="w-5 h-5 text-surface-500 dark:text-surface-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-surface-900 dark:text-white truncate">
                  {record.userName}
                </p>
                <div className="flex items-center gap-1 text-[9px] font-black text-surface-400 uppercase tracking-tighter whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(record.timeAgo), { addSuffix: true })}
                </div>
              </div>
              
              <p className="text-[11px] text-surface-500 dark:text-surface-400 font-medium mt-0.5">
                Marked <span className="font-black text-surface-700 dark:text-surface-200 uppercase tracking-tight">{record.subjectName}</span> as{' '}
                <span className={`font-black uppercase tracking-widest ${
                  record.status === 'Mass Bunk' 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-surface-600 dark:text-surface-300'
                }`}>
                  {record.status}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all border border-transparent hover:border-primary-500/20">
        View Full History
      </button>
    </div>
  );
}
