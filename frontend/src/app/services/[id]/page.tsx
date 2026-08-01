'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  HelpCircle,
  FileText
} from 'lucide-react';

export default function ServiceDetails() {
  const params = useParams();
  const id = params.id as string;

  const servicesMap: Record<string, {
    title: string;
    description: string;
    process: string[];
    faq: { q: string; a: string }[];
    warranty: string;
    time: string;
  }> = {
    'screen-replacement': {
      title: 'Screen & Glass Swap',
      description: 'Our certified screen replacement process returns your display to original factory specification, ensuring accurate touch response, peak brightness levels, and FaceID calibration.',
      process: [
        'Electrostatic discharge grounding check & chassis separation.',
        'Safe removal of the broken display ribbon cables under micro-magnification.',
        'Clean chassis scraping of old waterproof sealant adhesive glue residues.',
        'FaceID/TouchID sensor transfer and calibration.',
        'Application of high-strength original alignment adhesive.',
        'Vacuum press lamination to lock display flush inside structural frames.'
      ],
      faq: [
        { q: 'Will my TrueTone work after display replacement?', a: 'Yes. We transfer screen configuration parameters using specialized diagnostic calibration programmers.' },
        { q: 'Do you use original glass?', a: 'We use grade-A original equipment manufacturer displays that perfectly match color temperatures and touch refresh loops.' }
      ],
      warranty: 'Lifetime Warranty against manufacturing defects and touch lag.',
      time: '30 to 45 Minutes'
    },
    'battery-diagnostics': {
      title: 'Battery Swap & Voltage Check',
      description: 'Replacing swollen, damaged, or depleted battery cells with premium original-grade cells supporting full power throttling cycles.',
      process: [
        'Discharging the battery below 25% prior to opening to prevent thermal leaks.',
        'Pneumatic separation of battery stretch-release pull tabs.',
        'Chassis de-waxing and cleaning of tape debris.',
        'Placement of new certified battery supporting peak battery capacity metrics.',
        'Motherboard voltage draw diagnostics testing to confirm zero standby leak.'
      ],
      faq: [
        { q: 'When should I replace my battery?', a: 'If your maximum battery capacity drops below 80%, or your phone randomly powers down during usage.' },
        { q: 'What is the warning on iPhone parts?', a: 'For certain iOS versions, replacing a battery triggers an "Unknown Part" badge. We perform ribbon controller swaps to keep max capacity health records intact.' }
      ],
      warranty: '1 Year Warranty covering swelling, low capacity drain, or failure to charge.',
      time: '20 Minutes'
    }
  };

  const service = servicesMap[id] || servicesMap['screen-replacement'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back button */}
      <Link 
        href="/services" 
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Link>

      {/* Intro Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">{service.title}</h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{service.description}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border p-4 rounded-xl flex items-center gap-3 bg-card">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">Duration</span>
            <span className="font-bold text-sm text-foreground">{service.time}</span>
          </div>
        </div>
        <div className="border border-border p-4 rounded-xl flex items-center gap-3 bg-card">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">Warranty</span>
            <span className="font-bold text-sm text-foreground">{service.warranty.split(' ')[0]} {service.warranty.split(' ')[1]}</span>
          </div>
        </div>
        <div className="border border-border p-4 rounded-xl flex items-center gap-3 bg-card">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">Diagnostics</span>
            <span className="font-bold text-sm text-foreground">Free if Repaired</span>
          </div>
        </div>
      </div>

      {/* Step by step workflow */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Our Diagnostic & Repair Process</h2>
        <div className="space-y-4">
          {service.process.map((step, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 border border-primary/20">
                {index + 1}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-6 pt-6 border-t border-border">
        <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {service.faq.map((faq, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-extrabold text-foreground flex gap-2">
                <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                {faq.q}
              </h4>
              <p className="text-sm text-muted-foreground pl-7 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Book CTA */}
      <div className="glass border border-border p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 mt-8 bg-card/40">
        <div>
          <h3 className="font-bold text-lg text-foreground">Need this repair executed?</h3>
          <p className="text-sm text-muted-foreground">Book online now to lock your diagnostic slot and parts reservation in Dhaka.</p>
        </div>
        <Link 
          href="/booking" 
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-3 rounded-xl transition-all shadow-md shrink-0 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Book Repair
        </Link>
      </div>
    </div>
  );
}
