'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';
import { FileText, Plus, Save, Code, CheckSquare } from 'lucide-react';

export default function FormBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    // Simulated mock / backend data retrieval
    setSchemas([
      { id: 'f-1', title: 'Device Inspection Checklist', fields: [{ label: 'Battery Health %', type: 'number', required: true }] }
    ]);
  };

  const addField = (type: string) => {
    setFields([...fields, { label: `New ${type} Field`, type, required: false }]);
  };

  const handleSaveForm = async () => {
    if (!title) return alert('Please enter form title');
    // Save operation mock
    alert('Dynamic Form Schema saved successfully!');
    setTitle('');
    setFields([]);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <FileText className="text-primary h-6 w-6" />
              Dynamic Form Builder
            </h1>
            <p className="text-xs text-muted-foreground">Build custom inspection forms and checklists with custom fields validation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Field Options */}
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-4 text-xs font-bold shadow-sm">
              <h2 className="uppercase text-muted-foreground">Field Controls</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {['text', 'number', 'date', 'checkbox', 'dropdown', 'radio', 'signature', 'attachment'].map(t => (
                  <button key={t} onClick={() => addField(t)} className="bg-secondary hover:bg-secondary/80 border border-border py-2 rounded-lg font-bold uppercase tracking-wider">
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Canvas */}
            <div className="lg:col-span-2 bg-card border border-border/60 p-5 rounded-xl space-y-4 shadow-sm">
              <div className="space-y-1 text-xs font-bold">
                <label>Form Title</label>
                <input
                  type="text"
                  placeholder="e.g. Technician Intake Form"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>

              <div className="border-2 border-dashed border-border/60 rounded-xl p-6 min-h-[250px] space-y-4">
                {fields.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-12">Drag or click field controls to build form.</p>
                ) : (
                  fields.map((f, idx) => (
                    <div key={idx} className="bg-secondary/15 border border-border p-3.5 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-foreground">{f.label}</strong>
                        <span className="text-[10px] text-muted-foreground font-mono ml-2 uppercase">({f.type})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) => {
                            const copy = [...fields];
                            copy[idx].required = e.target.checked;
                            setFields(copy);
                          }}
                          id={`req-${idx}`}
                        />
                        <label htmlFor={`req-${idx}`} className="font-bold">Required</label>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={handleSaveForm} className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow">
                  <Save className="h-4 w-4" /> Save Form Schema
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
