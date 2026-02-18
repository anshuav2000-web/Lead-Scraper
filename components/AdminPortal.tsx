
import React, { useState, useMemo } from 'react';
import { User, Plan, SystemConfig, Invoice, AuditLog } from '../types.ts';
import { Button } from './Button.tsx';
import { AdminPanel as SystemSettings } from './AdminPanel.tsx';
import { db } from '../services/supabaseService.ts';
import { Notification, NotificationType } from './Notification.tsx';

interface AdminPortalProps {
  users: User[];
  plans: Plan[];
  config: SystemConfig;
  invoices: Invoice[];
  auditLogs: AuditLog[];
  onLogout: () => void;
  onUpdateUsers: (users: User[]) => void;
  onUpdatePlans: (plans: Plan[]) => void;
  onUpdateConfig: (config: SystemConfig) => void;
  onAddAuditLog: (action: string, id: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ 
  users, plans, config, invoices, 
  onLogout, onUpdateUsers, onUpdatePlans, onUpdateConfig 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'plans' | 'architect' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notif, setNotif] = useState<{ message: string; type: NotificationType } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const showNotif = (message: string, type: NotificationType = 'info') => {
    setNotif({ message, type });
  };

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((acc, i) => acc + i.total, 0);
    const activeSubscribers = users.filter(u => u.subscription.status === 'active').length;
    const trialUsers = users.filter(u => u.subscription.status === 'trial').length;
    return { totalRevenue, activeSubscribers, trialUsers };
  }, [invoices, users]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await db.updateUserRole(userId, newRole);
      // App.tsx realtime listener will update the list, but we update locally for immediate feedback
      onUpdateUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showNotif(`Identity clearance updated: ${newRole.toUpperCase()}`, 'success');
    } catch (err) {
      showNotif("Protocol Error: Failed to update role", 'error');
    }
  };

  const handleUserPlanChange = async (userId: string, planId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const newSubscription: User['subscription'] = {
      ...targetUser.subscription,
      planId,
      status: 'active',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      await db.updateUserSubscription(userId, newSubscription);
      onUpdateUsers(users.map(u => u.id === userId ? { ...u, subscription: newSubscription } : u));
      showNotif(`Package Provisioned: ${planId.toUpperCase()}`, 'success');
    } catch (err) {
      showNotif("Protocol Error: Failed to allocate plan", 'error');
    }
  };

  const handlePlanEdit = (planId: string, field: keyof Plan, value: any) => {
    const updatedPlans = plans.map(p => p.id === planId ? { ...p, [field]: value } : p);
    onUpdatePlans(updatedPlans);
    showNotif("Local configuration staged. Persist via Cloud Sync.", "info");
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const sqlSchema = `
-- 1. Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  role text default 'user',
  "createdAt" timestamp with time zone default now(),
  subscription jsonb default '{"planId": "basic", "cycle": "monthly", "status": "trial", "leadsUsedThisMonth": 0, "nextBillingDate": null}'::jsonb,
  webhook jsonb default '{"url": "", "secret": "", "enabled": false, "logs": []}'::jsonb
);

-- 2. Create Leads Table
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references auth.users on delete cascade,
  "generatedDate" timestamp with time zone default now(),
  "companyName" text,
  category text,
  city text,
  country text,
  website text,
  "phoneNumber" text,
  email text,
  "qualityScore" integer,
  "qualityReasoning" text,
  status text default 'new',
  address text,
  sources jsonb
);

-- 3. Create Invoices Table
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references auth.users on delete cascade,
  "invoiceNumber" text,
  date timestamp with time zone default now(),
  amount numeric,
  "gstAmount" numeric,
  total numeric,
  "planName" text,
  status text default 'paid'
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.invoices enable row level security;
create policy "Allow public access" on public.profiles for all using (true);
create policy "Allow public access" on public.leads for all using (true);
create policy "Allow public access" on public.invoices for all using (true);
  `.trim();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#09090b]">
       {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

       {/* Mobile Header */}
       <div className="lg:hidden bg-zinc-950 border-b border-zinc-900 p-4 flex justify-between items-center z-[110]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black">CC</div>
             <span className="font-black text-white text-xs uppercase tracking-widest">Admin Command</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
       </div>

       {/* Sidebar */}
       <aside className={`w-72 bg-[#0c0c0e] border-r border-zinc-900 flex flex-col fixed inset-y-0 lg:sticky z-[105] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
         <div className="p-8 border-b border-zinc-900">
            <h2 className="font-black text-white uppercase tracking-widest text-lg">Admin Hub</h2>
            <p className="text-[8px] font-black text-zinc-600 uppercase mt-1">Global Intelligence Control</p>
         </div>
         <nav className="flex-1 p-6 space-y-1">
            <AdminSidebarItem label="Command Center" icon="📊" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <AdminSidebarItem label="Member Access" icon="👥" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <AdminSidebarItem label="Plan Config" icon="💳" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
            <AdminSidebarItem label="Architect" icon="🏗️" active={activeTab === 'architect'} onClick={() => setActiveTab('architect')} />
            <AdminSidebarItem label="Settings" icon="⚙️" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
         </nav>
         <div className="p-6 border-t border-zinc-900">
            <Button variant="ghost" className="w-full text-zinc-500 hover:text-red-500" onClick={onLogout}>Sign Out</Button>
         </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar w-full relative">
          {/* Decorative Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full -z-10"></div>
          
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-fade-in">
               <div className="flex flex-col gap-2">
                 <h2 className="text-4xl font-black text-white tracking-tighter">Live Intelligence</h2>
                 <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Synchronized with Cloud Cluster 01</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <AdminMetric label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
                  <AdminMetric label="Active Pro" value={stats.activeSubscribers.toString()} />
                  <AdminMetric label="Trial Licenses" value={stats.trialUsers.toString()} />
                  <AdminMetric label="Node Status" value="Online" status="online" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Latest Access Requests</h3>
                        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                           Live Stream
                        </span>
                     </div>
                     <div className="space-y-4">
                        {users.slice(0, 5).map(u => (
                           <div key={u.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800/50 hover:border-red-600/30 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${u.role === 'admin' ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {u.name[0]}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-white">{u.name}</p>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{u.email}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-white uppercase">{u.subscription.planId}</p>
                                 <p className="text-[8px] font-bold text-zinc-600 uppercase mt-0.5">{new Date(u.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 flex flex-col justify-center items-center text-center">
                     <div className="w-20 h-20 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 mb-6 shadow-2xl shadow-red-900/20">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                     </div>
                     <h3 className="text-xl font-black text-white tracking-tight">Cloud Shield Active</h3>
                     <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2 leading-relaxed">System-wide encryption verified. Extraction nodes stable.</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tighter">Access Protocols</h2>
                   <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Authorized personnel and clearances</p>
                </div>
                <div className="w-full md:w-80">
                   <div className="relative">
                      <input 
                        type="text" 
                        placeholder="SEARCH IDENTITY..." 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 text-[10px] font-black text-white focus:outline-none focus:border-red-600 transition-all uppercase tracking-widest"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-zinc-950/50 border-b border-zinc-800">
                          <tr>
                             <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Identifier</th>
                             <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Clearance</th>
                             <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Package</th>
                             <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest text-right">Maturity</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-800">
                          {filteredUsers.length === 0 ? (
                            <tr><td colSpan={4} className="px-8 py-20 text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] italic">No identities found in node memory.</td></tr>
                          ) : filteredUsers.map(u => (
                             <tr key={u.id} className="hover:bg-red-500/[0.02] transition-colors group">
                                <td className="px-8 py-6">
                                   <p className="text-sm font-black text-white group-hover:text-red-500 transition-colors">{u.name}</p>
                                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{u.email}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <select 
                                     className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-black text-white uppercase focus:border-red-600 outline-none cursor-pointer hover:bg-zinc-900 transition-all"
                                     value={u.role}
                                     onChange={(e) => handleRoleChange(u.id, e.target.value as 'user' | 'admin')}
                                   >
                                      <option value="user">User Access</option>
                                      <option value="admin">System Admin</option>
                                   </select>
                                </td>
                                <td className="px-8 py-6">
                                   <select 
                                     className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-black text-white uppercase focus:border-red-600 outline-none cursor-pointer hover:bg-zinc-900 transition-all"
                                     value={u.subscription.planId}
                                     onChange={(e) => handleUserPlanChange(u.id, e.target.value)}
                                   >
                                      {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                   </select>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <div className="flex flex-col items-end gap-1">
                                      <span className="text-[10px] font-black text-zinc-400">{u.subscription.leadsUsedThisMonth} EXITS</span>
                                      <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                         <div className="h-full bg-red-600" style={{ width: `${Math.min(100, (u.subscription.leadsUsedThisMonth / 500) * 100)}%` }}></div>
                                      </div>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-10 animate-fade-in">
               <div className="flex flex-col gap-2">
                 <h2 className="text-3xl font-black text-white tracking-tighter">Plan Configurator</h2>
                 <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Orchestrate global package variables</p>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {plans.map(plan => (
                    <div key={plan.id} className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 space-y-8 relative group overflow-hidden">
                       <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
                          <input 
                            type="text" 
                            className="bg-transparent border-none text-xl font-black text-white w-full outline-none focus:text-red-500 transition-colors uppercase tracking-tighter"
                            value={plan.name}
                            onChange={(e) => handlePlanEdit(plan.id, 'name', e.target.value)}
                          />
                          <span className="text-[8px] font-black text-zinc-600 uppercase bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">{plan.id}</span>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Monthly Price (INR)</label>
                             <input 
                              type="number" 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-black text-sm outline-none focus:border-red-600 transition-all"
                              value={plan.monthlyPrice}
                              onChange={(e) => handlePlanEdit(plan.id, 'monthlyPrice', parseInt(e.target.value) || 0)}
                             />
                          </div>

                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Lead Capacity (-1 = ∞)</label>
                             <input 
                              type="number" 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-black text-sm outline-none focus:border-red-600 transition-all"
                              value={plan.leadLimit}
                              onChange={(e) => handlePlanEdit(plan.id, 'leadLimit', parseInt(e.target.value) || 0)}
                             />
                          </div>

                          <div className="pt-4">
                             <button 
                              onClick={() => handlePlanEdit(plan.id, 'recommended', !plan.recommended)}
                              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.recommended ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'bg-zinc-800 text-zinc-600 hover:text-white'}`}
                             >
                                {plan.recommended ? 'RECOMMENDED PACKAGE' : 'SET AS RECOMMENDED'}
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="flex justify-end pt-10 border-t border-zinc-900">
                  <Button className="px-12 py-5 shadow-2xl shadow-emerald-900/20" variant="success" onClick={() => showNotif("Cloud preferences synchronized. System variables updated.", "success")}>Apply Global Changes</Button>
               </div>
            </div>
          )}

          {activeTab === 'architect' && (
            <div className="animate-fade-in space-y-8 max-w-4xl">
               <div className="flex flex-col gap-2">
                 <h3 className="text-3xl font-black text-white tracking-tighter">System Architect</h3>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Cloud Database Schema Deployment</p>
               </div>
               <div className="bg-black rounded-[2.5rem] p-8 md:p-12 border border-zinc-800 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-600"></div>
                  <button 
                     onClick={() => { navigator.clipboard.writeText(sqlSchema); showNotif("SQL Buffer Copied to Clipboard", "success"); }}
                     className="absolute top-8 right-8 bg-zinc-900 border border-zinc-800 px-5 py-2 rounded-xl text-[9px] font-black text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
                  >
                     Copy Schema
                  </button>
                  <pre className="text-[10px] font-mono text-emerald-500 overflow-x-auto custom-scrollbar h-[500px] leading-relaxed">
                     {sqlSchema}
                  </pre>
               </div>
            </div>
          )}

          {activeTab === 'settings' && <SystemSettings config={config} setConfig={onUpdateConfig} invoices={invoices} plans={plans} />}
       </main>
    </div>
  );
};

const AdminSidebarItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-red-600 text-white shadow-xl shadow-red-900/40 border-none' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const AdminMetric = ({ label, value, status }: { label: string, value: string, status?: 'online' }) => (
  <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 relative group overflow-hidden hover:border-red-600/30 transition-all">
     <div className="absolute top-0 right-0 p-5">
        {status === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]"></div>}
     </div>
     <p className="text-[10px] font-black text-zinc-600 uppercase mb-1 tracking-widest">{label}</p>
     <p className="text-3xl font-black text-white group-hover:text-red-500 transition-colors">{value}</p>
  </div>
);
