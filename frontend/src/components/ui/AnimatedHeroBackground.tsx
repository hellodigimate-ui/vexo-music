import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedHeroBackgroundProps {
  bgImage?: string;
  overlayOpacity?: string;
}

export const AnimatedHeroBackground: React.FC<AnimatedHeroBackgroundProps> = ({
  bgImage,
  overlayOpacity = 'bg-black/30',
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. VIBRANT CINEMATIC BACKGROUND IMAGE */}
      {bgImage && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={bgImage}
            alt="Hero Background"
            className="w-full h-full object-cover object-center filter brightness-105 contrast-110 saturate-110 opacity-85 sm:opacity-95"
          />
        </motion.div>
      )}

      {/* 2. BALANCED LIGHT OVERLAYS (PHOTO FULLY VISIBLE & VIBRANT) */}
      <div className={`absolute inset-0 ${overlayOpacity}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#050505]" />

      {/* 3. SUBTLE RED AMBIENT GLOW SPOTLIGHT */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-vexo-red/20 rounded-full blur-[140px]"
      />

      {/* 4. TOP & BOTTOM EDGE LIGHTING */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-vexo-red/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export default AnimatedHeroBackground;
