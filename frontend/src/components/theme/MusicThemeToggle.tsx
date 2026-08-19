import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Disc3 } from 'lucide-react';

interface MusicThemeToggleProps {
  variant?: 'compact' | 'pill' | 'minimal';
  className?: string;
}

export const MusicThemeToggle: React.FC<MusicThemeToggleProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { theme, toggleTheme, isTransitioning, isReducedMotion } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const isDark = theme === 'dark';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      toggleTheme({
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      });
    }
  };

  const ariaLabel = `Switch to ${isDark ? 'Light' : 'Dark'} Mode (Current theme: ${
    isDark ? 'Midnight Studio Dark' : 'Daylight Acoustic Light'
  })`;

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-vexo-red select-none ${
          isDark
            ? 'bg-black/60 hover:bg-neutral-900 border-white/10 hover:border-vexo-red/50 shadow-md shadow-black/50'
            : 'bg-white/90 hover:bg-slate-100 border-slate-200 hover:border-vexo-red/50 shadow-sm shadow-slate-300/40'
        } ${className}`}
        aria-label={ariaLabel}
        title={isDark ? 'Switch to Daylight Light Mode' : 'Switch to Midnight Dark Mode'}
      >
        {/* Equalizer Visualizer Bars */}
        <div className="flex items-end gap-0.5 h-3.5 w-4 justify-center">
          <span
            className={`w-0.5 rounded-full bg-vexo-red transition-all ${
              !isReducedMotion && (isHovered || isTransitioning)
                ? 'animate-eq-fast-1'
                : !isReducedMotion
                ? 'animate-eq-1'
                : 'h-2'
            }`}
          />
          <span
            className={`w-0.5 rounded-full ${isDark ? 'bg-zinc-400 group-hover:bg-white' : 'bg-slate-500 group-hover:bg-black'} transition-all ${
              !isReducedMotion && (isHovered || isTransitioning)
                ? 'animate-eq-fast-2'
                : !isReducedMotion
                ? 'animate-eq-2'
                : 'h-3'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-vexo-red-bright transition-all ${
              !isReducedMotion && (isHovered || isTransitioning)
                ? 'animate-eq-fast-3'
                : !isReducedMotion
                ? 'animate-eq-3'
                : 'h-2.5'
            }`}
          />
          <span
            className={`w-0.5 rounded-full ${isDark ? 'bg-zinc-400 group-hover:bg-white' : 'bg-slate-500 group-hover:bg-black'} transition-all ${
              !isReducedMotion && (isHovered || isTransitioning)
                ? 'animate-eq-fast-4'
                : !isReducedMotion
                ? 'animate-eq-4'
                : 'h-1.5'
            }`}
          />
        </div>

        {/* Mode Label */}
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-300 group-hover:text-white">
          {isDark ? 'MIDNIGHT' : 'DAYLIGHT'}
        </span>

        {/* Small Vinyl Spindle */}
        <div
          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-transform duration-500 ${
            !isReducedMotion && isHovered ? 'rotate-180 scale-110' : ''
          }`}
        >
          <Disc3 className={`w-3 h-3 ${isDark ? 'text-vexo-red-bright' : 'text-vexo-red'}`} />
        </div>
      </button>
    );
  }

  // Default: Compact Audio Visualizer Dial
  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`apple-control-btn group relative select-none ${
        isTransitioning && !isReducedMotion ? 'animate-beat-pulse' : ''
      } ${className}`}
      aria-label={ariaLabel}
      title={isDark ? 'Switch to Daylight Light Mode' : 'Switch to Midnight Dark Mode'}
    >
      {/* Subtle Red Ambient Glow when active */}
      <div
        className={`absolute inset-0 rounded-full bg-vexo-red/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />

      {/* 4-Band Equalizer Sound Wave Visualizer */}
      <div className="relative z-10 flex items-end gap-[2px] h-3.5 w-4 justify-center">
        <span
          className={`w-[2.5px] rounded-full bg-vexo-red transition-all duration-200 ${
            !isReducedMotion && (isHovered || isTransitioning)
              ? 'animate-eq-fast-1'
              : !isReducedMotion
              ? 'animate-eq-1'
              : 'h-2'
          }`}
          style={isReducedMotion ? { height: isDark ? '3px' : '9px' } : undefined}
        />
        <span
          className={`w-[2.5px] rounded-full ${
            isDark ? 'bg-zinc-300 group-hover:bg-white' : 'bg-zinc-600 group-hover:bg-black'
          } transition-all duration-200 ${
            !isReducedMotion && (isHovered || isTransitioning)
              ? 'animate-eq-fast-2'
              : !isReducedMotion
              ? 'animate-eq-2'
              : 'h-3.5'
          }`}
          style={isReducedMotion ? { height: isDark ? '8px' : '4px' } : undefined}
        />
        <span
          className={`w-[2.5px] rounded-full bg-vexo-red-bright transition-all duration-200 ${
            !isReducedMotion && (isHovered || isTransitioning)
              ? 'animate-eq-fast-3'
              : !isReducedMotion
              ? 'animate-eq-3'
              : 'h-2.5'
          }`}
          style={isReducedMotion ? { height: isDark ? '4px' : '10px' } : undefined}
        />
        <span
          className={`w-[2.5px] rounded-full ${
            isDark ? 'bg-zinc-400 group-hover:bg-white' : 'bg-zinc-500 group-hover:bg-black'
          } transition-all duration-200 ${
            !isReducedMotion && (isHovered || isTransitioning)
              ? 'animate-eq-fast-4'
              : !isReducedMotion
              ? 'animate-eq-4'
              : 'h-1.5'
          }`}
          style={isReducedMotion ? { height: isDark ? '7px' : '3px' } : undefined}
        />
      </div>

      {/* Screen Reader Only Notification */}
      <span className="sr-only">
        {isDark ? 'Dark Theme active. Click for Light Theme' : 'Light Theme active. Click for Dark Theme'}
      </span>
    </button>
  );
};

export default MusicThemeToggle;
