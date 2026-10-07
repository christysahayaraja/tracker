import React from 'react';

interface ChefLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'gold';
  showTagline?: boolean;
  className?: string;
}

export const ChefLogo: React.FC<ChefLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 34, title: 'text-sm', tag: 'text-[9px]' },
    md: { icon: 46, title: 'text-lg', tag: 'text-xs' },
    lg: { icon: 60, title: 'text-2xl', tag: 'text-sm' },
    xl: { icon: 76, title: 'text-3xl', tag: 'text-base' }
  };

  const { icon, title, tag } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Cooked aGain Chef Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-full border border-accent/60 bg-gradient-to-br from-[#242430] via-[#15151C] to-[#0A0A0D] p-1 shadow-lg group transition-transform duration-300 hover:scale-105"
        style={{ width: icon, height: icon }}
      >
        <img
          src="/images/logo/cooked-again-logo.svg"
          alt="Cooked aGain Chef Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(201,169,110,0.4)]"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-serif font-extrabold tracking-tight text-foreground ${title}`}>
            Oops! Life Cooked Again
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-serif tracking-widest uppercase font-bold text-accent ${tag}`}>
            Cooked aGain
          </span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">• Trichy</span>
        </div>
        {showTagline && (
          <span className="text-xs text-muted-foreground mt-0.5 italic">
            Life cooked you. So we cooked for you.
          </span>
        )}
      </div>
    </div>
  );
};
