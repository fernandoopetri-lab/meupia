import React from 'react';
import SignUpCard from './SignUpCard';

const SignUpImage = () => {
  return (
    <div className="relative h-full w-full min-h-0 bg-slate-100 overflow-hidden flex items-end justify-start p-4 md:p-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://i.imgur.com/RElbRoK.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for better contrast if needed, mostly for aesthetic tint */}
        <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-[2px]"></div>
      </div>

      {/* Overlaid Card */}
      <div className="relative z-10 w-full max-w-md transform transition-transform hover:scale-105 duration-500">
        <SignUpCard />
      </div>
    </div>
  );
};

export default SignUpImage;