
import React from 'react';
import { SystemConfig, Invoice, Plan } from '../types.ts';
import { Button } from './Button.tsx';

interface AdminPanelProps {
  config: SystemConfig;
  setConfig: (config: SystemConfig) => void;
  invoices: Invoice[];
  plans: Plan[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ config, setConfig, invoices, plans }) => {
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalGst = invoices.reduce((acc, inv) => acc + inv.gstAmount, 0);

  const exportGstReport = () => {
    const headers = ["Invoice #", "Date", "Customer", "Amount", "GST %", "GST Amount", "Total"];
    const rows = invoices.map(inv => [
      inv.invoiceNumber,
      new Date(inv.date).toLocaleDateString(),
      "Customer Name",
      inv.amount,
      config.gstPercentage,
      inv.gstAmount,
      inv.total
    ].join(','));
    const content = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gst_report.csv";
    link.click();
  };

  return (
    <div className="animate-fade-in space-y-12">
      <div className="flex justify-between items-end gap-6 border-b border-zinc-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">System Administration</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Platform-wide orchestration</p>
        </div>
        <Button size="sm" variant="success" onClick={exportGstReport}>Export GST Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <AdminStat label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
         <AdminStat label="GST Collected" value={`₹${totalGst.toLocaleString()}`} />
         <AdminStat label="Total Invoices" value={invoices.length.toString()} />
         <AdminStat label="Active Subscribers" value="42" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 p-10 space-y-8">
           <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-zinc-800 pb-4">Revenue Config</h3>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">GST Percentage (India)</label>
                 <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold w-32 focus:outline-none focus:border-red-600"
                      value={config.gstPercentage}
                      onChange={(e) => setConfig({...config, gstPercentage: parseInt(e.target.value) || 0})}
                    />
                    <span className="text-xs font-black text-zinc-600">%</span>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Corporate Details</label>
                 <input 
                    type="text" 
                    placeholder="Company Name"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-bold mb-3"
                    value={config.companyDetails.name}
                    onChange={(e) => setConfig({...config, companyDetails: {...config.companyDetails, name: e.target.value}})}
                 />
                 <input 
                    type="text" 
                    placeholder="GSTIN"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-bold"
                    value={config.companyDetails.gst}
                    onChange={(e) => setConfig({...config, companyDetails: {...config.companyDetails, gst: e.target.value}})}
                 />
              </div>
           </div>
        </div>

        <div className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 p-10 space-y-8">
           <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-zinc-800 pb-4">Trial Management</h3>
           
           <div className="space-y-6">
              <div className="flex items-center justify-between bg-zinc-950 p-6 rounded-3xl border border-zinc-800">
                 <div>
                    <p className="text-xs font-black text-white uppercase mb-1">Free Trial Access</p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase">Enable global trial system</p>
                 </div>
                 <button 
                  onClick={() => setConfig({...config, freeTrialEnabled: !config.freeTrialEnabled})}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${config.freeTrialEnabled ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${config.freeTrialEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Trial Duration (Days)</label>
                    <input 
                      type="number" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold"
                      value={config.trialDurationDays}
                      onChange={(e) => setConfig({...config, trialDurationDays: parseInt(e.target.value) || 0})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Trial Lead Limit</label>
                    <input 
                      type="number" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold"
                      value={config.trialLeadLimit}
                      onChange={(e) => setConfig({...config, trialLeadLimit: parseInt(e.target.value) || 0})}
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminStat = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem]">
     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-3xl font-black text-white">{value}</p>
  </div>
);
