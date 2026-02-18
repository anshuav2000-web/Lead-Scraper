
import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Lead, Plan, Invoice, SystemConfig, BillingCycle 
} from './types.ts';
import { UserPortal } from './components/UserPortal.tsx';
import { AdminPortal as AdminDashboard } from './components/AdminPortal.tsx';
import { AuthView } from './components/AuthView.tsx';
import { Button } from './components/Button.tsx';
import { supabase } from './services/supabaseClient.ts';
import { db } from './services/supabaseService.ts';

const DEFAULT_PLANS: Plan[] = [
  { id: 'basic', name: 'Basic Plan', monthlyPrice: 999, yearlyPrice: 9590, leadLimit: 500, isActive: true, features: ['500 leads/mo', 'CSV export'] },
  { id: 'pro', name: 'Pro Plan', monthlyPrice: 2499, yearlyPrice: 23990, leadLimit: 5000, recommended: true, isActive: true, features: ['5,000 leads/mo', 'Advanced filters'] },
  { id: 'enterprise', name: 'Enterprise Plan', monthlyPrice: 6999, yearlyPrice: 67190, leadLimit: -1, isActive: true, features: ['Unlimited leads', 'API Access', 'Access to Webhooks'] }
];

const INITIAL_CONFIG: SystemConfig = {
  freeTrialEnabled: true,
  trialDurationDays: 7,
  trialLeadLimit: 100,
  gstPercentage: 18,
  platformBranding: { name: "Canvas Cartel", tagline: "Cloud Prospecting Engine", primaryColor: "#dc2626" },
  companyDetails: { name: "Canvas Cartel Intelligence", address: "Cloud Tower, Global", gst: "07AAAAA0000A1Z5", logo: "CC" }
};

// Type-safe normalization helpers
function parseBillingCycle(cycle: string | undefined): BillingCycle {
  if (cycle === 'yearly') return 'yearly';
  return 'monthly'; // Default
}

function parseRole(role: string | undefined): 'user' | 'admin' {
  if (role === 'admin') return 'admin';
  return 'user'; // Default
}

