
import React, { useState } from 'react';
import { Button } from './Button.tsx';
import { Notification, NotificationType } from './Notification.tsx';

interface AuthViewProps {
  isRegistering: boolean;
  setIsRegistering: (val: boolean) => void;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  onRegister: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  onBypass: () => void;
  branding: { name: string; tagline: string; primaryColor: string };
  error?: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({ isRegistering, setIsRegistering, onLogin, onRegister, onBypass, branding, error }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hidden Developer Access State
  const [logoClicks, setLogoClicks] = useState(0);
  
  // Notification State
  const [notif, setNotif] = useState<{ message: string; type: NotificationType } | null>(null);

  const showNotif = (message: string, type: NotificationType = 'info') => {
    setNotif({ message, type });
  };

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 7) {
      showNotif("Admin access granted. Redirecting...", "info");
      setTimeout(onBypass, 1000);
      setLogoClicks(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isResetting) {
      showNotif(`Password reset link sent to ${email}.`, 'success');
      setIsResetting(false);
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        if (pass.length < 6) {
          showNotif("Password must be at least 6 characters.", "error");
          setIsLoading(false);
          return;
        }
        const res = await onRegister(name, email, pass);
        if (!res.success) showNotif(res.message, "error");
        else showNotif(res.message, "success");
      } else {
        const res = await onLogin(email, pass);
        if (!res.success) showNotif(res.message, "error");
        else showNotif(res.message, "success");
      }
    } catch (err: any) {
      showNotif("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (mode: 'login' | 'register' | 'reset') => {
    if (mode === 'register') {
      setIsRegistering(true);
      setIsResetting(false);
    } else if (mode === 'reset') {
      setIsRegistering(false);
      setIsResetting(true);
    } else {
      setIsRegistering(false);
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] overflow-hidden">
       {/* Global Background Elements */}
       <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.08),_transparent_70%)]"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-900/5 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
       </div>

       {/* Notification Overlay */}
       {notif && (
         <Notification 
           message={notif.message} 
           type={notif.type} 
           onClose={() => setNotif(null)} 
         />
       )}

       {/* Main Container */}
       <div className="relative z-10 w-full max-w-[1000px] h-full md:h-auto md:min-h-[600px] flex flex-col md:flex-row shadow-2xl overflow-hidden md:rounded-[3rem] border-zinc-800/50 md:border bg-zinc-950/20 backdrop-blur-2xl animate-fade-in">
          
          {/* Left Side: Decorative & Info (Hidden on small mobile) */}
          <div className="hidden md:flex md:w-5/12 p-12 flex-col justify-between bg-zinc-900/30 border-r border-zinc-800/50">
             <div>
                <button 
                  onClick={handleLogoClick}
                  className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-red-600/20 mb-8 active:scale-90 transition-transform cursor-default"
                >
                   {branding.name[0]}
                </button>
                <h2 className="text-4xl font-black text-white tracking-tighter leading-tight mb-4">
                   Grow your <br />
                   <span className="text-red-600">business fast.</span>
                </h2>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                   The simplest way to find high-quality leads. AI-powered search and verification at your command.
                </p>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                   <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-red-600/50 transition-colors">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-1">Fast Scraping</p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Get results in seconds</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 group">
                   <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-600/50 transition-colors">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-1">Verified Data</p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">AI checked for accuracy</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Auth Form */}
          <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-black/40 relative">
             <div className="mb-10 block md:hidden text-center">
                <button 
                  onClick={handleLogoClick}
                  className="w-16 h-16 bg-red-600 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-red-900/40 mb-6 active:scale-90 transition-transform cursor-default"
                >
                   {branding.name[0]}
                </button>
                <h1 className="text-3xl font-black text-white tracking-tighter mb-2">{branding.name}</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{branding.tagline}</p>
             </div>

             <div className="max-w-sm mx-auto w-full">
                <div className="mb-8">
                   {error && (
                     <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-pulse">
                       <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">
                         {error}
                       </p>
                     </div>
                   )}
                   <h3 className="text-2xl font-black text-white tracking-tight">
                      {isResetting ? 'Reset Password' : isRegistering ? 'Sign Up' : 'Welcome Back'}
                   </h3>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                      {isResetting ? 'Enter your email to receive a reset link' : 'Enter your details to continue'}
                   </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                   {isRegistering && (
                     <div className="space-y-1.5 group">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-red-500 transition-colors">Your Name</label>
                        <div className="relative">
                           <input 
                              type="text" 
                              required
                              placeholder="Full Name"
                              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                           />
                        </div>
                     </div>
                   )}

                   <div className="space-y-1.5 group">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-red-500 transition-colors">Email Address</label>
                      <input 
                         type="email" 
                         required
                         placeholder="email@example.com"
                         className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                      />
                   </div>
                   
                   {!isResetting && (
                     <div className="space-y-1.5 group">
                        <div className="flex justify-between items-center">
                           <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-red-500 transition-colors">Password</label>
                           {!isRegistering && (
                             <button type="button" onClick={() => handleModeSwitch('reset')} className="text-[9px] font-black text-zinc-600 hover:text-red-500 uppercase tracking-widest transition-colors">Forgot?</button>
                           )}
                        </div>
                        <input 
                           type="password" 
                           required
                           placeholder="••••••••"
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all"
                           value={pass}
                           onChange={(e) => setPass(e.target.value)}
                        />
                     </div>
                   )}

                   <div className="pt-4 space-y-4">
                      <Button type="submit" className="w-full py-5 rounded-2xl text-[10px]" isLoading={isLoading}>
                         {isResetting ? 'Send Reset Link' : isRegistering ? 'Create Account' : 'Sign In'}
                      </Button>

                      <div className="flex flex-col items-center gap-3">
                        <button 
                           type="button"
                           onClick={() => handleModeSwitch(isRegistering ? 'login' : 'register')}
                           className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.1em] transition-colors"
                        >
                           {isRegistering ? 'Have an account? Login' : isResetting ? 'Back to Login' : 'Need an account? Sign Up'}
                        </button>
                      </div>
                   </div>
                </form>

                <div className="mt-12 flex justify-between items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                   <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secure Login</div>
                   <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                      <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Floating UI Elements */}
       <div className="absolute top-10 right-10 hidden xl:flex flex-col gap-2 items-end opacity-20 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Server Status</p>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
          </div>
       </div>
    </div>
  );
};
