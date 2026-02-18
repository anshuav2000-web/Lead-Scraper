
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
    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${mobile ? 'w-full text-left py-4' : ''} ${disabled ? 'opacity-30 cursor-not-allowed' : active ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
  >
    {children}
  </button>
);

export const UserPortal: React.FC<UserPortalProps> = ({ 
  user, plans, config, leads, invoices, 
  onLogout, onUpdateUser, onSyncLeads, onUpdateLeadStatus, onAddInvoice 
}) => {
  const [activeMenu, setActiveMenu] = useState<'scraper' | 'reports' | 'pricing' | 'billing' | 'webhooks'>('scraper');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ plan: Plan; cycle: BillingCycle } | null>(null);

  const isEnterprise = user.subscription.planId === 'enterprise';
  
  const handleMenuClick = (menu: 'scraper' | 'reports' | 'pricing' | 'billing' | 'webhooks') => {
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
       console.error("Extraction error:", e);
       alert(`Extraction Error: ${e.message}`);
     } finally {
       setIsLoading(false);
     }
  };

  const handleManualWebhook = async (lead: Lead) => {
    if (!isEnterprise || !user.webhook?.enabled || !user.webhook?.url) {
      alert("Webhook sync requires Enterprise plan and configuration.");
      return;
    }

    setIsSyncing(lead.id);
    try {
      const success = await sendToWebhook(lead, user.webhook.url);
      if (success) {
        onUpdateLeadStatus(lead.id, 'processed');
        alert("Pushed to automation hub!");
      } else {
        alert("Webhook sync failed.");
      }
    } catch (err) {
      alert("Critical sync failure.");
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <nav className="border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-base md:text-lg shadow-xl shadow-red-900/40">CC</div>
            <h1 className="text-base md:text-lg font-black text-white hidden sm:block">Canvas Cartel</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavButton active={activeMenu === 'scraper'} onClick={() => handleMenuClick('scraper')}>Extractor</NavButton>
            <NavButton active={activeMenu === 'reports'} onClick={() => handleMenuClick('reports')}>Reports</NavButton>
            <NavButton active={activeMenu === 'pricing'} onClick={() => handleMenuClick('pricing')}>Pricing</NavButton>
            <NavButton active={activeMenu === 'billing'} onClick={() => handleMenuClick('billing')}>Billing</NavButton>
            <NavButton active={activeMenu === 'webhooks'} onClick={() => handleMenuClick('webhooks')} disabled={!isEnterprise}>Webhooks</NavButton>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onLogout} className="text-zinc-500 hover:text-red-500 transition-colors p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-zinc-400 hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 animate-fade-in">
             <div className="p-4 space-y-2">
                <NavButton active={activeMenu === 'scraper'} onClick={() => handleMenuClick('scraper')} mobile>Extractor</NavButton>
                <NavButton active={activeMenu === 'reports'} onClick={() => handleMenuClick('reports')} mobile>Reports</NavButton>
                <NavButton active={activeMenu === 'pricing'} onClick={() => handleMenuClick('pricing')} mobile>Pricing</NavButton>
                <NavButton active={activeMenu === 'billing'} onClick={() => handleMenuClick('billing')} mobile>Billing</NavButton>
                <NavButton active={activeMenu === 'webhooks'} onClick={() => handleMenuClick('webhooks')} disabled={!isEnterprise} mobile>Webhooks</NavButton>
             </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8 md:space-y-10">
         {activeMenu === 'scraper' && (
           <div className="space-y-8 md:space-y-10 animate-fade-in">
              <LeadForm onSearch={handleExtraction} isLoading={isLoading} />
              <LeadTable leads={leads} onSendToWebhook={handleManualWebhook} isSyncing={isSyncing} />
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
      </main>

      {checkoutData && (
        <CheckoutModal 
           plan={checkoutData.plan} cycle={checkoutData.cycle} config={config} user={user}
           onClose={() => setCheckoutData(null)} 
           onSuccess={() => {
              const amount = checkoutData.cycle === 'monthly' ? checkoutData.plan.monthlyPrice : checkoutData.plan.yearlyPrice;
              const nextDate = new Date();
              if (checkoutData.cycle === 'monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
              } else {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
              }

              onAddInvoice({
                id: crypto.randomUUID(), invoiceNumber: `INV-${Date.now().toString().slice(-4)}`, date: new Date().toISOString(),
                amount, gstAmount: 0, total: amount, planName: checkoutData.plan.name, status: 'paid', transactionId: 'LOCAL_TXN', 
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