const App: React.FC = () => {
  const [view, setView] = useState<'auth' | 'user' | 'admin' | 'setup'>('auth');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const allUsers = await db.getAllProfiles();
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch user list:", err);
    }
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setIsLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setLeads([]);
          setInvoices([]);
          setUsers([]);
          setDbError(null);
          setView('auth');
        }
      });

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            console.log("Database updated, refreshing user list...");
            fetchAllUsers();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
        supabase.removeChannel(channel);
      };
    };

    initializeSession();
  }, [fetchAllUsers]);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    setDbError(null);
    try {
      let profile: User | null = null;
      try {
        profile = await db.getProfile(userId) as User | null;
      } catch (err: any) {
        if (err.message.includes("profiles") || err.message.includes("PGRST205")) {
          setDbError("Database Schema Missing: 'profiles' table not found.");
          setView('setup');
          setIsLoading(false);
          return;
        }
        throw err;
      }
      
      if (!profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const trialExpiryDate = new Date();
          trialExpiryDate.setDate(trialExpiryDate.getDate() + config.trialDurationDays);
          
          const roleVal = parseRole(user.email === 'admin@cc.com' ? 'admin' : 'user');
          const cycleVal = parseBillingCycle('monthly');

          const newProfile: User = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
            email: user.email!,
            role: roleVal,
            createdAt: new Date().toISOString(),
            subscription: { 
              planId: 'basic', 
              cycle: cycleVal, 
              status: 'trial', 
              leadsUsedThisMonth: 0, 
              nextBillingDate: trialExpiryDate.toISOString() 
            },
            webhook: { url: '', secret: '', enabled: false, logs: [] }
          };
          
          profile = newProfile;
          try {
            await db.updateProfile(profile);
          } catch (e: any) {
            if (e.message.includes("PGRST205")) {
               setDbError("Database Schema Missing: 'profiles' table not found.");
               setView('setup');
               setIsLoading(false);
               return;
            }
          }
        }
      }

      if (profile) {
        setCurrentUser(profile);
        const [fetchedLeads, fetchedInvoices] = await Promise.all([
          db.getLeads(userId),
          db.getInvoices(userId)
        ]);

        if (profile.role === 'admin') {
          await fetchAllUsers();
        }

        setLeads(fetchedLeads);
        setInvoices(fetchedInvoices);
        setView(profile.role === 'admin' ? 'admin' : 'user');
      }
    } catch (err: any) {
      console.error("Supabase Connection Error:", err);
      setDbError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      let msg = error.message;
      if (msg === "Invalid login credentials") msg = "Incorrect email or password. Please verify your credentials.";
      return { success: false, message: msg };
    }
    return { success: true, message: "Handshake verified. Accessing portal..." };
  };

  const handleRegister = async (name: string, email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: { data: { full_name: name } }
    });

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: "Security profile created. Access granted." };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleBypass = () => {
    const bypassUser: User = {
      id: 'bypass-id',
      name: 'System Override',
      email: 'admin@cc.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      subscription: {
        planId: 'enterprise',
        cycle: 'monthly',
        status: 'active',
        leadsUsedThisMonth: 0,
        nextBillingDate: new Date(Date.now() + 31536000000).toISOString()
      },
      webhook: { url: '', secret: '', enabled: false, logs: [] }
    };
    setCurrentUser(bypassUser);
    fetchAllUsers();
    setView('admin');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    try {
      await db.updateProfile(updatedUser);
    } catch (err) {
      console.error("Failed to persist profile update:", err);
    }
  };

  const handleSyncLeads = async (newLeads: Lead[]) => {
    setLeads(prev => [...newLeads, ...prev]);
    try {
      await db.saveLeads(newLeads);
    } catch (err) {
      console.error("Failed to persist leads:", err);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: 'processed') => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    try {
      await db.updateLeadStatus(id, status);
    } catch (err) {
      console.error("Failed to update lead status in DB:", err);
    }
  };

  const handleAddInvoice = async (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    try {
      await db.addInvoice(invoice);
    } catch (err) {
      console.error("Failed to persist invoice:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Cloud Node</p>
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-12 shadow-2xl animate-fade-in">
           <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-red-600/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-2xl shadow-red-900/20">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Database Initializer</h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Error PGRST205: Missing Table Schema</p>
           </div>
           <div className="space-y-6">
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Your Supabase Auth is working, but your database tables don't exist yet. Follow these steps to fix this instantly:
              </p>
              <div className="bg-black/40 rounded-3xl p-8 border border-zinc-800 space-y-4">
                 <div className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white">1</span>
                    <span className="text-[10px] font-black text-zinc-300 uppercase">Open Supabase Dashboard &gt; SQL Editor</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white">2</span>
                    <span className="text-[10px] font-black text-zinc-300 uppercase">Copy the SQL from the "Architect" tab or documentation</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white">3</span>
                    <span className="text-[10px] font-black text-zinc-300 uppercase">Click "Run" and refresh this page</span>
                 </div>
              </div>
              <div className="flex gap-4 pt-6">
                 <Button className="flex-1 py-5" onClick={() => window.location.reload()}>I've run the SQL, Refresh</Button>
                 <Button variant="secondary" className="px-10" onClick={handleLogout}>Logout</Button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {view === 'auth' && (
        <AuthView 
          isRegistering={isRegistering} 
          setIsRegistering={setIsRegistering} 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          onBypass={handleBypass}
          branding={config.platformBranding}
        />
      )}
      {view === 'user' && currentUser && (
        <UserPortal 
          user={currentUser} 
          plans={plans} 
          config={config} 
          leads={leads} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser}
          onSyncLeads={handleSyncLeads}
          onUpdateLeadStatus={handleUpdateLeadStatus}
          invoices={invoices}
          onAddInvoice={handleAddInvoice}
        />
      )}
      {view === 'admin' && (
        <AdminDashboard 
          users={users} 
          plans={plans} 
          config={config} 
          invoices={invoices} 
          auditLogs={[]}
          onLogout={handleLogout}
          onUpdateUsers={(u) => setUsers(u)}
          onUpdatePlans={(p) => setPlans(p)}
          onUpdateConfig={(c) => setConfig(c)}
          onAddAuditLog={() => {}}
        />
      )}
    </div>
  );
};

export default App;
