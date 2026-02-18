
import React, { useMemo, useState } from 'react';
import { Lead } from '../types.ts';
import { Button } from './Button.tsx';

interface MapViewProps {
  leads: Lead[];
  onSendToWebhook?: (lead: Lead) => void;
  isSyncing?: string | null;
}

export const MapView: React.FC<MapViewProps> = ({ leads, onSendToWebhook, isSyncing }) => {
  const [hoveredLead, setHoveredLead] = useState<Lead | null>(null);

  // Parse coordinates and normalize them for a stylized radar/map view
  const plotData = useMemo(() => {
    if (leads.length === 0) return [];

    const parsed = leads.map(l => {
      const parts = l.coordinates?.split(',').map(p => parseFloat(p.trim()));
      if (parts && parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { lat: parts[0], lng: parts[1], lead: l };
      }
      return null;
    }).filter(Boolean) as { lat: number; lng: number; lead: Lead }[];

    if (parsed.length === 0) return [];

    const lats = parsed.map(p => p.lat);
    const lngs = parsed.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    // Normalize to 10-90% of a 100x100 grid to keep points away from edges
    return parsed.map(p => ({
      x: 10 + ((p.lng - minLng) / lngRange) * 80,
      y: 90 - ((p.lat - minLat) / latRange) * 80, // Invert lat for Y axis
      lead: p.lead
    }));
  }, [leads]);

  return (
    <div className="relative bg-zinc-950/80 rounded-3xl border border-zinc-800 h-[600px] overflow-hidden group shadow-2xl">
      {/* Background Tech Grids */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-red-500/5"></div>
      </div>

      {/* Radar Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-zinc-800/40 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-zinc-800/40 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-zinc-800/40 rounded-full pointer-events-none"></div>

      {/* Leads plotting */}
      <div className="relative w-full h-full p-12">
        {plotData.length > 0 ? (
          plotData.map((point, idx) => (
            <div 
              key={point.lead.id}
              className="absolute group/marker cursor-pointer transition-transform hover:scale-125 z-10"
              style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setHoveredLead(point.lead)}
              onMouseLeave={() => setHoveredLead(null)}
            >
              {/* Outer Glow Pulse */}
              <div className={`absolute -inset-4 rounded-full opacity-0 group-hover/marker:opacity-100 transition-opacity bg-red-600/20 blur-xl ${point.lead.qualityScore > 85 ? 'animate-pulse' : ''}`}></div>
              
              {/* Point Marker */}
              <div className={`w-3 h-3 rounded-full border-2 border-white/20 shadow-[0_0_15px_rgba(220,38,38,0.8)] ${point.lead.qualityScore > 85 ? 'bg-red-500' : 'bg-rose-800'}`}></div>
              
              {/* Label (Visible on marker group hover) */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-all duration-300 transform translate-y-1 group-hover/marker:translate-y-0">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 whitespace-nowrap shadow-2xl">
                   <p className="text-[10px] font-black text-white uppercase tracking-tighter break-words">{point.lead.companyName}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-600 flex-col gap-4">
             <div className="w-16 h-16 rounded-full border border-dashed border-zinc-800 flex items-center justify-center">
                <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
             </div>
             <p className="text-xs font-black uppercase tracking-widest">No Geo-Coordinates available for this set</p>
          </div>
        )}
      </div>

      {/* Floating Detail Card */}
      {hoveredLead && (
        <div className="absolute bottom-8 left-8 right-8 md:right-auto md:w-96 bg-zinc-900/90 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-2xl animate-fade-in z-50">
           <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-black text-white leading-tight break-words">{hoveredLead.companyName}</h4>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 break-words">{hoveredLead.category}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg shrink-0 ml-2">
                <span className="text-[10px] font-black text-red-500">{hoveredLead.qualityScore}%</span>
              </div>
           </div>
           <div className="space-y-3">
              <div className="flex items-start gap-3 text-zinc-400">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                <span className="text-xs font-medium leading-relaxed break-words">{hoveredLead.address || hoveredLead.city}</span>
              </div>
              <div className="flex items-start gap-3 text-zinc-400">
                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span className="text-xs font-medium break-all leading-relaxed">{hoveredLead.phoneNumber || 'Unlisted'}</span>
              </div>
              <div className="flex items-start gap-3 text-zinc-400">
                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="text-xs font-medium break-all leading-relaxed">{hoveredLead.email || 'Unlisted Email'}</span>
              </div>
           </div>
           
           {onSendToWebhook && (
             <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-3">
               {hoveredLead.status === 'processed' && (
                 <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                   <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   Synced Successfully
                 </span>
               )}
               <Button 
                variant={hoveredLead.status === 'processed' ? 'secondary' : 'primary'}
                size="sm"
                className="w-full text-[9px] font-black uppercase"
                isLoading={isSyncing === hoveredLead.id}
                onClick={(e) => { e.stopPropagation(); onSendToWebhook(hoveredLead); }}
               >
                 {hoveredLead.status === 'processed' ? 'Resend to Webhook' : 'Transfer n8n'}
               </Button>
             </div>
           )}

           {!onSendToWebhook && (
             <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[9px] font-black text-zinc-500 uppercase">Verification Verified</span>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-red-500">{i}</div>)}
                </div>
             </div>
           )}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-6 right-6 flex flex-col gap-2">
         <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">High Accuracy Lead</span>
         </div>
         <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-800"></div>
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Verified Lead</span>
         </div>
      </div>
    </div>
  );
};
