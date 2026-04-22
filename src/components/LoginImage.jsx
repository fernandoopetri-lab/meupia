import React from 'react';
import LoginPromoCard from './LoginPromoCard';

const LoginImage = () => {
  return (
    <div className="hidden md:flex relative h-full w-full min-h-screen bg-slate-100 overflow-hidden items-center justify-center p-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1642364706752-3af64cc1af5e')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-emerald-900/30 backdrop-blur-[1px]"></div>
      </div>

      {/* Overlaid Card */}
      <div className="relative z-10 w-full max-w-md">
        <LoginPromoCard />
      </div>
    </div>
  );
};

export default LoginImage;