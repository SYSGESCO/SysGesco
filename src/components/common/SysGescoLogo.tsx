import React, { useState } from 'react';
import logoSrc from '../../assets/logo.png';

interface SysGescoLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  theme?: 'dark' | 'light';
}

export const SysGescoLogo: React.FC<SysGescoLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  textClassName = '',
  theme = 'light',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses: Record<string, { img: string; text: string; box: string }> = {
    xs: { img: 'w-6 h-6', text: 'text-xs', box: 'w-6 h-6 text-[10px]' },
    sm: { img: 'w-8 h-8', text: 'text-sm', box: 'w-8 h-8 text-xs' },
    md: { img: 'w-10 h-10', text: 'text-base', box: 'w-10 h-10 text-sm' },
    lg: { img: 'w-14 h-14', text: 'text-xl', box: 'w-14 h-14 text-base' },
    xl: { img: 'w-20 h-20', text: 'text-2xl', box: 'w-20 h-20 text-lg' },
    '2xl': { img: 'w-28 h-28', text: 'text-3xl', box: 'w-28 h-28 text-2xl' },
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {!hasError ? (
        <img
          src={logoSrc}
          alt="SysGesco Logo"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`${selectedSize.img} rounded-full object-contain shrink-0 bg-white shadow-2xs`}
        />
      ) : (
        <div
          className={`${selectedSize.box} rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-black tracking-wider shrink-0 border border-amber-400/40`}
        >
          <span className="text-amber-400">SG</span>
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-black tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-[#1e3a5f]'
            } ${selectedSize.text} ${textClassName}`}
          >
            Sys<span className="text-[#f97316]">Gesco</span>
          </span>
        </div>
      )}
    </div>
  );
};
