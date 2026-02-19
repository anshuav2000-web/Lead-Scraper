
import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-24 py-12 flex flex-col items-center text-center">
      {/* Hero Section */}
      <section className="max-w-4xl space-y-8 flex flex-col items-center">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Platform Genesis</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[0.95] md:leading-[0.85] text-gradient">
          The Future of <br />
          <span className="text-red-600">Lead Intelligence.</span>
        </h1>
        <p className="text-zinc-400 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-80">
          Cartel Scraper is not just a tool; it's an extraction node designed for surgical precision in a world of fragmented data.
        </p>
      </section>

      {/* Core Philosophy */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <div className="bg-zinc-900/30 p-10 rounded-[2.5rem] border border-white/[0.05] space-y-4">
          <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight uppercase">Neural Discovery</h3>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            Our Cartel Pro engine scans global business clusters to find entities that traditional scrapers miss.
          </p>
        </div>
        <div className="bg-zinc-900/30 p-10 rounded-[2.5rem] border border-white/[0.05] space-y-4">
          <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight uppercase">Multi-Vector Logic</h3>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            Every lead is cross-referenced through social signals, web domains, and maps to ensure 99% data fidelity.
          </p>
        </div>
        <div className="bg-zinc-900/30 p-10 rounded-[2.5rem] border border-white/[0.05] space-y-4">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight uppercase">Instant Handover</h3>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            Direct synchronization with your enterprise stack via ultra-low latency Webhook Nodes.
          </p>
        </div>
      </section>

      {/* Tech Breakdown */}
      <section className="bg-zinc-950/50 rounded-[3rem] border border-white/[0.05] p-12 md:p-20 w-full max-w-5xl space-y-12 text-left">
        <div className="space-y-4 text-center">
          <h2 className="text-4xl font-black text-white tracking-tighter">The Cartel Infrastructure</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">A closer look at our extraction methodology</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">Cartel Pro Intelligence</h4>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              We leverage the most advanced LLMs trained specifically for business data extraction. Unlike standard scripts, our AI understands context—distinguishing a genuine business from a placeholder or directory site.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Real-time Verification</h4>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              Data decays at 3% per month. Our scraper performs real-time handshakes with web servers to verify that phones, emails, and physical addresses are active at the exact moment of extraction.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Global Reach</h4>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              Covering 190+ countries and thousands of business categories, Cartel Scraper maps the global economy with granular detail, from local Dubai real estate to Manhattan tech hubs.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-purple-500 uppercase tracking-widest">Privacy First</h4>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              All extractions comply with global data harvesting standards, focusing strictly on publicly available business metadata to power your B2B growth engine safely.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <div className="pt-12 border-t border-white/[0.05] w-full flex flex-col items-center">
        <div className="w-12 h-12 bg-zinc-900 border border-white/[0.1] rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6">C</div>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em]">Built for the modern cartel of business leaders.</p>
      </div>
    </div>
  );
};
