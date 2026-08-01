import { Star, Quote, ShieldCheck } from 'lucide-react';
import { reviewsList } from '@/config/business';

export default function Testimonials() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Diagnostics Feedback Ledger
        </span>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Customer Stories & Reviews
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Real diagnostics and repair results submitted by mobile owners across Dhaka.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviewsList.map((rev, idx) => (
          <div 
            key={idx} 
            className="glass border border-border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden bg-card/40"
          >
            <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none select-none">
              <Quote className="h-20 w-20 text-primary" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex gap-0.5">
                {[...Array(rev.stars)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">&quot;{rev.text}&quot;</p>
            </div>

            <div className="border-t border-border mt-8 pt-4 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-foreground block text-sm">{rev.name}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{rev.role}</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
                <ShieldCheck className="h-3.5 w-3.5" />
                {rev.device}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
