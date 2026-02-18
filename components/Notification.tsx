
import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: (
      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/5 shadow-emerald-900/10',
    error: 'border-red-500/20 bg-red-500/5 shadow-red-900/10',
    info: 'border-blue-500/20 bg-blue-500/5 shadow-blue-900/10'
  };

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-sm px-4 animate-fade-in">
      <div className={`glass border rounded-3xl p-5 flex items-center gap-4 shadow-2xl ${colors[type]}`}>
        <div className="shrink-0 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">
            {type === 'error' ? 'Security Protocol' : 'System Update'}
          </p>
          <p className="text-xs font-bold text-white leading-relaxed">{message}</p>
        </div>
        <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
