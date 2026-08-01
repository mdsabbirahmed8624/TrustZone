'use client';

import { useState } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Map } from 'lucide-react';
import { businessConfig, BranchInfo } from '@/config/business';

export default function MapSection() {
  const [activeBranch, setActiveBranch] = useState<BranchInfo>(businessConfig.branches[0]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${activeBranch.coordinates.lat},${activeBranch.coordinates.lng}`;

  const handleMapError = () => {
    setUseFallback(true);
  };

  return (
    <div className="glass border border-border rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12">
      {/* Branch selector column */}
      <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 bg-secondary/30 border-r border-border">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
            Dhaka Diagnostic Network
          </span>
          <h3 className="text-2xl font-extrabold text-foreground">Our Labs & Branches</h3>
        </div>

        <div className="space-y-3.5">
          {businessConfig.branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => {
                setActiveBranch(branch);
                setMapLoaded(false);
                setUseFallback(false);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                activeBranch.id === branch.id
                  ? 'bg-card border-primary ring-2 ring-primary/20 shadow-md translate-x-1'
                  : 'bg-card/50 border-border hover:bg-card/90'
              }`}
              aria-label={`Select ${branch.name}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-foreground">{branch.shortName}</span>
                {activeBranch.id === branch.id && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{branch.address}</p>
              <div className="flex justify-between items-center pt-2 text-[10px] text-muted-foreground font-semibold border-t border-border/50">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" />
                  {branch.hours.split(' (')[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-[#16a34a]" />
                  {branch.phone}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map display column */}
      <div className="lg:col-span-7 h-[350px] lg:h-auto min-h-[400px] relative bg-slate-900 flex items-center justify-center">
        {useFallback ? (
          /* Styled Fallback Vector Map */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-tr from-slate-950 to-slate-900 text-white space-y-6 select-none animate-in fade-in duration-300">
            <div className="bg-primary/10 text-primary p-4 rounded-full border border-primary/20">
              <Map className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h4 className="font-extrabold text-lg text-foreground">Interactive Vector Outline</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Maps API failed to load or requires verification. Access native mapping metrics directly below.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left text-xs max-w-sm w-full space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="font-bold">{activeBranch.name}</span>
              </div>
              <p className="text-slate-400 pl-6">{activeBranch.address}</p>
              <p className="text-[#16a34a] pl-6 font-semibold">Coordinates: {activeBranch.coordinates.lat}, {activeBranch.coordinates.lng}</p>
            </div>
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-3 rounded-lg text-sm transition-all shadow-md flex items-center gap-1.5"
            >
              Get Directions on Mobile
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          /* Iframe map loader with fallback fallback mechanism */
          <>
            <iframe
              src={activeBranch.coordinates.embedSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoaded(true)}
              onError={handleMapError}
              className={`filter grayscale dark:invert-[0.9] dark:hue-rotate-180 transition-opacity duration-500 ${
                mapLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              title={`${activeBranch.name} Map Embed`}
            />

            {!mapLoaded && (
              /* Loading skeleton overlay */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
                <div className="h-8 w-8 rounded-full border-4 border-t-primary border-slate-800 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold tracking-wider">Syncing Satellite Coordinates...</span>
              </div>
            )}

            {/* Quick action floats */}
            {mapLoaded && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card text-foreground hover:bg-secondary border border-border font-extrabold px-4 py-2 rounded-lg text-xs transition-all shadow-md flex items-center gap-1"
                >
                  Directions
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
