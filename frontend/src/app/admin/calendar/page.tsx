'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function AdminCalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Custom Event Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'MEETING'
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Calculate start and end of current month view
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();
      
      const res = await api.calendar.fetchCalendarEvents(start, end, token);
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateEvent = async () => {
    try {
      await api.calendar.createEvent(eventForm, token);
      setShowCreateModal(false);
      setEventForm({ title: '', description: '', startDate: '', endDate: '', type: 'MEETING' });
      loadEvents();
    } catch (err) {
      alert('Error creating event');
    }
  };

  // Month navigation helper
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getEventBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'repair': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'task': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'leave': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warranty': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'purchase': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <CalendarIcon className="text-primary h-6 w-6" />
                Unified Enterprise Calendar
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unified operations grid showing repair deadlines, employee leaves, parts replenishment ETAs, and meetings.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" /> Book Custom Event
            </button>
          </div>

          {/* Month Navigator Header */}
          <div className="flex items-center justify-between bg-card border border-border/60 p-4 rounded-xl shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="border border-border p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="border border-border px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-secondary"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="border border-border p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Events List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-muted-foreground bg-card border border-border/60 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/60" />
                No events or deadlines scheduled for this month range.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4 hover:shadow hover:border-primary/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black tracking-wider ${getEventBadgeClass(ev.type)}`}>
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                        <Clock className="h-3 w-3" />
                        {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ev.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {new Date(ev.start).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{ev.priority || 'MEDIUM'} priority</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Book Custom Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight">Book Custom Calendar Event</h2>

            <div className="space-y-1">
              <label className="font-bold">Event Title</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Technician Sync / Workshop cleaning"
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Description / Notes</label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Add meeting links, physical lab details or tasks checklists..."
                className="w-full bg-secondary border border-border p-2 rounded-lg h-20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Event Type</label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="MEETING">Meeting</option>
                <option value="EVENT">Event</option>
                <option value="REMINDER">Reminder</option>
                <option value="LEAVE">Leave</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Schedule Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
