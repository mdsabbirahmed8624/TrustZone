import { ShieldCheck, HelpCircle, PhoneCall } from 'lucide-react';
import { businessConfig, pricingMatrix } from '@/config/business';

export default function Pricing() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          No Hidden Margins
        </span>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Repair Pricing Guide
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Check out our approximate price matrix in BDT ({businessConfig.currency.symbol}) for common smartphone models. Includes diagnostics.
        </p>
      </div>

      {/* Pricing Table */}
      <div className="glass border border-border rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-secondary/60 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-bold">
              <th className="p-5">Smartphone Model</th>
              <th className="p-5">Original screen replacement</th>
              <th className="p-5">Battery swap</th>
              <th className="p-5">Charging Port</th>
              <th className="p-5">Water Treatment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm text-foreground">
            {pricingMatrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                <td className="p-5 font-semibold text-foreground">{row.device}</td>
                <td className="p-5 font-bold text-primary">{row.screen}</td>
                <td className="p-5 font-bold">{row.battery}</td>
                <td className="p-5">{row.port}</td>
                <td className="p-5">{row.water}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="glass border border-border p-6 rounded-xl space-y-3 bg-card/40">
          <h3 className="font-extrabold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Warranty Guarantee Included
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All prices displayed are approximate estimates. True prices are calculated during diagnostics based on the severity of display matrix cracks, microchip traces, and exact grade-A component costs.
          </p>
        </div>
        
        <div className="glass border border-border p-6 rounded-xl space-y-3 flex flex-col justify-between bg-card/40">
          <div className="space-y-2">
            <h3 className="font-extrabold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Model Not Listed?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We fix Xiaomi, OnePlus, Google Pixel, Oppo, and Realme models as well. Reach out to diagnostic desks for quotes.
            </p>
          </div>
          <a 
            href={`tel:${businessConfig.helpline.replace(/\s+/g, '')}`} 
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2 focus:outline-none focus:ring-1 focus:ring-primary rounded"
            aria-label="Call helpline for custom pricing quote"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            Call desk for custom quote
          </a>
        </div>
      </div>
    </div>
  );
}
