
import React, { useState } from 'react';
import { User, Plan, SystemConfig, Lead, Invoice, BillingCycle } from '../types.ts';
import { Button } from './Button.tsx';
import { LeadForm } from './LeadForm.tsx';
import { LeadTable } from './LeadTable.tsx';
import { ReportingView } from './ReportingView.tsx';
import { PricingPage } from './PricingPage.tsx';
import { BillingSection } from './BillingSection.tsx';
import { WebhookSettings } from './WebhookSettings.tsx';
import { CheckoutModal } from './CheckoutModal.tsx';
import { AboutPage } from './AboutPage.tsx';
import { searchLeads, sendToWebhook } from '../services/geminiService.ts';

interface UserPortalProps {
  user: User;
  plans: Plan[];
  config: SystemConfig;
  leads: Lead[];
  invoices: Invoice[];
  onLogout: () => void;
  onUpdateUser: (u: User) => void;
  onSyncLeads: (l: Lead[]) => void;
  onUpdateLeadStatus: (id: string, status: 'processed') => void;
  onAddInvoice: (i: Invoice) => void;
}

const NavButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode, disabled?: boolean, mobile?: boolean }> = ({ active, onClick, children, disabled, mobile }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all relative ${mobile ? 'w-full text-left py-4' : ''} ${disabled ? 'opacity-30 cursor-not-allowed' : active ? 'bg-white/[0.06] text-white border border-white/[0.1]' : 'text-zinc-500 hover:text-zinc-300'}`}
  >
    {children}
  </button>
);

export const UserPortal: React.FC<UserPortalProps> = ({ 
  user, plans, config, leads, invoices, 
  onLogout, onUpdateUser, onSyncLeads, onUpdateLeadStatus, onAddInvoice 
}) => {
  const [activeMenu, setActiveMenu] = useState<'scraper' | 'reports' | 'pricing' | 'billing' | 'webhooks' | 'about'>('scraper');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ plan: Plan; cycle: BillingCycle } | null>(null);

  const isEnterprise = user.subscription.planId === 'enterprise';
  
  const handleMenuClick = (menu: 'scraper' | 'reports' | 'pricing' | 'billing' | 'webhooks' | 'about') => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
  };

  const handleExtraction = async (params: any) => {
     setIsLoading(true);
     try {
       const results = await searchLeads(params);
       const leadsWithUser = results.map(l => ({ ...l, userId: user.id }));
       onSyncLeads(leadsWithUser);
       
       onUpdateUser({
         ...user,
         subscription: {
           ...user.subscription,
           leadsUsedThisMonth: user.subscription.leadsUsedThisMonth + results.length
         }
       });
     } catch (e: any) {
       console.error("Extraction failed:", e);
       if (e.message.includes("Requested entity was not found")) {
          alert("Your API key session has expired or is invalid. Please re-authenticate.");
          await window.aistudio.openSelectKey();
          return;
       }
       alert(`Extraction Error: ${e.message || "Connection failure."}`);
     } finally {
       setIsLoading(false);
     }
  };

  const handleManualWebhook = async (lead: Lead) => {
    if (!isEnterprise || !user.webhook?.enabled || !user.webhook?.url) {
      alert("Enterprise plan required for webhook automation.");
      return;
    }

    setIsSyncing(lead.id);
    try {
      const success = await sendToWebhook(lead, user.webhook.url);
      if (success) {
        onUpdateLeadStatus(lead.id, 'processed');
      } else {
        alert("Automation hub rejected the payload.");
      }
    } catch (err) {
      alert("Network error: Automation hub unreachable.");
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-500/30">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 animate-fade-in">
           <div className="relative mb-12">
              <div className="w-20 h-20 border-2 border-red-600/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-14 h-14 bg-red-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(220,38,38,0.4)]">
                    <svg className="w-7 h-7 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 </div>
              </div>
           </div>
           <h2 className="text-4xl font-extrabold text-white tracking-tight text-center mb-4">Neural Scan Active</h2>
           <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] text-center max-w-xs leading-relaxed">
             Syncing with global data clusters to verify lead integrity.
           </p>
        </div>
      )}

      <nav className="border-b border-white/[0.05] bg-black/60 backdrop-blur-3xl sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={() => setActiveMenu('scraper')}>
            <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-[0_5px_20px_rgba(220,38,38,0.3)] group-hover:scale-105 transition-transform duration-500">C</div>
            <div className="flex flex-col">
              <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">Canvas Cartel</h1>
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-[0.4em] mt-1.5 opacity-80">Extraction Hub</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.04]">
            <NavButton active={activeMenu === 'scraper'} onClick={() => handleMenuClick('scraper')}>Search</NavButton>
            <NavButton active={activeMenu === 'reports'} onClick={() => handleMenuClick('reports')}>Results</NavButton>
            <NavButton active={activeMenu === 'pricing'} onClick={() => handleMenuClick('pricing')}>Plans</NavButton>
            <NavButton active={activeMenu === 'billing'} onClick={() => handleMenuClick('billing')}>Billing</NavButton>
            <NavButton active={activeMenu === 'webhooks'} onClick={() => handleMenuClick('webhooks')} disabled={!isEnterprise}>Webhooks</NavButton>
            <NavButton active={activeMenu === 'about'} onClick={() => handleMenuClick('about')}>About</NavButton>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end">
               <span className="text-[10px] font-bold text-zinc-300 tracking-wider uppercase">{user.name}</span>
               <span className="text-[9px] font-extrabold text-red-500/80 uppercase mt-0.5">{user.subscription.planId}</span>
            </div>
            <button onClick={onLogout} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-zinc-400 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-zinc-950 border-b border-zinc-900 animate-fade-in p-6 space-y-3">
             <NavButton active={activeMenu === 'scraper'} onClick={() => handleMenuClick('scraper')} mobile>Search</NavButton>
             <NavButton active={activeMenu === 'reports'} onClick={() => handleMenuClick('reports')} mobile>Results</NavButton>
             <NavButton active={activeMenu === 'pricing'} onClick={() => handleMenuClick('pricing')} mobile>Plans</NavButton>
             <NavButton active={activeMenu === 'billing'} onClick={() => handleMenuClick('billing')} mobile>Billing</NavButton>
             <NavButton active={activeMenu === 'webhooks'} onClick={() => handleMenuClick('webhooks')} disabled={!isEnterprise} mobile>Webhooks</NavButton>
             <NavButton active={activeMenu === 'about'} onClick={() => handleMenuClick('about')} mobile>About</NavButton>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto w-full px-6 py-16 space-y-20">
         {activeMenu === 'scraper' && (
           <div className="space-y-20 animate-fade-in">
              <header className="space-y-6 max-w-4xl mx-auto text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Neural Scraper V2.5</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[0.95] md:leading-[0.85] text-gradient">
                  High Precision <br />
                  <span className="text-red-600">Lead Discovery.</span>
                </h2>
                <p className="text-zinc-400 font-medium text-lg md:text-xl mt-8 max-w-2xl leading-relaxed opacity-80">
                  Search through global business databases using Cartel Pro. 
                  Extract, verify, and enrich data with surgical precision.
                </p>
              </header>

              <div className="space-y-16">
                <LeadForm onSearch={handleExtraction} isLoading={isLoading} />
                <LeadTable leads={leads} onSendToWebhook={handleManualWebhook} isSyncing={isSyncing} />
              </div>
           </div>
         )}
         {activeMenu === 'reports' && <ReportingView leads={leads} />}
         {activeMenu === 'pricing' && (
           <PricingPage 
              plans={plans} config={config} user={user} 
              onSubscribe={(p, c) => setCheckoutData({ plan: plans.find(pl => pl.id === p)!, cycle: c })} 
           />
         )}
         {activeMenu === 'billing' && <BillingSection user={user} invoices={invoices} plans={plans} config={config} />}
         {activeMenu === 'webhooks' && isEnterprise && (
           <WebhookSettings user={user} onUpdateWebhook={(config) => onUpdateUser({ ...user, webhook: config })} />
         )}
         {activeMenu === 'about' && <AboutPage />}
      </main>

      {checkoutData && (
        <CheckoutModal 
           plan={checkoutData.plan} cycle={checkoutData.cycle} config={config} user={user}
           onClose={() => setCheckoutData(null)} 
           onSuccess={() => {
              const amount = checkoutData.cycle === 'monthly' ? checkoutData.plan.monthlyPrice : checkoutData.plan.yearlyPrice;
              const nextDate = new Date();
              if (checkoutData.cycle === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
              else nextDate.setFullYear(nextDate.getFullYear() + 1);

              onAddInvoice({
                id: crypto.randomUUID(), invoiceNumber: `INV-${Date.now().toString().slice(-4)}`, date: new Date().toISOString(),
                amount, gstAmount: 0, total: amount, planName: checkoutData.plan.name, status: 'paid', transactionId: 'TXN-LOCAL', 
                billingPeriod: checkoutData.cycle, userId: user.id
              });
              onUpdateUser({
                ...user, subscription: { ...user.subscription, planId: checkoutData.plan.id, status: 'active', leadsUsedThisMonth: 0, nextBillingDate: nextDate.toISOString() }
              });
              setCheckoutData(null);
           }} 
        />
      )}
    </div>
  );
};
