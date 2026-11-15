import React from 'react';
import logoImg from '../img/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'badge-only';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'light',
  showSubtitle = false 
}) => {
  // Height configurations tailored for different contexts
  const imgSizes = {
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Container with the official logo image + orange accent dot from Figma */}
      <div className="relative inline-flex items-center justify-center bg-white rounded-xl p-1 border border-[#D5C7BA]/80 shadow-2xs">
        <img 
          src={logoImg} 
          alt="¡Hola, Café! Logo" 
          className={`${imgSizes[size]} w-auto object-contain select-none`}
          draggable={false}
        />
        {/* Figma characteristic orange dot at top right */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#DF7B1B] border-2 border-white shadow-xs" />
      </div>

      {variant !== 'badge-only' && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight leading-none ${variant === 'dark' ? 'text-white' : 'text-[#1E110A]'} text-lg sm:text-xl font-sans`}>
            ¡Hola, Café!
          </span>
          {showSubtitle && (
            <span className="text-[11px] text-[#786B63] font-medium tracking-wide mt-0.5 font-sans">
              Control de Comandas y Monitoreo de Mesas
            </span>
          )}
        </div>
      )}
    </div>
  );
};
