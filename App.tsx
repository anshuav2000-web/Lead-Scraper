
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

function parseBillingCycle(cycle: string | undefined): BillingCycle {
  if (cycle === 'yearly') return 'yearly';
  return 'monthly';
}

function parseRole(role: string | undefined): 'user' | 'admin' {
  if (role === 'admin') return 'admin';
  return 'user';
}

const App: React.FC = () => {
  const [view, setView] = useState<'auth' | 'user' | 'admin' | 'setup' | 'apiKey'>('auth');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  
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

  const fetchUserData = useCallback(async (userId: string, isInitial = false) => {
    // Only show global loading spinner on initial application boot or if we have no user context
    if (isInitial && !currentUser) {
      setIsLoading(true);
    }
    
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
          trialExpiryDate.setDate(trialExpiryDate.getDate() + INITIAL_CONFIG.trialDurationDays);
          
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
          await db.updateProfile(profile);
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
        
        const keySelected = await window.aistudio.hasSelectedApiKey();
        if (!keySelected) {
          setView('apiKey');
        } else {
          setView(profile.role === 'admin' ? 'admin' : 'user');
        }
      }
    } catch (err: any) {
      console.error("Supabase Connection Error:", err);
      setDbError(err.message);
      if (err.message.includes("profiles") || err.message.includes("PGRST205") || err.message.includes("DATABASE_NOT_INITIALIZED")) {
        setView('setup');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllUsers]);

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserData(session.user.id, true);
      } else {
        setIsLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // If already signed in with same user, don't trigger full loading re-fetch
          if (currentUser?.id !== session.user.id) {
            await fetchUserData(session.user.id, true);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setLeads([]);
          setInvoices([]);
          setUsers([]);
          setDbError(null);
          setView('auth');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeSession();
  }, [fetchUserData]);

  const handleLogin = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Handshake verified." };
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: { data: { full_name: name } }
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Security profile created." };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
      console.error("Failed to update lead status:", err);
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

  const handleApiKeySuccess = () => {
    if (currentUser) {
      setView(currentUser.role === 'admin' ? 'admin' : 'user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_30px_rgba(220,38,38,0.2)]"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse opacity-60">Syncing Neural Node</p>
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
          onBypass={() => setView('admin')}
          branding={config.platformBranding}
          error={dbError}
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
      {view === 'apiKey' && (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
          <div className="max-w-md w-full glass p-10 rounded-[2.5rem] border-white/[0.08] text-center space-y-8 animate-fade-in">
            <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tight">API Authentication</h2>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                To enable high-precision lead extraction, you must connect your Gemini API key. 
                This ensures dedicated quota for your prospecting operations.
              </p>
            </div>
            <div className="pt-4 space-y-4">
              <Button 
                className="w-full py-5 text-sm"
                onClick={async () => {
                  await window.aistudio.openSelectKey();
                  handleApiKeySuccess();
                }}
              >
                Connect API Key
              </Button>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Requires a paid Google Cloud project. <br />
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-red-500 hover:underline">Billing Documentation</a>
              </p>
            </div>
          </div>
        </div>
      )}
      {view === 'setup' && (
        <div className="min-h-screen bg-black flex items-center justify-center p-10 text-center">
          <div className="max-w-md space-y-6">
            <h1 className="text-3xl font-black text-white">DATABASE SYNC ERROR</h1>
            <p className="text-zinc-500 text-sm font-bold uppercase">Table schema missing. Please run the SQL migration in your Supabase dashboard.</p>
            <Button onClick={() => window.location.reload()}>Retry Handshake</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
