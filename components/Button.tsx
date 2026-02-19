
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  size = 'md',
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-300 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] gap-2";
  
  const sizes = {
    sm: "px-5 py-2.5 text-[10px]",
    md: "px-7 py-3.5 text-[11px]",
    lg: "px-12 py-5 text-xs shadow-2xl"
  };

  const variants = {
    primary: "bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-xl shadow-red-900/20 hover:from-red-500 hover:to-rose-600 border-none",
    secondary: "bg-white/[0.04] text-zinc-100 border border-white/[0.08] hover:bg-white/[0.08]",
    danger: "bg-red-900/10 text-red-500 border border-red-900/20 hover:bg-red-900/20",
    success: "bg-emerald-900/10 text-emerald-500 border border-emerald-900/20 hover:bg-emerald-900/20",
    ghost: "bg-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
