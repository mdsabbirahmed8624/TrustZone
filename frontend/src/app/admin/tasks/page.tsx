'use client';

import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  SlidersHorizontal,
  Clock,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function AdminTasksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedToId: '',
    deadline: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    status: 'PENDING'
  });

  const [commentInput, setCommentInput] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.tasks.fetchTasks({ status: statusFilter, priority: priorityFilter }, token);
      if (res.success) {
        let list = res.data;
        if (searchTerm) {
          list = list.filter((t: any) =>
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setTasks(list);
      }
      
      const contactsRes = await api.chat.fetchContacts(token);
      if (contactsRes.success) setContacts(contactsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateTask = async () => {
    try {
      await api.tasks.createTask(taskForm, token);
      setShowCreateModal(false);
      setTaskForm({ title: '', description: '', assignedToId: '', deadline: '', priority: 'MEDIUM', status: 'PENDING' });
      loadData();
    } catch (err) {
      alert('Error creating task');
    }
  };

  const handleUpdateProgress = async (id: string, progress: number, status?: string) => {
    const data: any = { progress };
    if (status) data.status = status;
    await api.tasks.updateTask(id, data, token);
    loadData();
    // Refresh details modal
    if (selectedTask && selectedTask.id === id) {
      const updated = await api.tasks.fetchTasks({}, token);
      const matched = updated.data.find((t: any) => t.id === id);
      setSelectedTask(matched);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    await api.tasks.addComment(selectedTask.id, commentInput, token);
    setCommentInput('');
    // Reload task details
    const updated = await api.tasks.fetchTasks({}, token);
    const matched = updated.data.find((t: any) => t.id === selectedTask.id);
    setSelectedTask(matched);
    loadData();
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'bg-red-500/15 text-red-500 border-red-500/25';
      case 'HIGH': return 'bg-orange-500/15 text-orange-500 border-orange-500/25';
      case 'MEDIUM': return 'bg-blue-500/15 text-blue-500 border-blue-500/25';
      default: return 'bg-slate-500/15 text-slate-500 border-slate-500/25';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'IN_PROGRESS': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'OVERDUE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-secondary text-muted-foreground border-border';
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
                <ListTodo className="text-primary h-6 w-6" />
                Tasks & Operations Board
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign technician operations, check deadlines, update repair progress checklists, and track milestones.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" /> Create Work Task
            </button>
          </div>

          {/* Filters Panel */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3 rounded-xl shadow-sm text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-[11px]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-[11px]"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="Search task title..."
                className="w-full bg-secondary border border-border pl-8 pr-3 py-2 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-5 shadow-sm space-y-4 hover:shadow transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black tracking-wider ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black tracking-wider ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{task.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{task.description || 'No description provided.'}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground">
                    <span>Task Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>

                {/* Assignee & Meta info */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                  </span>
                  {task.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* 1. Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight">Create Operations Task</h2>

            <div className="space-y-1">
              <label className="font-bold">Task Title</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Inspect Screen assemblies"
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Task Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Explain the technical checklists and details..."
                className="w-full bg-secondary border border-border p-2 rounded-lg h-20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Assignee (Technician/Staff)</label>
                <select
                  value={taskForm.assignedToId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="">Unassigned</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.role})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Deadline Date</label>
                <input
                  type="date"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Alert</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Initial Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="PENDING">Pending (Not Started)</option>
                  <option value="IN_PROGRESS">In Progress</option>
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
                onClick={handleCreateTask}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Assign Work Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Task Details Sidebar/Modal (Comments & Progress) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black tracking-wider ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
                <h2 className="text-md font-black tracking-tight mt-1">{selectedTask.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-muted-foreground hover:text-foreground font-black text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/25 p-3 rounded-lg border border-border/40">
              {selectedTask.description || 'No description provided.'}
            </p>

            {/* Change Status & Progress slider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border/60 pb-4">
              <div className="space-y-1.5 text-xs">
                <label className="font-bold flex items-center gap-1"><CheckSquare className="h-4 w-4 text-primary" /> Update Progress Checklist</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={selectedTask.progress}
                    onChange={(e) => handleUpdateProgress(selectedTask.id, Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
                  />
                  <span className="font-bold">{selectedTask.progress}%</span>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <label className="font-bold">Advance State</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateProgress(selectedTask.id, selectedTask.progress, e.target.value)}
                  className="w-full bg-secondary border border-border p-1.5 rounded-lg"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>

            {/* Comments block */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-primary" /> Team comments thread</h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Share updates on diagnostics or parts issues..."
                  className="flex-1 bg-secondary border border-border p-2 rounded-lg text-xs"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-primary text-primary-foreground font-black text-xs px-3.5 rounded-lg"
                >
                  Post
                </button>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {(selectedTask.comments || []).length === 0 ? (
                  <div className="text-[11px] text-muted-foreground text-center py-4">No comments posted yet.</div>
                ) : (
                  (selectedTask.comments || []).map((com: any) => (
                    <div key={com.id} className="border border-border/40 p-2.5 bg-secondary/15 rounded-lg text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground font-semibold">
                        <span>{com.user?.firstName} {com.user?.lastName}</span>
                        <span>{new Date(com.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-foreground leading-relaxed">{com.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
