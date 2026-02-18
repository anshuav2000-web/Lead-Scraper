
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
    whatsappOnly: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (params.query && params.city) {
      onSearch(params);
    }
  };

  const getPlatformColor = (p: Platform) => {
    switch(p) {
      case 'instagram': return 'border-pink-500/50 focus:border-pink-500';
      case 'linkedin': return 'border-blue-600/50 focus:border-blue-600';
      case 'facebook': return 'border-blue-500/50 focus:border-blue-500';
      case 'google_maps': return 'border-green-500/50 focus:border-green-500';
      default: return 'border-zinc-800 focus:border-red-600';
    }
  };

  const quantityOptions = ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100', 'unlimited'];

  return (
    <div className="bg-zinc-900/20 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800/40 overflow-hidden shadow-2xl transition-all duration-500">
      {/* Form Header */}
      <div className="px-6 md:px-10 py-6 border-b border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`transition-colors duration-500 ${params.platform !== 'all' ? 'text-emerald-500' : 'text-red-500'}`}>
               {params.platform !== 'all' ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
               ) : (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               )}
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Discovery Engine</h3>
              {params.platform !== 'all' && (
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">Platform Lockdown: {params.platform.replace('_', ' ')}</p>
              )}
            </div>
         </div>

         <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-10 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">No Website Only</span>
               <button 
                type="button"
                onClick={() => setParams({ ...params, noWebsiteOnly: !params.noWebsiteOnly })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${params.noWebsiteOnly ? 'bg-red-600' : 'bg-zinc-800'}`}
               >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${params.noWebsiteOnly ? 'translate-x-5.5' : 'translate-x-1'}`} />
               </button>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Whatsapp Only</span>
               <button 
                type="button"
                onClick={() => setParams({ ...params, whatsappOnly: !params.whatsappOnly })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${params.whatsappOnly ? 'bg-red-600' : 'bg-zinc-800'}`}
               >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${params.whatsappOnly ? 'translate-x-5.5' : 'translate-x-1'}`} />
               </button>
            </div>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Industry / Niche</label>
            <input
              type="text"
              placeholder="Ex: Luxury Spas"
              className="w-full px-5 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:border-red-600 focus:outline-none transition-all text-xs font-bold text-zinc-200"
              value={params.query}
              onChange={(e) => setParams({ ...params, query: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Target City</label>
            <input
              type="text"
              placeholder="Ex: London"
              className="w-full px-5 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:border-red-600 focus:outline-none transition-all text-xs font-bold text-zinc-200"
              value={params.city}
              onChange={(e) => setParams({ ...params, city: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Country</label>
            <input
              type="text"
              placeholder="Ex: UK"
              className="w-full px-5 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:border-red-600 focus:outline-none transition-all text-xs font-bold text-zinc-200"
              value={params.country}
              onChange={(e) => setParams({ ...params, country: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Platform Source</label>
            <div className="relative">
              <select
                className={`w-full px-5 py-3.5 bg-zinc-950/50 border rounded-2xl focus:outline-none transition-all text-xs font-bold text-zinc-200 appearance-none cursor-pointer ${getPlatformColor(params.platform)}`}
                value={params.platform}
                onChange={(e) => setParams({ ...params, platform: e.target.value as Platform })}
              >
                <option value="all">Any Source (Multi-Vector)</option>
                <option value="google_maps">Google Maps (GMB)</option>
                <option value="google_search">Web Search</option>
                <option value="instagram">Instagram Profiles</option>
                <option value="linkedin">LinkedIn Companies</option>
                <option value="facebook">Facebook Pages</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Batch Size</label>
            <div className="relative">
              <select
                className="w-full px-5 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:border-red-600 focus:outline-none transition-all text-xs font-bold text-zinc-200 appearance-none cursor-pointer"
                value={params.quantity}
                onChange={(e) => setParams({ ...params, quantity: e.target.value })}
              >
                {quantityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2">
              <span className="text-orange-400">✨</span>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                Gemini extracting from {params.platform === 'all' ? 'global business cloud' : params.platform.replace('_', ' ')}
              </p>
           </div>
           
           <Button 
            type="submit" 
            isLoading={isLoading} 
            className={`w-full sm:w-auto px-16 py-5 rounded-2xl md:rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-2xl transition-all duration-500 ${params.platform !== 'all' ? 'bg-emerald-600 shadow-emerald-900/30' : 'bg-gradient-to-r from-[#dc2626] to-[#e11d48] shadow-red-900/30'}`}
           >
            {params.platform === 'all' ? 'Extract Leads' : `Scrape ${params.platform.split('_')[0]}`}
           </Button>
        </div>
      </form>
    </div>
  );
};
