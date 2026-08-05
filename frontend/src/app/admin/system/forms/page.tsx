'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import {
  FileText,
  Plus,
  Save,
  Code,
  CheckSquare,
  Eye,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Layers,
  CheckCircle2,
  Smartphone,
  Monitor,
  HelpCircle,
  Hash,
  Calendar,
  Paperclip,
  PenTool,
  List,
} from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'dropdown' | 'radio' | 'signature' | 'attachment';
  required: boolean;
  readOnly: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

interface FormSchema {
  id: string;
  title: string;
  targetModule: 'TICKETS' | 'BOOKINGS' | 'CUSTOMERS' | 'WARRANTY' | 'INVENTORY' | 'HRMS' | 'BRANCHES';
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  fields: FormField[];
  createdAt: string;
}

export default function FormBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'builder' | 'schemas'>('builder');

  // Form State
  const [editingSchemaId, setEditingSchemaId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [targetModule, setTargetModule] = useState<FormSchema['targetModule']>('TICKETS');
  const [status, setStatus] = useState<FormSchema['status']>('DRAFT');
  const [fields, setFields] = useState<FormField[]>([]);

  // Saved Schemas State
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  // Live Preview Modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    loadMockSchemas();
  }, []);

  const loadMockSchemas = () => {
    const defaults: FormSchema[] = [
      {
        id: 'form-101',
        title: 'Technician Multi-Point Device Intake Checklist',
        targetModule: 'TICKETS',
        status: 'PUBLISHED',
        fields: [
          { id: 'f1', label: 'Battery Health % Level', type: 'number', required: true, readOnly: false, placeholder: 'e.g. 85' },
          { id: 'f2', label: 'Liquid Intrusion Indicator Red Flagged', type: 'checkbox', required: false, readOnly: false },
          { id: 'f3', label: 'Housing / Frame Bending Condition', type: 'dropdown', required: fontRequired('f3'), readOnly: false, options: ['Pristine', 'Minor Scratches', 'Severe Dent', 'Bent Chassis'] },
          { id: 'f4', label: 'Customer Intake Signoff', type: 'signature', required: true, readOnly: false },
        ],
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 'form-102',
        title: 'Corporate Fleet Repair Warranty Claim Form',
        targetModule: 'WARRANTY',
        status: 'PUBLISHED',
        fields: [
          { id: 'wf1', label: 'Original Invoice Number', type: 'text', required: true, readOnly: false, placeholder: 'TZ-INV-XXXX' },
          { id: 'wf2', label: 'Defect Failure Date', type: 'date', required: true, readOnly: false },
          { id: 'wf3', label: 'High Resolution Photo Attachment', type: 'attachment', required: false, readOnly: false },
        ],
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ];
    setSchemas(defaults);
  };

  function fontRequired(id: string) {
    return id === 'f3';
  }

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: `New ${type.toUpperCase()} Field`,
      type,
      required: false,
      readOnly: false,
      placeholder: '',
      helpText: '',
      options: type === 'dropdown' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, key: keyof FormField, value: any) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const moveField = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const copy = [...fields];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setFields(copy);
  };

  const duplicateField = (field: FormField) => {
    const dupe: FormField = {
      ...field,
      id: `f-${Date.now()}`,
      label: `${field.label} (Copy)`,
    };
    setFields([...fields, dupe]);
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSaveForm = () => {
    if (!title.trim()) return alert('Form Title is required.');
    if (fields.length === 0) return alert('Add at least one field to the form canvas.');

    if (editingSchemaId) {
      setSchemas(prev =>
        prev.map(s => (s.id === editingSchemaId ? { ...s, title, targetModule, status, fields } : s))
      );
      setEditingSchemaId(null);
      alert('Form Schema updated successfully!');
    } else {
      const newSchema: FormSchema = {
        id: `form-${Date.now()}`,
        title,
        targetModule,
        status: 'PUBLISHED',
        fields,
        createdAt: new Date().toISOString(),
      };
      setSchemas([newSchema, ...schemas]);
      alert('New Dynamic Form Schema created & published!');
    }

    // Reset Builder
    setTitle('');
    setFields([]);
  };

  const handleEditSchema = (schema: FormSchema) => {
    setEditingSchemaId(schema.id);
    setTitle(schema.title);
    setTargetModule(schema.targetModule);
    setStatus(schema.status);
    setFields(schema.fields);
    setActiveTab('builder');
  };

  const handleDeleteSchema = (id: string) => {
    if (!confirm('Are you sure you want to delete this form schema?')) return;
    setSchemas(prev => prev.filter(s => s.id !== id));
  };

  const filteredSchemas = schemas.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = selectedModule === 'ALL' || s.targetModule === selectedModule;
    return matchSearch && matchModule;
  });

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/60 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                <FileText className="text-primary h-6 w-6" />
                Dynamic Form Builder & Schema Engine
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Design custom intake forms, inspection checklists, and warranty signoff documents for ERP modules.
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button onClick={() => setShowPreview(true)} className="bg-secondary/40 border border-border hover:bg-secondary text-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                <Eye className="h-4 w-4" /> Live Preview
              </button>
              <button onClick={() => setActiveTab(activeTab === 'builder' ? 'schemas' : 'builder')} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow">
                <Layers className="h-4 w-4" /> {activeTab === 'builder' ? 'Saved Form Templates' : 'Form Canvas Builder'}
              </button>
            </div>
          </div>

          {activeTab === 'schemas' ? (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 bg-card border border-border/60 p-3.5 rounded-xl shadow-sm">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search form templates..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-secondary/20 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} className="bg-secondary/20 border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground">
                  <option value="ALL">All ERP Modules</option>
                  <option value="TICKETS">Tickets / Repairs</option>
                  <option value="WARRANTY">Warranty</option>
                  <option value="BOOKINGS">Bookings</option>
                  <option value="CUSTOMERS">Customers</option>
                </select>
              </div>

              {/* Schemas List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSchemas.map(s => (
                  <div key={s.id} className="bg-card border border-border/60 p-4 rounded-xl space-y-3 shadow-sm hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground text-xs">{s.title}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Module: <span className="font-bold text-foreground">{s.targetModule}</span> | Fields: <span className="font-bold text-foreground">{s.fields.length}</span>
                        </p>
                      </div>
                      <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                        {s.status}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                      <button onClick={() => handleEditSchema(s)} className="bg-secondary hover:bg-secondary/80 text-foreground px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 border border-border">
                        Edit Form
                      </button>
                      <button onClick={() => handleDeleteSchema(s.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 border border-red-500/20">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Field Controls Palette */}
              <div className="bg-card border border-border/60 p-5 rounded-xl space-y-4 text-xs font-bold shadow-sm">
                <h2 className="uppercase text-muted-foreground tracking-wider text-[10px]">Field Controls Palette</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { type: 'text', label: 'Text Input', icon: FileText },
                    { type: 'number', label: 'Number', icon: Hash },
                    { type: 'date', label: 'Date Picker', icon: Calendar },
                    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
                    { type: 'dropdown', label: 'Dropdown', icon: List },
                    { type: 'radio', label: 'Radio Option', icon: CheckSquare },
                    { type: 'signature', label: 'Signature Pad', icon: PenTool },
                    { type: 'attachment', label: 'Attachment', icon: Paperclip },
                  ].map(ctrl => {
                    const Icon = ctrl.icon;
                    return (
                      <button
                        key={ctrl.type}
                        onClick={() => addField(ctrl.type as any)}
                        className="bg-secondary/40 hover:bg-secondary/80 border border-border py-2.5 px-2 rounded-lg font-bold text-xs flex flex-col items-center gap-1 transition-all"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <span>+ {ctrl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Layout Canvas */}
              <div className="lg:col-span-2 bg-card border border-border/60 p-5 rounded-xl space-y-4 shadow-sm">
                
                {/* Form Settings Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <label className="text-foreground">Form Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Technician Intake Form"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-secondary/20 border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary font-normal"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-foreground">Target ERP Module</label>
                    <select value={targetModule} onChange={e => setTargetModule(e.target.value as any)} className="w-full bg-secondary/20 border border-border p-2 rounded-lg text-foreground font-bold outline-none focus:border-primary">
                      <option value="TICKETS">Repair Tickets</option>
                      <option value="WARRANTY">Warranty Claims</option>
                      <option value="BOOKINGS">Bookings</option>
                      <option value="CUSTOMERS">Customer Registration</option>
                      <option value="INVENTORY">Inventory Parts</option>
                      <option value="HRMS">HR Forms</option>
                    </select>
                  </div>
                </div>

                {/* Canvas Field Drop Container */}
                <div className="border-2 border-dashed border-border/60 rounded-xl p-5 min-h-[300px] space-y-3">
                  {fields.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground">Click any field control on the left to add fields to the canvas.</p>
                    </div>
                  ) : (
                    fields.map((f, idx) => (
                      <div key={f.id} className="bg-secondary/20 border border-border/60 p-3.5 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground font-bold">#{idx + 1}</span>
                            <input
                              type="text"
                              value={f.label}
                              onChange={e => updateField(f.id, 'label', e.target.value)}
                              className="bg-card border border-border rounded px-2 py-1 font-bold text-foreground outline-none focus:border-primary"
                            />
                            <span className="text-[9px] font-mono uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">{f.type}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button onClick={() => moveField(idx, 'UP')} disabled={idx === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => moveField(idx, 'DOWN')} disabled={idx === fields.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => duplicateField(f)} className="p-1 text-muted-foreground hover:text-foreground">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteField(f.id)} className="p-1 text-red-500 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Config Toggles */}
                        <div className="flex items-center gap-4 text-[11px] font-semibold text-muted-foreground pt-1 border-t border-border/40">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" checked={f.required} onChange={e => updateField(f.id, 'required', e.target.checked)} className="rounded accent-primary" />
                            <span>Required</span>
                          </label>

                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" checked={f.readOnly} onChange={e => updateField(f.id, 'readOnly', e.target.checked)} className="rounded accent-primary" />
                            <span>Read-Only</span>
                          </label>

                          <input
                            type="text"
                            placeholder="Placeholder Text..."
                            value={f.placeholder || ''}
                            onChange={e => updateField(f.id, 'placeholder', e.target.value)}
                            className="bg-card border border-border rounded px-2 py-0.5 text-[10px] text-foreground outline-none"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button onClick={handleSaveForm} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow">
                    <Save className="h-4 w-4" /> Save Form Schema
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* LIVE PREVIEW MODAL */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={`bg-card border border-border rounded-xl w-full p-6 shadow-2xl space-y-4 ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
                <div className="flex justify-between items-center border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground">Live Form Preview ({title || 'Untitled Form'})</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
                  {fields.map(f => (
                    <div key={f.id} className="space-y-1 text-xs">
                      <label className="font-bold text-foreground flex items-center gap-1">
                        {f.label} {f.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                        placeholder={f.placeholder || ''}
                        disabled={f.readOnly}
                        className="w-full bg-secondary/20 border border-border rounded p-2 text-foreground"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end border-t border-border/60 pt-3">
                  <button onClick={() => setShowPreview(false)} className="bg-secondary text-foreground px-4 py-2 rounded text-xs font-semibold">
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
