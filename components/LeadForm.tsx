
import React, { useState } from 'react';
import { SearchParams, Platform } from '../types.ts';
import { Button } from './Button.tsx';

interface LeadFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSearch, isLoading }) => {
  const [params, setParams] = useState<SearchParams>({
    query: '',
    city: '',
    country: '',
    platform: 'all',
    quantity: '10',
    noWebsiteOnly: false,
    whatsappOnly: false,
    onlyNewBusinesses: false,
    deepIntelligence: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (params.query && params.city) {
      onSearch(params);
    }
  };

  const getPlatformColor = (p: Platform) => {
    switch(p) {
      case 'instagram': return 'border-pink-500/50 focus:border-pink-500 bg-pink-500/5';
      case 'linkedin': return 'border-blue-600/50 focus:border-blue-600 bg-blue-600/5';
      case 'facebook': return 'border-blue-500/50 focus:border-blue-500 bg-blue-500/5';
      case 'google_maps': return 'border-green-500/50 focus:border-green-500 bg-green-500/5';
      default: return 'border-zinc-800 focus:border-red-600';
    }
  };

  const quantityOptions = ['10', '20', '30', '50', '100', 'unlimited'];

  return (
    <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/[0.06] overflow-hidden shadow-2xl transition-all duration-500 backdrop-blur-xl">
      <div className="px-8 md:px-12 pt-16 pb-8 text-center flex flex-col items-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter leading-none mb-6 max-w-3xl">
          Find New Leads
        </h2>
        <p className="text-[11px] md:text-xs font-semibold text-zinc-500 uppercase tracking-[0.3em] max-w-xl">
          Configure search parameters to start business extraction
        </p>
      </div>

      <div className="px-6 md:px-12 py-6 border-b border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01]">
         <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className={`transition-all duration-500 p-2.5 rounded-xl bg-zinc-950 border ${params.platform !== 'all' ? 'text-emerald-500 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'text-red-500 border-red-500/20'}`}>
               <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
               </svg>
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Neural Filter Console</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Status: {isLoading ? 'Scanning Cluster...' : 'Systems Ready'}</p>
              </div>
            </div>
         </div>

         <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
               <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${params.onlyNewBusinesses ? 'text-cyan-400' : 'text-zinc-500'}`}>New Launch</span>
               <button 
                type="button"
                onClick={() => setParams({ ...params, onlyNewBusinesses: !params.onlyNewBusinesses })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all focus:outline-none ${params.onlyNewBusinesses ? 'bg-cyan-600 shadow-[0_0_12px_rgba(8,145,178,0.4)]' : 'bg-zinc-800'}`}
               >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${params.onlyNewBusinesses ? 'translate-x-5.5' : 'translate-x-1'}`} />
               </button>
            </div>
            
            <div className="flex items-center gap-2">
               <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${params.whatsappOnly ? 'text-blue-400' : 'text-zinc-500'}`}>WhatsApp Hub</span>
               <button 
                type="button"
                onClick={() => setParams({ ...params, whatsappOnly: !params.whatsappOnly })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all focus:outline-none ${params.whatsappOnly ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`}
               >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${params.whatsappOnly ? 'translate-x-5.5' : 'translate-x-1'}`} />
               </button>
            </div>

            <div className="flex items-center gap-2">
               <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${params.noWebsiteOnly ? 'text-red-500' : 'text-zinc-500'}`}>No Website</span>
               <button 
                type="button"
                onClick={() => setParams({ ...params, noWebsiteOnly: !params.noWebsiteOnly })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all focus:outline-none ${params.noWebsiteOnly ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.3)]' : 'bg-zinc-800'}`}
               >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${params.noWebsiteOnly ? 'translate-x-5.5' : 'translate-x-1'}`} />
               </button>
            </div>

            <div className="flex items-center gap-2">
               <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${params.deepIntelligence ? 'text-emerald-500' : 'text-zinc-500'}`}>Deep Intel</span>
               <button 
                type="button"
                onClick={() => setParams({ ...params, deepIntelligence: !params.deepIntelligence })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all focus:outline-none ${params.deepIntelligence ? 'bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'}`}
               >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${params.deepIntelligence ? 'translate-x-5.5' : 'translate-x-1'}`} />
               </button>
            </div>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Business Type</label>
            <input
              type="text"
              placeholder="Ex: Luxury Real Estate"
              className="w-full px-5 py-4 bg-zinc-950/40 border border-white/[0.05] rounded-2xl focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 focus:outline-none transition-all text-xs font-semibold text-zinc-200"
              value={params.query}
              onChange={(e) => setParams({ ...params, query: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">City</label>
            <input
              type="text"
              placeholder="Ex: Dubai"
              className="w-full px-5 py-4 bg-zinc-950/40 border border-white/[0.05] rounded-2xl focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 focus:outline-none transition-all text-xs font-semibold text-zinc-200"
              value={params.city}
              onChange={(e) => setParams({ ...params, city: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Country</label>
            <input
              type="text"
              placeholder="Ex: UAE"
              className="w-full px-5 py-4 bg-zinc-950/40 border border-white/[0.05] rounded-2xl focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 focus:outline-none transition-all text-xs font-semibold text-zinc-200"
              value={params.country}
              onChange={(e) => setParams({ ...params, country: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Source Node</label>
            <div className="relative">
              <select
                className={`w-full px-5 py-4 bg-zinc-950/40 border rounded-2xl focus:outline-none transition-all text-xs font-bold text-zinc-200 appearance-none cursor-pointer tracking-tight ${getPlatformColor(params.platform)}`}
                value={params.platform}
                onChange={(e) => setParams({ ...params, platform: e.target.value as Platform })}
              >
                <option value="all">Global Meta-Search</option>
                <option value="google_maps">Google Maps (Local)</option>
                <option value="google_search">General Web (B2B)</option>
                <option value="instagram">Instagram (Visual Brands)</option>
                <option value="linkedin">LinkedIn (Professional)</option>
                <option value="facebook">Facebook (Social Business)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Quantity</label>
            <div className="relative">
              <select
                className="w-full px-5 py-4 bg-zinc-950/40 border border-white/[0.05] rounded-2xl focus:border-red-600/50 focus:outline-none transition-all text-xs font-bold text-zinc-200 appearance-none cursor-pointer"
                value={params.quantity}
                onChange={(e) => setParams({ ...params, quantity: e.target.value })}
              >
                {quantityOptions.map(opt => <option key={opt} value={opt}>{opt} TARGETS</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-white/[0.05]">
           <div className="flex items-start gap-4 max-w-md">
              <div className={`shrink-0 w-10 h-10 rounded-2xl bg-zinc-900 border border-white/[0.05] flex items-center justify-center ${params.onlyNewBusinesses ? 'text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse' : 'text-red-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <p className="text-[11px] font-medium text-zinc-500 tracking-wide leading-relaxed">
                <span className="text-zinc-300 font-bold">{params.platform === 'all' ? 'Global Clusters' : params.platform.replace('_', ' ')}</span> prioritized. 
                {params.onlyNewBusinesses && <span className="text-cyan-400 font-bold ml-1">Hunting for Grand Openings & Fresh Startups only.</span>}
                {params.whatsappOnly && <span className="text-blue-400 font-bold ml-1">Verifying direct WhatsApp endpoints.</span>}
                {params.noWebsiteOnly && <span className="text-red-500 font-bold ml-1">Filtering out entities with web domains.</span>}
              </p>
           </div>
           
           <Button 
            type="submit" 
            isLoading={isLoading} 
            size="lg"
            className={`w-full md:w-auto px-16 py-6 text-xs font-bold transition-all duration-500 ${params.onlyNewBusinesses ? 'bg-gradient-to-br from-cyan-600 to-indigo-700 shadow-[0_10px_40px_rgba(8,145,178,0.3)]' : params.deepIntelligence ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-[0_10px_40px_rgba(16,185,129,0.15)]' : 'bg-gradient-to-br from-red-600 to-rose-700 shadow-[0_10px_40px_rgba(220,38,38,0.15)]'}`}
           >
            {isLoading ? 'Scanning...' : 'Execute Scrape'}
           </Button>
        </div>
      </form>
    </div>
  );
};
