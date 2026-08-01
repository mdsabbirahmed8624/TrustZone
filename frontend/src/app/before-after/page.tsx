import Link from 'next/link';
import { Eye, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { beforeAfterList } from '@/config/business';

export default function BeforeAfter() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Our Repair Success Portfolio
        </span>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Before & After Showcases
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Inspect comparisons of hardware recovery jobs executed inside our micro-electronic workshops in Dhaka.
        </p>
      </div>

      {/* Comparisons */}
      <div className="space-y-12">
        {beforeAfterList.map((job, idx) => (
          <div key={idx} className="glass border border-border rounded-2xl overflow-hidden p-6 sm:p-8 space-y-6 glow-primary bg-card/40">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-extrabold text-xl text-foreground">{job.title}</h3>
                <span className="text-xs text-primary font-semibold uppercase tracking-wider">{job.desc}</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" />
                Restoration Pass
              </span>
            </div>

            {/* Compare grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="bg-red-500/5 border border-red-500/15 p-6 rounded-xl space-y-3">
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase text-red-500">
                  <Eye className="h-4 w-4" />
                  Before Repair
                </span>
                <p className="text-muted-foreground leading-relaxed">{job.before}</p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/15 p-6 rounded-xl space-y-3">
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase text-emerald-500">
                  <RefreshCw className="h-4 w-4" />
                  After Restoration
                </span>
                <p className="text-muted-foreground leading-relaxed">{job.after}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link 
          href="/booking" 
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Book Your Diagnostic Assessment
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
