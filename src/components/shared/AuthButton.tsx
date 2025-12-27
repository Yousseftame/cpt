import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader } from 'lucide-react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
  children, 
  loading = false,
  loadingText = 'Loading...',
  icon,
  variant = 'primary',
  fullWidth = true,
  disabled,
  ...props 
}) => {
  const baseClasses = "font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group tracking-wide";
  
  const variantClasses = {
    primary: `
     bg-gradient-to-r from-indigo-600 to-purple-600
      text-white shadow-lg shadow-[#921AFA]/40
      hover:shadow-xl hover:shadow-[#921AFA]/50
      hover:scale-[1.02] active:scale-[0.98]
      before:absolute before:inset-0 bg-gradient-to-r from-indigo-600 to-purple-600
      before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-100
    `,
    secondary: `
      bg-white border-2 border-[#a3b18a] text-[#344e41]
      hover:bg-[#dad7cd]/30 hover:border-[#588157]
      hover:shadow-md hover:shadow-[#921AFA]/20
      active:scale-[0.98]
    `
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2.5">
        {loading ? (
          <>
            <Loader className="animate-spin" size={20} strokeWidth={2.5} />
            {loadingText}
          </>
        ) : (
          <>
            {children}
            {icon && <span className="transform transition-transform duration-300 group-hover:translate-x-1">{icon}</span>}
          </>
        )}
      </span>
      
      {/* Shimmer effect on hover */}
      {variant === 'primary' && !disabled && !loading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      )}
    </button>
  );
};

export default AuthButton;