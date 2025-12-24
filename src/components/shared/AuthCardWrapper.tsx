import React, { type ReactNode } from 'react';

interface AuthCardWrapperProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

const AuthCardWrapper: React.FC<AuthCardWrapperProps> = ({ 
  children, 
  title, 
  subtitle,
  icon 
}) => {
  return (
    <>
      {/* Logo/Header */}
      <div className="text-center mb-8">
        {icon && (
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#588157] via-[#3a5a40] to-[#344e41] rounded-2xl mb-6 transform transition-all duration-300 hover:scale-110 hover:rotate-3 shadow-lg shadow-[#588157]/30">
            {icon}
          </div>
        )}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#344e41] via-[#3a5a40] to-[#588157] bg-clip-text text-transparent mb-3 tracking-tight">
          {title}
        </h1>
        <p className="text-[#3a5a40]/70 text-sm font-medium">{subtitle}</p>
      </div>

      {/* Content */}
      {children}
    </>
  );
};

export default AuthCardWrapper;