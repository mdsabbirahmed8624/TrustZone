'use client';

import { useState } from 'react';
import { MapPin, Phone, CheckCircle2, Send, Mail } from 'lucide-react';
import { businessConfig } from '@/config/business';
import MapSection from '@/components/map-section';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-16">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Corporate Desks
        </span>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Contact Our Labs
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Reach out directly to schedule bulk diagnostic audits or custom diagnostic estimations.
        </p>
      </div>

      {/* Map locator block */}
      <section className="space-y-6">
        <h3 className="font-extrabold text-xl text-foreground text-center">Interactive Branch Locator</h3>
        <MapSection />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-6">
        {/* Contact info and Branch locator */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-foreground">Office Desks</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We operate multiple anti-static clean desks in Dhaka. Drop in or call desks directly.
            </p>
          </div>

          <div className="space-y-4">
            {businessConfig.branches.map((branch) => (
              <div key={branch.id} className="glass p-6 rounded-xl border border-border space-y-2.5 bg-card/40">
                <h4 className="font-extrabold text-foreground">{branch.name}</h4>
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <a href={`tel:${branch.phone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors font-bold focus:outline-none focus:ring-1 focus:ring-primary rounded">{branch.phone}</a>
                </div>
              </div>
            ))}
            <div className="glass p-6 rounded-xl border border-border bg-card/40 flex items-center gap-3 text-xs text-muted-foreground">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>General Email: </span>
              <a href={`mailto:${businessConfig.email}`} className="font-bold hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded">{businessConfig.email}</a>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="glass p-8 rounded-2xl border border-border glow-primary bg-card/40">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="inline-flex bg-emerald-500/10 text-emerald-500 p-4 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="font-extrabold text-xl text-foreground">Message Dispatched!</h3>
              <p className="text-sm text-muted-foreground">Our diagnostics team will review and reply within 1 business hour.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Submit online inquiry form">
              <h3 className="font-bold text-lg text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Submit Online Inquiry
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="name">Your Name</label>
                <input 
                  id="name"
                  type="text" 
                  required
                  placeholder="Kamrul Hasan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="email">Email Address</label>
                  <input 
                    id="email"
                    type="email" 
                    required
                    placeholder="kamrul@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-secondary border border-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="phone">Phone Number</label>
                  <input 
                    id="phone"
                    type="tel" 
                    required
                    placeholder="+880 1711-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-secondary border border-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="message">Detailed Message</label>
                <textarea 
                  id="message"
                  required
                  placeholder="How can we assist you today? Please list device brand and error specifics..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-primary min-h-[120px] text-foreground focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
