import React, { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  icon: LucideIcon;
  error?: string;
  showPasswordToggle?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({ 
  label, 
  icon: Icon, 
  error,
  showPasswordToggle = false,
  type = 'text',
  disabled = false,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle 
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-[#344e41] mb-2.5 tracking-wide">
        {label}
      </label>
      <div className="relative group">
        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
          isFocused ? 'text-[#588157] scale-110' : 'text-[#a3b18a]'
        }`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <input
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full pl-12 ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none font-medium text-[#344e41] placeholder:text-[#a3b18a]/50 ${
            error
              ? 'border-red-500 focus:border-red-600 bg-red-50/30'
              : isFocused
                ? 'border-[#588157] shadow-lg shadow-[#588157]/20 bg-white'
                : 'border-[#dad7cd] hover:border-[#a3b18a] bg-[#dad7cd]/10'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#a3b18a] hover:text-[#588157] transition-all duration-300 hover:scale-110"
          >
            {showPassword ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
          </button>
        )}
        
        {/* Focus ring effect */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-xl border-2 border-[#588157] animate-pulse pointer-events-none"></div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;