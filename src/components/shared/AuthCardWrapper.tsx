import React, {  type ReactNode } from 'react';

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 transform transition-transform hover:scale-110">
            {icon}
          </div>
        )}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>

      {/* Content */}
      {children}
    </>
  );
};

export default AuthCardWrapper;