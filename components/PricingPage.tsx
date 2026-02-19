
import React, { useState } from 'react';
import { Plan, SystemConfig, User, BillingCycle } from '../types.ts';
import { Button } from './Button.tsx';

// Define the missing PricingPageProps interface
interface PricingPageProps {
  plans: Plan[];
  config: SystemConfig;
  user: User;
  onSubscribe: (planId: string, cycle: BillingCycle) => void;
}

// PricingPage component implementation
export const PricingPage: React.FC<PricingPageProps> = ({ plans, config, user, onSubscribe }) => {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <div className="animate-fade-in py-12">
      <div className="text-center max-w-4xl mx-auto mb-16 space-y-8 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
          Scale your pipeline
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[0.95] md:leading-[0.85] text-gradient">
          Ready to dominate <br />
          <span className="text-red-600">your market?</span>
        </h1>
        <p className="text-zinc-400 font-medium text-lg md:text-xl max-w-2xl leading-relaxed opacity-80">
          Choose a plan that matches your extraction velocity. 
          {cycle === 'yearly' ? ' Yearly billing saves you over 20%.' : ' Monthly billing for total flexibility.'}
        </p>

        {/* Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 pt-4">
           <span className={`text-xs font-black uppercase tracking-widest transition-colors ${cycle === 'monthly' ? 'text-white' : 'text-zinc-600'}`}>Monthly</span>
           <button 
            onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-7 bg-zinc-900 border border-zinc-800 rounded-full p-1 relative transition-all"
           >
              <div className={`w-5 h-5 bg-red-600 rounded-full shadow-lg transition-all ${cycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div>
           </button>
           <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-widest transition-colors ${cycle === 'yearly' ? 'text-white' : 'text-zinc-600'}`}>Yearly</span>
              <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20">Save 20%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map(plan => {
          const isCurrent = user.subscription.planId === plan.id;
          const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          
          return (
            <div 
              key={plan.id}
              className={`relative bg-zinc-900/40 rounded-[2.5rem] p-10 border transition-all duration-500 flex flex-col ${plan.recommended ? 'border-red-600/50 scale-105 shadow-2xl shadow-red-900/10 z-10' : 'border-zinc-800 hover:border-zinc-700'}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">₹{price.toLocaleString()}</span>
                  <span className="text-zinc-500 text-sm font-bold uppercase">/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-zinc-400 text-sm font-bold">{f}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.recommended ? 'primary' : 'secondary'}
                className="w-full py-4 text-xs font-black uppercase tracking-widest"
                disabled={isCurrent}
                onClick={() => onSubscribe(plan.id, cycle)}
              >
                {isCurrent ? 'Current Plan' : plan.id === 'enterprise' ? 'Select Enterprise' : 'Get Started'}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-24 text-center">
         <p className="text-zinc-500 text-sm font-medium">All plans include 18% GST as per Indian regulations. <br /> Secure payments via Razorpay.</p>
      </div>
    </div>
  );
};
