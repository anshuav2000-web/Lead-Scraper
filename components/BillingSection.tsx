
import React from 'react';
import { User, Invoice, Plan, SystemConfig } from '../types.ts';
import { Button } from './Button.tsx';

interface BillingSectionProps {
  user: User;
  invoices: Invoice[];
  plans: Plan[];
  config: SystemConfig;
}

export const BillingSection: React.FC<BillingSectionProps> = ({ user, invoices, plans, config }) => {
  const currentPlan = plans.find(p => p.id === user.subscription.planId);
  const limit = user.subscription.status === 'trial' ? config.trialLeadLimit : (currentPlan?.leadLimit || 0);
  const percentage = limit === -1 ? 0 : Math.round((user.subscription.leadsUsedThisMonth / (limit || 1)) * 100);

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  return (
    <div className="animate-fade-in space-y-16 max-w-7xl mx-auto">
      <div className="text-center max-w-4xl mx-auto flex flex-col items-center space-y-8">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Financial Hub</span>
        </div>
        <h2 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[0.95] md:leading-[0.85] text-gradient">
          Vault <br />
          <span className="text-red-600">Management.</span>
        </h2>
        <p className="text-zinc-400 font-medium text-lg md:text-xl max-w-2xl leading-relaxed opacity-80">
          Manage your enterprise subscription, track usage metrics, and download invoice history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Subscription Info Card */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/[0.05] p-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Current Package</h3>
              <div className="space-y-4">
                 <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                       <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full border ${user.subscription.status === 'trial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {user.subscription.status}
                       </span>
                    </div>
                    <p className="text-sm font-black text-zinc-600 uppercase mb-1">Plan</p>
                    <p className="text-2xl font-black text-white">{currentPlan?.name || 'Free Trial'}</p>
                    <div className="mt-6 pt-6 border-t border-zinc-900">
                       <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Next Payment</p>
                       <p className="text-sm font-bold text-white">{getFormattedDate(user.subscription.nextBillingDate)}</p>
                    </div>
                 </div>
                 <Button variant="danger" className="w-full text-[10px] py-3 opacity-60 hover:opacity-100">Cancel Subscription</Button>
              </div>
           </div>

           <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/[0.05] p-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Usage Metrics</h3>
              <div className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-zinc-400">Monthly Extraction</span>
                    <span className="text-xs font-black text-white">{percentage}%</span>
                 </div>
                 <div className="w-full h-4 bg-zinc-950 rounded-full border border-zinc-800 p-1">
                    <div className="h-full bg-red-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, percentage)}%` }}></div>
                 </div>
                 <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pt-2">
                    {user.subscription.leadsUsedThisMonth} / {limit === -1 ? 'Unlimited' : limit} Leads
                 </p>
              </div>
           </div>
        </div>

        {/* Invoice List */}
        <div className="lg:col-span-8 bg-zinc-900/30 rounded-[2.5rem] border border-white/[0.05] backdrop-blur-xl overflow-hidden flex flex-col">
           <div className="p-8 border-b border-white/[0.05] flex justify-between items-center">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transaction History</h3>
           </div>
           <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-zinc-950/50 border-b border-zinc-800">
                       <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase">Invoice</th>
                       <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase">Plan</th>
                       <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase">Amount</th>
                       <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center text-zinc-600 text-[10px] font-black uppercase">No invoices generated yet</td>
                      </tr>
                    ) : invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4">
                           <p className="text-sm font-bold text-white">{inv.invoiceNumber}</p>
                           <p className="text-[10px] font-black text-zinc-600 uppercase">{getFormattedDate(inv.date)}</p>
                        </td>
                        <td className="px-8 py-4">
                           <span className="text-[10px] font-black text-zinc-400 uppercase bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">{inv.planName}</span>
                        </td>
                        <td className="px-8 py-4">
                           <p className="text-sm font-black text-white">₹{inv.total.toLocaleString()}</p>
                           <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Paid via Card</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                           </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};
