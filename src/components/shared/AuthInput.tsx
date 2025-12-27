import React, { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeClosed , type LucideIcon } from 'lucide-react';

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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
          isFocused ? 'text-indigo-600' : 'text-gray-400'
        }`}>
          <Icon size={20} />
        </div>
        <input
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full pl-12 ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-600'
              : isFocused
                ? 'border-indigo-600 shadow-lg shadow-indigo-100'
                : 'border-gray-300 hover:border-indigo-400'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default AuthInput;