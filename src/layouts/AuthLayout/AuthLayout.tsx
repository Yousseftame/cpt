import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Right Side - Decorative Geometric Pattern */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          {/* Grid of geometric shapes */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {/* Row 1 */}
            <div className="relative overflow-hidden bg-purple-500/20">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-400/30 rounded-full transform translate-x-16 translate-y-16"></div>
            </div>
            <div className="relative overflow-hidden bg-indigo-700/30">
              <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-cyan-400/40" fill="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="6" height="6" />
                <rect x="14" y="4" width="6" height="6" />
                <rect x="4" y="14" width="6" height="6" />
                <rect x="14" y="14" width="6" height="6" />
              </svg>
            </div>
            <div className="relative overflow-hidden bg-blue-600/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400"></div>
              <div className="absolute top-4 left-0 w-full h-0.5 bg-cyan-400/60"></div>
              <div className="absolute top-8 left-0 w-full h-0.5 bg-cyan-400/40"></div>
            </div>

            {/* Row 2 */}
            <div className="relative overflow-hidden bg-indigo-800/40">
              <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-purple-300/50" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="12,2 22,22 2,22" />
              </svg>
            </div>
            <div className="relative overflow-hidden bg-purple-700/30">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-white/20 rounded-lg rotate-45"></div>
              <svg className="absolute top-4 right-4 w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </div>
            <div className="relative overflow-hidden bg-blue-800/30">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="w-16 h-16 text-white/30" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Row 3 */}
            <div className="relative overflow-hidden bg-purple-600/25">
              <svg className="absolute bottom-4 left-4 w-12 h-12 text-cyan-300/60" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="12,2 2,12 12,22 22,12" />
              </svg>
            </div>
            <div className="relative overflow-hidden bg-indigo-900/40">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/30"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-0.5 bg-white/20 rotate-45"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-0.5 bg-white/20 -rotate-45"></div>
            </div>
            <div className="relative overflow-hidden bg-blue-700/35">
              <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-2 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              <div className="absolute bottom-8 right-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="w-2 h-2 bg-white/30 rounded-sm"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Animated floating elements */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-40"></div>
          
          {/* Large decorative circles */}
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-900/40 rounded-full"></div>
          <div className="absolute top-1/3 -left-20 w-48 h-48 bg-purple-800/30 rounded-full"></div>
        </div>

        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-900/10 to-black/20"></div>
      </div>
    </div>
  );
};

export default AuthLayout;