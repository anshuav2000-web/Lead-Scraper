
import React, { useState } from 'react';
import { Lead } from '../types.ts';
import { Button } from './Button.tsx';

interface LeadTableProps {
  leads: Lead[];
  onSendToWebhook: (lead: Lead) => void;
  isSyncing: string | null;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onSendToWebhook, isSyncing }) => {
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <div className="bg-zinc-900/10 backdrop-blur-sm p-16 rounded-[2.5rem] border border-dashed border-zinc-800 text-center flex flex-col items-center">
        <div className="mb-6 w-20 h-20 bg-zinc-900 text-zinc-700 rounded-full flex items-center justify-center border border-zinc-800">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Intelligence Vault Empty</h3>
        <p className="text-zinc-600 mt-2 max-w-sm font-bold uppercase text-[9px] tracking-widest">Execute a neural scan to discover and verify target entities.</p>
      </div>
    );
  }

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-zinc-900/30 rounded-[2rem] shadow-2xl border border-zinc-800/50 overflow-hidden animate-fade-in">
      {modalLead && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <div className="bg-[#0c0c0e] w-full max-w-6xl rounded-[3rem] border border-zinc-800 shadow-[0_0_100px_rgba(220,38,38,0.1)] overflow-hidden">
            <div className="px-10 py-8 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-[#0c0c0e] z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">
                  {modalLead.companyName[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{modalLead.companyName}</h2>
                  <div className="flex items-center gap-3 mt-1">
                     <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{modalLead.category}</span>
                     <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{modalLead.city}, {modalLead.country}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setModalLead(null)} className="p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Dossier Left Section */}
              <div className="lg:col-span-8 space-y-12">
                <section>
                   <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                     Surgical Overview
                   </h3>
                   <div className="space-y-6">
                      <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800/50">
                         <span className="text-[9px] font-black text-red-500/50 uppercase block mb-3">Company Abstract</span>
                         <p className="text-sm text-zinc-300 leading-relaxed font-bold">{modalLead.description || 'Core data pending verification.'}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <DetailItem label="Industry" value={modalLead.industry} />
                         <DetailItem label="Team Size" value={modalLead.companySize} />
                         <DetailItem label="Revenue Est." value={modalLead.annualRevenueEstimate} />
                         <DetailItem label="Funding" value={modalLead.fundingStatus} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
                            <span className="text-[9px] font-black text-zinc-600 uppercase block mb-2">Growth Signals</span>
                            <p className="text-xs text-emerald-500 font-black tracking-tight leading-relaxed">{modalLead.growthSignals || 'Steady signals observed.'}</p>
                         </div>
                         <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
                            <span className="text-[9px] font-black text-zinc-600 uppercase block mb-2">Social Signals</span>
                            <p className="text-xs text-zinc-400 font-bold leading-relaxed">{modalLead.socialSignals || 'Digital pulse verified.'}</p>
                         </div>
                      </div>
                   </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <section>
                      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Contact & Operations</h3>
                      <div className="space-y-4">
                         <DetailItem label="Address" value={modalLead.address} />
                         <DetailItem label="Hours" value={modalLead.businessHours} />
                         <DetailItem label="Coordinates" value={modalLead.coordinates} />
                         <DetailItem label="Rating" value={`${modalLead.rating} (${modalLead.reviewCount} Reviews)`} />
                      </div>
                   </section>

                   <section>
                      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Tech Infrastructure</h3>
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {modalLead.techStack && modalLead.techStack.length > 0 ? (
                              modalLead.techStack.map(tech => (
                                <span key={tech} className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">{tech}</span>
                              ))
                            ) : (
                              <p className="text-[10px] text-zinc-700 font-black uppercase italic">Scanning architecture...</p>
                            )}
                        </div>
                        <DetailItem label="Last Digital Activity" value={modalLead.lastActivity} />
                      </div>
                   </section>
                </div>

                <section>
                   <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Verification Network</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {modalLead.sources?.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 hover:border-red-600/30 transition-all group/source">
                           <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-zinc-600 group-hover/source:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              <span className="text-[10px] font-black text-zinc-400 uppercase group-hover/source:text-white transition-colors">{s.title}</span>
                           </div>
                           <span className="text-[8px] font-black text-zinc-700 uppercase">Handshake</span>
                        </a>
                      ))}
                   </div>
                </section>
              </div>

              {/* Dossier Right Sidebar */}
              <div className="lg:col-span-4 space-y-12">
                <section>
                   <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Neural Audit</h3>
                   <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[2.5rem] border border-red-600/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6">
                         <div className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase border ${modalLead.verificationConfidence === 'high' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                            {modalLead.verificationConfidence} confidence
                         </div>
                      </div>
                      <div className="mb-8">
                         <span className="text-6xl font-black text-white tracking-tighter">{modalLead.qualityScore}%</span>
                         <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-2">Fidelity Score</p>
                      </div>
                      <p className="text-xs text-zinc-400 font-bold leading-relaxed italic mb-10 border-l-2 border-red-600 pl-4">
                         "{modalLead.qualityReasoning}"
                      </p>
                      
                      <div className="space-y-4">
                        <ContactAction label="Phone" value={modalLead.phoneNumber} id="p-mod" onCopy={handleCopy} copiedId={copiedId} />
                        <ContactAction label="Email" value={modalLead.email} id="e-mod" onCopy={handleCopy} copiedId={copiedId} />
                        <ContactAction label="Website" value={modalLead.website} id="w-mod" onCopy={handleCopy} copiedId={copiedId} isLink />
                      </div>
                   </div>
                </section>

                <section>
                   <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Social Nodes</h3>
                   <div className="grid grid-cols-1 gap-3">
                      <SocialItem label="Instagram" value={modalLead.instagram} color="text-pink-500" />
                      <SocialItem label="LinkedIn" value={modalLead.linkedin} color="text-blue-600" />
                      <SocialItem label="Facebook" value={modalLead.facebook} color="text-blue-500" />
                   </div>
                </section>

                <div className="pt-6">
                   <Button 
                    size="lg"
                    className="w-full py-6 text-[11px] shadow-[0_0_40px_rgba(220,38,38,0.2)]" 
                    onClick={() => onSendToWebhook(modalLead)}
                    isLoading={isSyncing === modalLead.id}
                   >
                    {modalLead.status === 'processed' ? 'Lead Synchronized' : 'Transfer to CRM Node'}
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-zinc-950/80 border-b border-zinc-800">
              <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Business Identifier</th>
              <th className="px-6 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Vertical</th>
              <th className="px-6 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Fidelity</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] text-right">Handover</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-red-500/[0.03] transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover:text-red-500 group-hover:border-red-600/30 transition-all">
                      {lead.companyName[0]}
                    </div>
                    <div className="flex flex-col">
                      <button onClick={() => setModalLead(lead)} className="text-sm font-black text-white hover:text-red-500 transition-colors text-left uppercase tracking-tight">
                        {lead.companyName}
                      </button>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{lead.city}</span>
                        {lead.email && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Email Verified"></div>}
                        {lead.phoneNumber && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Phone Verified"></div>}
                        {!lead.website && <span className="text-[8px] font-black text-red-500/80 uppercase tracking-tighter border border-red-500/20 px-1 rounded">No Web</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
                    {lead.category.split(' ').slice(0, 2).join(' ')}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex flex-col gap-1.5 w-24">
                    <div className="flex justify-between items-center px-1">
                      <span className={`text-[9px] font-black ${lead.qualityScore > 80 ? 'text-emerald-500' : lead.qualityScore > 50 ? 'text-orange-500' : 'text-red-600'}`}>
                        {lead.qualityScore}%
                      </span>
                      <span className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter">ACCURACY</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                      <div className={`h-full transition-all duration-1000 ${lead.qualityScore > 80 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-600'}`} style={{ width: `${lead.qualityScore}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <Button 
                    variant={lead.status === 'processed' ? 'success' : 'ghost'} 
                    size="sm" 
                    className="text-[10px] font-black border-zinc-800"
                    isLoading={isSyncing === lead.id}
                    onClick={() => onSendToWebhook(lead)}
                  >
                    {lead.status === 'processed' ? 'SUCCESS' : 'TRANSFER'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper Components
const DetailItem = ({ label, value }: { label: string, value?: string }) => (
  <div className="space-y-1">
    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">{label}</span>
    <p className="text-xs font-bold text-zinc-300 break-words">{value || 'N/A'}</p>
  </div>
);

const ContactAction = ({ label, value, id, onCopy, copiedId, isLink }: { label: string, value?: string, id: string, onCopy: any, copiedId: string | null, isLink?: boolean }) => (
  <div className="flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-zinc-800/50 group/item">
    <div className="flex flex-col">
       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</span>
       {isLink && value ? (
         <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-xs font-black text-red-500 hover:text-white transition-colors truncate max-w-[180px]">{value}</a>
       ) : (
         <span className="text-xs font-black text-white truncate max-w-[180px]">{value || 'Unlisted'}</span>
       )}
    </div>
    {value && (
      <button onClick={() => onCopy(value, id)} className="text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">
         {copiedId === id ? 'COPIED' : 'COPY'}
      </button>
    )}
  </div>
);

const SocialItem = ({ label, value, color }: { label: string, value?: string, color: string }) => (
  <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800/50">
    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
    {value ? (
       <a href={value.startsWith('http') ? value : '#'} target="_blank" rel="noreferrer" className={`text-[10px] font-black ${color} hover:text-white transition-colors uppercase tracking-tighter truncate max-w-[150px]`}>{value}</a>
    ) : (
       <span className="text-[9px] font-black text-zinc-800 uppercase italic">Not Located</span>
    )}
  </div>
);
