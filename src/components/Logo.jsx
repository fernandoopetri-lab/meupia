import React from 'react';

const Logo = ({ className = "", theme = "light", size = "md", showText = true }) => {
  const iconSize = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  }[size];

  const logoUrl = "https://horizons-cdn.hostinger.com/860644ba-faa3-419e-8682-0050f10d2689/57e13ed333d106107e87390582543d59.png";

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${iconSize} flex items-center justify-center bg-lime-500/10 rounded-xl p-1.5 border border-lime-500/20 shadow-lg shadow-lime-500/5`}>
        <img
          src={logoUrl}
          alt="Meu Pila Logo"
          className="object-contain w-full h-full"
        />
      </div>
      {showText && (
        <span className={`${textSize} font-bold tracking-tight ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent' 
            : 'text-slate-800'
        }`}>
          Meu Pila
        </span>
      )}
    </div>
  );
};

export default Logo;
