
import React, { useState } from 'react';
import { Plan, BillingCycle, SystemConfig, User } from '../types.ts';
import { Button } from './Button.tsx';

interface CheckoutModalProps {
  plan: Plan;
  cycle: BillingCycle;
  config: SystemConfig;
  user?: User; // Pass user for pre-filling payment data
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, cycle, config, user, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'processing'>('details');

  const amount = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const gst = Math.round(amount * (config.gstPercentage / 100));
  const total = amount + gst;

  const handleRazorpayPayment = () => {
    setIsProcessing(true);
    
    // Check if Razorpay script is loaded
    if (!(window as any).Razorpay) {
      alert("Payment gateway failed to load. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    const options = {
      // Use environment variable with a verified fallback for production resilience
      key: process.env.RAZORPAY_KEY_ID || "rzp_live_SHCJOzGdCkTXxP",
      amount: total * 100, // Razorpay works in Paisa (Amount * 100)
      currency: "INR",
      name: config.platformBranding.name,
      description: `Subscription: ${plan.name} (${cycle})`,
      image: "https://canvascartel.com/favicon.ico", // Optional logo
      handler: function (response: any) {
        // Payment success callback
        console.log("Payment ID:", response.razorpay_payment_id);
        setStep('processing');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      notes: {
        plan_id: plan.id,
        billing_cycle: cycle,
        user_id: user?.id
      },
      theme: {
        color: config.platformBranding.primaryColor || "#dc2626",
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any){
      alert("Payment Failed: " + response.error.description);
      setIsProcessing(false);
    });
    rzp.open();
  };

  const handlePayment = () => {
    handleRazorpayPayment();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#09090b] w-full max-w-2xl rounded-[3rem] border border-zinc-800 shadow-[0_0_100px_rgba(220,38,38,0.15)] overflow-hidden">
        {step === 'details' ? (
          <div className="flex flex-col md:flex-row h-full">
            {/* Left: Summary */}
            <div className="bg-zinc-900/50 p-10 md:w-5/12 border-b md:border-b-0 md:border-r border-zinc-800">
               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-8">Checkout Summary</h3>
               
               <div className="space-y-6">
                  <div>
                    <p className="text-xs font-black text-white uppercase">{plan.name}</p>
                    <p className="text-[10px] text-zinc-500 font-bold">{cycle === 'monthly' ? 'Billed Monthly' : 'Billed Yearly'}</p>
                  </div>

                  <div className="space-y-2 pt-6 border-t border-zinc-800">
                    <div className="flex justify-between text-xs font-bold text-zinc-400">
                       <span>Base Price</span>
                       <span>₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-zinc-400">
                       <span>GST ({config.gstPercentage}%)</span>
                       <span>₹{gst.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                     <span className="text-sm font-black text-white uppercase">Total</span>
                     <span className="text-xl font-black text-red-500">₹{total.toLocaleString()}</span>
                  </div>
               </div>

               <div className="mt-12 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <p className="text-[8px] font-black text-zinc-600 uppercase leading-relaxed">
                    Secure transaction powered by Razorpay India. Encrypted end-to-end.
                  </p>
               </div>
            </div>

            {/* Right: Payment Handlers */}
            <div className="p-10 md:w-7/12 flex flex-col">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-xl font-black text-white">Secure Checkout</h2>
                  <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">✕</button>
               </div>

               <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800 mb-8 flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                 </div>
                 <p className="text-xs font-black text-white uppercase mb-2">Razorpay Payment Hub</p>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                   Support for UPI, Netbanking, and all major Debit/Credit Cards in India.
                 </p>
               </div>

               <div className="mt-auto">
                 <Button 
                  onClick={handlePayment}
                  isLoading={isProcessing}
                  className="w-full py-5 text-xs shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                 >
                   Pay Securely via Razorpay
                 </Button>
                 <p className="text-center text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-4">
                   PCI-DSS Compliant Transaction
                 </p>
               </div>
            </div>
          </div>
        ) : (
          <div className="p-24 flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
             <div className="relative">
                <div className="w-24 h-24 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                   </div>
                </div>
             </div>
             <div className="space-y-3">
                <h2 className="text-2xl font-black text-white tracking-tight">Provisioning License...</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Updating your access permissions on the secure server.</p>
             </div>
             <div className="w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-red-600 animate-[loading_2s_ease-in-out]"></div>
             </div>
             <style>{`
                @keyframes loading {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
             `}</style>
          </div>
        )}
      </div>
    </div>
  );
};
