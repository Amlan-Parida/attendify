import React, { useEffect, useState, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../utils/api';
import { useSubjects } from '../context/SubjectContext';
import MarkAttendanceModal from '../components/MarkAttendanceModal';
import { Calendar, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

const LEGEND = [
  { label: 'Present', color: '#22c55e' },
  { label: 'Absent', color: '#ef4444' },
  { label: 'Holiday', color: '#94a3b8' },
  { label: 'Mass Bunk', color: '#f97316' },
];

export default function CalendarPage() {
  const { subjects, fetchSubjects } = useSubjects();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [markModal, setMarkModal] = useState(null);
  const [dateSelectionModal, setDateSelectionModal] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const fetchEvents = useCallback(async (info) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (info?.start) params.set('startDate', info.start.toISOString().split('T')[0]);
      if (info?.end) params.set('endDate', info.end.toISOString().split('T')[0]);
      if (selectedSubject) params.set('subjectId', selectedSubject);
      const { data } = await api.get(`/attendance/calendar?${params}`);
      setEvents(data);
    } catch {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDateClick = (arg) => {
    if (subjects.length === 0) return toast.error('Add a subject first');
    
    if (selectedSubject) {
      const sub = subjects.find((s) => s._id === selectedSubject);
      return setMarkModal({ ...sub, _presetDate: arg.dateStr });
    }

    const dayOfWeek = new Date(arg.dateStr).getDay();
    const scheduledSubjects = subjects.filter(s => s.daysOfWeek?.includes(dayOfWeek));

    if (scheduledSubjects.length === 1) {
      return setMarkModal({ ...scheduledSubjects[0], _presetDate: arg.dateStr });
    }

    setDateSelectionModal({
      dateStr: arg.dateStr,
      dayOfWeek,
      scheduledSubjects,
      allSubjects: subjects
    });
  };

  const handleEventClick = (info) => {
    const { subjectId, status, note } = info.event.extendedProps;
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      date: info.event.startStr,
      status,
      note,
      subjectId,
    });
  };

  const handleDeleteRecord = async () => {
    if (!selectedEvent) return;
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await api.delete(`/attendance/${selectedEvent.id}`);
      toast.success('Record deleted');
      setSelectedEvent(null);
      fetchEvents();
    } catch {
      toast.error('Failed to delete record');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 space-y-10 animate-fade-in">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-500/10 rounded-[1.5rem] flex items-center justify-center text-primary-600">
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-surface-900 dark:text-white tracking-tighter">Academic Chronology</h1>
          </div>
          <p className="text-sm font-bold text-surface-400 dark:text-surface-50 ml-18">Visualize your session history and engagement trends.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group min-w-[240px]">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
            <select
              className="premium-input pl-14 h-14"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Full Curriculum</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-surface-100/50 dark:border-surface-800/50">
        <div className="flex flex-wrap gap-4">
          {LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2.5 px-4 py-2 bg-white/50 dark:bg-surface-800/30 rounded-xl border border-surface-100 dark:border-surface-800/50 text-[10px] font-black uppercase tracking-widest text-surface-500">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
        {loading && (
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary-500 animate-pulse">
            <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            Syncing Intel...
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="glass-card p-6 md:p-10 animate-slide-up">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={fetchEvents}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth',
          }}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkClick="popover"
        />
      </div>

      {/* Event Detail Popover */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Attendance Record</h3>
              <button onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">{new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Subject</span>
                <span className="font-semibold truncate ml-4">{selectedEvent.title.split(' - ')[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold ${
                  selectedEvent.status === 'Present' ? 'text-green-600'
                  : selectedEvent.status === 'Absent' ? 'text-red-600'
                  : selectedEvent.status === 'Holiday' ? 'text-slate-500'
                  : 'text-orange-600'
                }`}>{selectedEvent.status}</span>
              </div>
              {selectedEvent.note && (
                <div>
                  <span className="text-gray-500">Note</span>
                  <p className="mt-1 text-gray-700 bg-gray-50 rounded-lg p-2">{selectedEvent.note}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setSelectedEvent(null)} className="btn-secondary flex-1 text-sm py-2">Close</button>
              <button onClick={handleDeleteRecord} className="btn-danger flex-1 text-sm py-2">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Selection Modal */}
      {dateSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Select Subject</h3>
                <p className="text-sm text-gray-500">
                  {new Date(dateSelectionModal.dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setDateSelectionModal(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {dateSelectionModal.scheduledSubjects.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-primary-600 uppercase mb-2 px-1">Scheduled for this day</p>
                  {dateSelectionModal.scheduledSubjects.map(sub => (
                    <button
                      key={sub._id}
                      onClick={() => {
                        setDateSelectionModal(null);
                        setMarkModal({ ...sub, _presetDate: dateSelectionModal.dateStr });
                      }}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors mb-2 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${sub.color}20`, color: sub.color }}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{sub.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">All Subjects</p>
                {dateSelectionModal.allSubjects
                  .filter(sub => !dateSelectionModal.scheduledSubjects.find(s => s._id === sub._id))
                  .map(sub => (
                  <button
                    key={sub._id}
                    onClick={() => {
                      setDateSelectionModal(null);
                      setMarkModal({ ...sub, _presetDate: dateSelectionModal.dateStr });
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {markModal && (
        <MarkAttendanceModal
          subject={markModal}
          onClose={() => setMarkModal(null)}
          onSuccess={fetchEvents}
          presetDate={markModal._presetDate}
        />
      )}
    </div>
  );
}
