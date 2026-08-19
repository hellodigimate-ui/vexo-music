import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface FloatingNote {
  id: number;
  symbol: string;
  x: number;
  y: number;
  angle: number;
  delay: number;
  size: number;
}

const MUSIC_SYMBOLS = ['♪', '♫', '♩', '♬', '≋', '⚡'];

export const ThemeTransition: React.FC = () => {
  const { isTransitioning, transitionOrigin, targetTheme, isReducedMotion } = useTheme();
  const [notes, setNotes] = useState<FloatingNote[]>([]);

  useEffect(() => {
    if (isTransitioning && transitionOrigin && !isReducedMotion) {
      // Generate small bouquet of harmonic music notes around click origin
      const generated: FloatingNote[] = Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * 360 + (Math.random() * 30 - 15);
        const distance = 40 + Math.random() * 50;
        const rad = (angle * Math.PI) / 180;
        return {
          id: i,
          symbol: MUSIC_SYMBOLS[i % MUSIC_SYMBOLS.length],
          x: Math.cos(rad) * distance,
          y: Math.sin(rad) * distance - 20,
          angle: (Math.random() - 0.5) * 45,
          delay: i * 0.04,
          size: 14 + Math.random() * 8,
        };
      });
      setNotes(generated);
    } else {
      setNotes([]);
    }
  }, [isTransitioning, transitionOrigin, isReducedMotion]);

  if (!isTransitioning || !transitionOrigin || isReducedMotion) {
    return null;
  }

  const { x, y } = transitionOrigin;
  const isLightTransition = targetTheme === 'light';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Acoustic Soundwave Radial Ripple Overlay */}
      <div
        className="absolute rounded-full transition-all duration-700 ease-out"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: 'max(250vw, 250vh)',
          height: 'max(250vw, 250vh)',
          transform: 'translate(-50%, -50%)',
          background: isLightTransition
            ? 'radial-gradient(circle, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.85) 45%, rgba(224, 0, 0, 0.25) 70%, transparent 100%)'
            : 'radial-gradient(circle, rgba(5, 5, 5, 0.98) 0%, rgba(14, 14, 19, 0.9) 45%, rgba(224, 0, 0, 0.3) 70%, transparent 100%)',
          animation: 'acoustic-shockwave 0.75s cubic-bezier(0.12, 0.8, 0.2, 1) forwards',
        }}
      />

      {/* 2. Concentric Acoustic Speaker Shockwave Rings */}
      <div
        className="absolute rounded-full border-2 border-vexo-red-bright/60 shadow-[0_0_35px_rgba(224,0,0,0.6)]"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '120px',
          height: '120px',
          animation: 'acoustic-shockwave 0.7s cubic-bezier(0.1, 0.85, 0.15, 1) forwards',
        }}
      />
      <div
        className="absolute rounded-full border border-vexo-red/40"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '240px',
          height: '240px',
          animation: 'acoustic-shockwave 0.75s cubic-bezier(0.1, 0.85, 0.15, 1) 0.08s forwards',
        }}
      />

      {/* 3. Floating Harmonic Audio Particles */}
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute font-mono font-bold text-vexo-red-bright drop-shadow-[0_0_12px_rgba(224,0,0,0.8)]"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            fontSize: `${note.size}px`,
            '--note-x': `${note.x}px`,
            '--note-y': `${note.y}px`,
            '--note-r': `${note.angle}deg`,
            animation: `float-music-note 0.65s cubic-bezier(0.2, 0.9, 0.3, 1) ${note.delay}s forwards`,
          } as React.CSSProperties}
        >
          {note.symbol}
        </div>
      ))}
    </div>
  );
};

export default ThemeTransition;
