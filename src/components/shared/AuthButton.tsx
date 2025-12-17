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
  const baseClasses = "font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-300 hover:shadow-xl hover:shadow-indigo-400 hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader className="animate-spin" size={20} />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {icon && icon}
        </>
      )}
    </button>
  );
};

export default AuthButton;