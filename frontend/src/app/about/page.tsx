import { Award, CheckCircle2 } from 'lucide-react';
import { businessConfig } from '@/config/business';

export default function About() {
  const values = [
    {
      title: 'Full Transparency',
      desc: 'No hidden diagnostic markup. Check details of repair steps, parts pricing, and diagnostic testing results on your tracking dashboard.',
    },
    {
      title: 'Zero ESD Risk',
      desc: 'Our diagnostics benches feature full grounding connections, antistatic mats, and shielding bags to prevent electrostatic discharge to microchips.',
    },
    {
      title: 'Certified Competency',
      desc: 'All technicians undergo continuous certifications and training on modern logic board micro-soldering, trace diagnostics, and display calibration.',
    },
  ];

  return (
    <div className="flex flex-col w-full py-12 lg:py-20 space-y-16">
      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Our Story & Lab Standards
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
          About {businessConfig.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Founded in 2018 in Dhaka, {businessConfig.shortName} was created to resolve the trust gap in the mobile repair industry. Today, we service thousands of devices at our anti-static counters using certified calibration equipment.
        </p>
      </section>

      {/* Lab standards / Values */}
      <section className="bg-secondary/40 border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="glass p-8 rounded-xl border border-border space-y-4 bg-card/60">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center font-extrabold text-lg border border-primary/20">
                  0{idx + 1}
                </div>
                <h3 className="font-extrabold text-lg text-foreground">{val.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnostic tools checklist */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-foreground">ESD Diagnostic Standards</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our clean-room spaces are built to safeguard sensitive motherboard capacitors. We run continuous inspections on our ESD ground loops to maintain safe repair variables.
          </p>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#16a34a] shrink-0" />
              <span>Anti-Static grounding wrist straps on all technicians</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#16a34a] shrink-0" />
              <span>Dry cabinet ovens to prevent thermal expansion moisture cracks</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#16a34a] shrink-0" />
              <span>Pneumatic frame heaters & frame-press display laminators</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#16a34a] shrink-0" />
              <span>Original touch panel calibration programmers to preserve FaceID/TrueTone</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Laboratory parameters */}
        <div className="glass p-8 rounded-2xl border border-border space-y-6 relative overflow-hidden bg-card/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg text-primary border border-primary/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-foreground">Diagnostic Lab Certifications</h4>
              <span className="text-xs text-muted-foreground">Facility Specifications</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border p-4 rounded-xl bg-card">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">ESD Safety</span>
              <span className="font-bold text-sm text-foreground">ANSI/ESD S20.20</span>
            </div>
            <div className="border border-border p-4 rounded-xl bg-card">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Panel Align</span>
              <span className="font-bold text-sm text-foreground">Grade-A OEM Spec</span>
            </div>
            <div className="border border-border p-4 rounded-xl bg-card">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Solder Labs</span>
              <span className="font-bold text-sm text-foreground">IPC-A-610 Class 3</span>
            </div>
            <div className="border border-border p-4 rounded-xl bg-card">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Security</span>
              <span className="font-bold text-sm text-foreground">CCTV Lab Vaults</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
