import Link from 'next/link';
import { 
  Monitor, 
  Battery, 
  Droplet, 
  Smartphone, 
  Cpu, 
  Camera, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { businessConfig } from '@/config/business';

export default function Services() {
  const serviceList = [
    {
      id: 'screen-replacement',
      icon: <Monitor className="h-8 w-8 text-primary" />,
      title: 'Screen & Glass Swap',
      desc: 'Dust-free display replacements. Fixes lines, dead pixels, non-responsive touch, and shattered outer gorilla glass.',
      priceRange: '৳2,500 - ৳25,000',
      duration: '30-45 mins',
    },
    {
      id: 'battery-diagnostics',
      icon: <Battery className="h-8 w-8 text-primary" />,
      title: 'Battery Diagnostics & Swap',
      desc: 'Certified high-drain battery replacement. Resolves rapid degradation, overheating, and sudden restarts.',
      priceRange: '৳1,200 - ৳8,500',
      duration: '20 mins',
    },
    {
      id: 'water-decontamination',
      icon: <Droplet className="h-8 w-8 text-primary" />,
      title: 'Water Damage Decontamination',
      desc: 'Motherboard chemical cleaning and dehydration. Stops ongoing logic board corrosion and short circuits.',
      priceRange: '৳1,500 - ৳6,000',
      duration: 'Same Day',
    },
    {
      id: 'charging-port',
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: 'Charging Port & Lightning Fix',
      desc: 'USB-C and Lightning connector repairs. Resolves loose chargers, slow charging, and data sync issues.',
      priceRange: '৳1,000 - ৳4,500',
      duration: '30 mins',
    },
    {
      id: 'logicboard-soldering',
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: 'Logic Board Micro-Soldering',
      desc: 'Trace routing and BGA chip repairs. Handles power IC failures, audio loop issues, and backlight short circuits.',
      priceRange: '৳2,500 - ৳15,000',
      duration: '1 - 2 Days',
    },
    {
      id: 'camera-sensors',
      icon: <Camera className="h-8 w-8 text-primary" />,
      title: 'Camera & Sensor Calibration',
      desc: 'Replacement and alignment of front/rear camera lenses, lidar sensors, and FaceID infrared modules.',
      priceRange: '৳1,500 - ৳12,000',
      duration: '45 mins',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Hardware Services Matrix
        </span>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Premium Device Repair Categories
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Select a category to view diagnostic workflows, calibration procedures, and BDT ({businessConfig.currency.symbol}) price ranges.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceList.map((svc) => (
          <div 
            key={svc.id} 
            className="glass border border-border p-8 rounded-xl flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 bg-card/40"
          >
            <div className="space-y-4">
              <div className="bg-secondary p-3.5 rounded-xl border border-border w-fit">
                {svc.icon}
              </div>
              <h3 className="font-extrabold text-xl text-foreground">{svc.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{svc.desc}</p>
              
              <div className="flex gap-4 pt-2 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Warranty Secure
                </span>
                <span>&bull;</span>
                <span>{svc.duration}</span>
              </div>
            </div>

            <div className="border-t border-border mt-8 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground block leading-none">Price Range</span>
                <span className="text-lg font-black text-foreground">{svc.priceRange}</span>
              </div>
              <Link 
                href={`/services/${svc.id}`} 
                className="text-primary hover:text-accent font-bold text-sm flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-primary rounded"
              >
                Workflow Details
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
