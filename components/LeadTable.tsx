
import React, { useState } from 'react';
import { Lead } from '../types.ts';
import { Button } from './Button.tsx';

interface LeadTableProps {
  leads: Lead[];
  onSendToWebhook: (lead: Lead) => void;
  isSyncing: string | null;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onSendToWebhook, isSyncing }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <div className="bg-zinc-900/30 backdrop-blur-sm p-16 rounded-3xl border border-dashed border-zinc-800 text-center flex flex-col items-center">
        <div className="mb-6 w-20 h-20 bg-zinc-900 text-red-500 rounded-full flex items-center justify-center border border-zinc-800 shadow-2xl shadow-red-900/10">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <h3 className="text-xl font-extrabold text-white">No Verified Leads Yet</h3>
        <p className="text-zinc-500 mt-2 max-w-sm">Initiate a search to find business entities and verify them across the web.</p>
      </div>
    );
  }

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-zinc-900/50 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden animate-fade-in backdrop-blur-sm">
      {/* Detail Modal */}
      {modalLead && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="bg-zinc-950 w-full max-w-4xl rounded-[2.5rem] border border-zinc-800 shadow-[0_0_80px_rgba(220,38,38,0.15)] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-950 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                  {modalLead.companyName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white leading-tight">{modalLead.companyName}</h2>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{modalLead.category}</p>
                </div>
              </div>
              <button onClick={() => setModalLead(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <section>
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Core Info</h3>
                  <div className="space-y-4">
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                       <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Description</span>
                       <p className="text-sm text-zinc-300 leading-relaxed font-medium">{modalLead.description || 'No description found.'}</p>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                       <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Address</span>
                       <p className="text-sm text-zinc-300 font-bold leading-relaxed">{modalLead.address || modalLead.city}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Contact</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {modalLead.phoneNumber && (
                      <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          <span className="text-sm font-bold">{modalLead.phoneNumber}</span>
                        </div>
                        <button onClick={() => handleCopy(modalLead.phoneNumber, 'phone-modal')} className="text-zinc-600 hover:text-white">
                          {copiedId === 'phone-modal' ? '✓' : '❐'}
                        </button>
                      </div>
                    )}
                    {modalLead.email && (
                      <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          <span className="text-sm font-bold truncate max-w-[200px]">{modalLead.email}</span>
                        </div>
                        <button onClick={() => handleCopy(modalLead.email, 'email-modal')} className="text-zinc-600 hover:text-white">
                          {copiedId === 'email-modal' ? '✓' : '❐'}
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Quality Report</h3>
                  <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-black text-red-500">{modalLead.qualityScore}%</span>
                      <span className="text-[9px] font-black text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full uppercase">AI Confidence</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed italic mb-6">"{modalLead.qualityReasoning}"</p>
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-zinc-600 uppercase block">Verification Links</span>
                      {modalLead.sources?.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 hover:text-red-400 block truncate underline">
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </section>
                
                <div className="pt-10">
                  <Button 
                    className="w-full py-5" 
                    onClick={() => onSendToWebhook(modalLead)}
                    isLoading={isSyncing === modalLead.id}
                  >
                    {modalLead.status === 'processed' ? 'Synced Successfully' : 'Push to Automation'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-zinc-950/50 border-b border-zinc-800">
            <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest w-[50%]">Company</th>
            <th className="px-4 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest w-[15%] hidden md:table-cell">City</th>
            <th className="px-4 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest w-[15%]">Fidelity</th>
            <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right w-[20%]">Control</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-red-500/5 transition-all group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setModalLead(lead)} className="font-black text-zinc-100 hover:text-red-500 transition-colors text-sm truncate">
                    {lead.companyName}
                  </button>
                  {lead.email && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" title="Email Available"></div>}
                </div>
                <div className="text-[10px] text-zinc-600 font-bold uppercase mt-1 truncate">{lead.category}</div>
              </td>
              <td className="px-4 py-5 hidden md:table-cell">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{lead.city}</span>
              </td>
              <td className="px-4 py-5">
                <div className="flex flex-col gap-1 w-16">
                  <span className={`text-[9px] font-black ${lead.qualityScore > 80 ? 'text-emerald-500' : 'text-red-500'}`}>{lead.qualityScore}%</span>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${lead.qualityScore > 80 ? 'bg-emerald-500' : 'bg-red-600'}`} style={{ width: `${lead.qualityScore}%` }}></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <Button 
                  variant={lead.status === 'processed' ? 'success' : 'secondary'} 
                  size="sm" 
                  className="text-[9px] h-8"
                  isLoading={isSyncing === lead.id}
                  onClick={() => onSendToWebhook(lead)}
                >
                  {lead.status === 'processed' ? 'Synced' : 'Push'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
