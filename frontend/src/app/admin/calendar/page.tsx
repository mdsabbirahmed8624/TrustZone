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
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  X,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  Layers
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

// Inline EmptyState component using semantic tokens for Light/Dark theme consistency
const EmptyState = ({
  title,
  description,
  icon: Icon = FolderOpen,
  action
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card/40 border border-dashed border-border rounded-xl min-h-[280px]">
      <div className="p-4 bg-secondary/60 rounded-full text-muted-foreground mb-3.5 border border-border/50">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default function AdminCalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  // Month & View state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'cards' | 'list'>('grid');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Event Details Modal
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Custom Event Form (Create / Edit)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'MEETING',
    priority: 'MEDIUM'
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();
      
      const res = await api.calendar.fetchCalendarEvents(start, end, token);
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    }
    setLoading(false);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      return alert('Event title is required.');
    }
    try {
      if (editingEvent) {
        await api.calendar.updateEvent(editingEvent.id, {
          ...editingEvent,
          title: eventForm.title,
          description: eventForm.description,
          start: eventForm.startDate || editingEvent.start,
          end: eventForm.endDate || editingEvent.end,
          type: eventForm.type.toLowerCase(),
          priority: eventForm.priority
        }, token);
      } else {
        await api.calendar.createEvent({
          title: eventForm.title,
          description: eventForm.description,
          start: eventForm.startDate || new Date().toISOString(),
          end: eventForm.endDate || new Date().toISOString(),
          type: eventForm.type.toLowerCase(),
          priority: eventForm.priority
        }, token);
      }
      setShowCreateModal(false);
      setEditingEvent(null);
      setEventForm({ title: '', description: '', startDate: '', endDate: '', type: 'MEETING', priority: 'MEDIUM' });
      loadEvents();
    } catch (err) {
      alert('Error saving calendar event.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled event?')) return;
    try {
      await api.calendar.deleteEvent(id, token);
      setSelectedEvent(null);
      loadEvents();
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getEventBadgeClass = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'repair': return 'bg-amber-500/15 text-amber-500 border-amber-500/25';
      case 'task': return 'bg-blue-500/15 text-blue-500 border-blue-500/25';
      case 'leave': return 'bg-red-500/15 text-red-500 border-red-500/25';
      case 'warranty': return 'bg-purple-500/15 text-purple-500 border-purple-500/25';
      case 'purchase': return 'bg-orange-500/15 text-orange-500 border-orange-500/25';
      default: return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25';
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch = !searchTerm || ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) || ev.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || (ev.type || '').toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Render Days Matrix for Interactive Month Grid View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const calendarDays = [];
  // Padding days from previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Header Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-4 gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                <CalendarIcon className="text-primary h-6 w-6" />
                Unified Enterprise Calendar
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unified operations grid showing repair deadlines, employee leaves, parts replenishment ETAs, and meetings.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventForm({ title: '', description: '', startDate: '', endDate: '', type: 'MEETING', priority: 'MEDIUM' });
                setShowCreateModal(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow shrink-0 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" /> Book Custom Event
            </button>
          </div>

          {/* Controls Bar: Navigation, Search, Filters & View Toggle */}
          <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3.5 rounded-xl shadow-sm text-xs">
            {/* Month Navigator */}
            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground whitespace-nowrap">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevMonth}
                  className="border border-border p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="border border-border px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-secondary text-foreground"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="border border-border p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
              <div className="relative flex-1 sm:w-48 lg:w-56">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events..."
                  className="w-full bg-secondary border border-border pl-8 pr-3 py-1.5 rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-secondary border border-border p-1.5 rounded-lg font-bold text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="all">All Types</option>
                <option value="meeting">Meetings</option>
                <option value="repair">Repair SLAs</option>
                <option value="leave">Leaves</option>
                <option value="purchase">Shipments</option>
                <option value="task">Tasks</option>
              </select>

              {/* View Switcher Buttons */}
              <div className="flex items-center border border-border bg-secondary/40 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Month Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'cards' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Cards View"
                >
                  <Layers className="h-3.5 w-3.5" /> Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Agenda List View"
                >
                  <List className="h-3.5 w-3.5" /> List
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE 7-COLUMN MONTH GRID */}
          {viewMode === 'grid' && (
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 bg-secondary/50 border-b border-border text-center text-xs font-black py-2.5 text-muted-foreground">
                <div>SUN</div>
                <div>MON</div>
                <div>TUE</div>
                <div>WED</div>
                <div>THU</div>
                <div>FRI</div>
                <div>SAT</div>
              </div>
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/50 bg-card">
                {calendarDays.map((dayNum, idx) => {
                  const isToday = dayNum && today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year;
                  
                  // Filter events falling on this day number
                  const dayEvents = dayNum ? filteredEvents.filter((ev) => {
                    const d = new Date(ev.start);
                    return d.getDate() === dayNum && d.getMonth() === month && d.getFullYear() === year;
                  }) : [];

                  return (
                    <div key={idx} className={`min-h-[100px] p-2 flex flex-col justify-between transition-colors ${dayNum ? 'hover:bg-secondary/15' : 'bg-secondary/10'}`}>
                      {dayNum ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center ${isToday ? 'bg-primary text-primary-foreground font-black shadow' : 'text-foreground'}`}>
                              {dayNum}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="text-[9px] font-bold text-muted-foreground">{dayEvents.length} Event(s)</span>
                            )}
                          </div>
                          <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px]">
                            {dayEvents.map((ev) => (
                              <div
                                key={ev.id}
                                onClick={() => setSelectedEvent(ev)}
                                className={`text-[10px] font-bold px-1.5 py-1 rounded truncate border cursor-pointer hover:opacity-90 transition-opacity ${getEventBadgeClass(ev.type)}`}
                              >
                                {ev.title}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: CARDS GRID */}
          {viewMode === 'cards' && (
            <div>
              {filteredEvents.length === 0 ? (
                <EmptyState
                  title="No Scheduled Events Found"
                  description="No calendar events match your current filter selection. Try adjusting filters or book a new custom event."
                  icon={CalendarIcon}
                  action={
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      + Book Custom Event
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4 hover:shadow hover:border-primary/30 transition-all flex flex-col justify-between cursor-pointer"
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
                        <span className="capitalize text-foreground font-black">{ev.priority || 'MEDIUM'} priority</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: AGENDA LIST TABLE */}
          {viewMode === 'list' && (
            <div>
              {filteredEvents.length === 0 ? (
                <EmptyState
                  title="No Scheduled Events"
                  description="No agenda events found for the selected month."
                  icon={CalendarIcon}
                />
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm bg-card">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-secondary/40 border-b border-border/60 font-bold">
                      <tr>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Event Title</th>
                        <th className="p-3">Event Type</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredEvents.map((ev) => (
                        <tr key={ev.id} className="hover:bg-secondary/15 transition-all">
                          <td className="p-3 font-semibold text-muted-foreground whitespace-nowrap">
                            {new Date(ev.start).toLocaleDateString()} {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 font-bold text-foreground">{ev.title}</td>
                          <td className="p-3">
                            <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black ${getEventBadgeClass(ev.type)}`}>
                              {ev.type}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-muted-foreground uppercase text-[10px]">{ev.priority || 'MEDIUM'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedEvent(ev)}
                              className="text-primary hover:underline font-bold text-xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Book / Edit Custom Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-black tracking-tight text-foreground">{editingEvent ? 'Edit Scheduled Event' : 'Book Custom Calendar Event'}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Event Title</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Technician Sync / Workshop cleaning"
                className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Description / Notes</label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Add meeting links, physical lab details or tasks checklists..."
                className="w-full bg-secondary border border-border p-2 rounded-lg h-20 text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Event Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                >
                  <option value="MEETING">Meeting</option>
                  <option value="REPAIR">Repair SLA</option>
                  <option value="LEAVE">Leave</option>
                  <option value="TASK">Task</option>
                  <option value="PURCHASE">Shipment</option>
                  <option value="WARRANTY">Warranty</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Priority</label>
                <select
                  value={eventForm.priority}
                  onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Alert</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg shadow"
              >
                {editingEvent ? 'Update Event' : 'Schedule Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black tracking-wider ${getEventBadgeClass(selectedEvent.type)}`}>
                  {selectedEvent.type}
                </span>
                <h2 className="text-md font-black tracking-tight text-foreground mt-1">{selectedEvent.title}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Start: <strong className="text-foreground">{new Date(selectedEvent.start).toLocaleString()}</strong></span>
              </div>
              {selectedEvent.end && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>End: <strong className="text-foreground">{new Date(selectedEvent.end).toLocaleString()}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span>Priority: <strong className="text-foreground uppercase">{selectedEvent.priority || 'MEDIUM'}</strong></span>
              </div>
            </div>

            {selectedEvent.description && (
              <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 text-foreground leading-relaxed">
                {selectedEvent.description}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/15 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingEvent(selectedEvent);
                    setEventForm({
                      title: selectedEvent.title || '',
                      description: selectedEvent.description || '',
                      startDate: selectedEvent.start ? new Date(selectedEvent.start).toISOString().slice(0, 16) : '',
                      endDate: selectedEvent.end ? new Date(selectedEvent.end).toISOString().slice(0, 16) : '',
                      type: (selectedEvent.type || 'MEETING').toUpperCase(),
                      priority: selectedEvent.priority || 'MEDIUM'
                    });
                    setSelectedEvent(null);
                    setShowCreateModal(true);
                  }}
                  className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
