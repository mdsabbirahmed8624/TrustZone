import { ZoomIn, Wrench, Shield, CheckCircle } from 'lucide-react';

export default function Gallery() {
  const images = [
    { title: 'Electrostatic-Safe Solder Desk', cat: 'Lab Diagnostics' },
    { title: 'Vacuum Display Laminator Ovens', cat: 'Calibrations' },
    { title: 'BGA Reballing under Micro-Scopes', cat: 'Logic Board Solder' },
    { title: 'Antistatic Bench grounding bars', cat: 'Facility Setup' },
    { title: 'Screen pressure seal checking chamber', cat: 'Testing QC' },
    { title: 'Completed parts staging vaults', cat: 'Storage' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Diagnostics Facility Tour
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Our Advanced Repair Labs
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Take a look inside Dhaka’s cleanest certified electrostatic-discharge diagnostic laboratory.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((img, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-2xl border border-border bg-card glow-primary aspect-video flex flex-col justify-end p-6">
            {/* Mock Visual Gradient Backdrop representing images */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary to-accent/10 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90" />
            
            <div className="relative z-10 space-y-2 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{img.cat}</span>
              <h3 className="font-extrabold text-base leading-tight">{img.title}</h3>
              
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                <ZoomIn className="h-3 w-3" />
                Click to expand detail view
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Seal Banner */}
      <div className="glass border border-border p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3.5 rounded-xl text-primary shrink-0">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Visits and Bench Audits</h4>
            <p className="text-sm text-muted-foreground">Customers can request transparent, real-time live views of diagnostic testing at Banani desks.</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs font-semibold shrink-0">
          <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-500" /> Clean Room</span>
          <span className="flex items-center gap-1"><Shield className="h-4 w-4 text-primary" /> ANSI ESD</span>
        </div>
      </div>
    </div>
  );
}
