import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { VexoLogo } from './VexoLogo';
import { API_BASE_URL } from '../../lib/api/client';
import {
  homepageApi,
  albumsApi,
  artistsApi,
  servicesApi,
  eventsApi,
  videosApi,
} from '../../lib/api';

interface VexoLogoLoaderProps {
  currentPath: string;
  onComplete?: () => void;
}

/**
 * Resolves the critical initial data promise for the active page route.
 * Attaches directly to existing in-flight deduplicated calls to avoid redundant requests.
 */
function getCriticalInitialPromise(pathname: string): Promise<any> {
  const cleanPath = pathname.toLowerCase();

  if (cleanPath === '/' || cleanPath === '') {
    return homepageApi.getHomepage();
  }
  if (cleanPath.startsWith('/services')) {
    return servicesApi.getServicesList();
  }
  if (cleanPath === '/music') {
    return albumsApi.getAlbums();
  }
  if (cleanPath === '/artists') {
    return artistsApi.getArtists();
  }
  if (cleanPath === '/events') {
    return eventsApi.getEvents();
  }
  if (cleanPath === '/videos') {
    return videosApi.getVideos();
  }
  if (cleanPath === '/packages' || cleanPath === '/pre-wedding' || cleanPath === '/wedding') {
    return fetch(`${API_BASE_URL}/pre-wedding`, { cache: 'no-store' }).catch(() => {});
  }
  // Default for static or contact pages
  return fetch(`${API_BASE_URL}/site-settings`).catch(() => {});
}

export const VexoLogoLoader: React.FC<VexoLogoLoaderProps> = ({ currentPath, onComplete }) => {
  const shouldReduceMotion = useReducedMotion();

  // Reveal width stages in SVG viewBox units (0 to 420):
  // 0: hidden | 90: V | 145: VE | 224: VEX | 300: VEXO | 420: Complete
  const [revealWidth, setRevealWidth] = useState<number>(shouldReduceMotion ? 420 : 0);
  const [accentsOpacity, setAccentsOpacity] = useState<number>(shouldReduceMotion ? 1 : 0);
  const [isAnimationFinished, setIsAnimationFinished] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(true);

  const onCompleteCalled = useRef(false);

  // 1. Fast, cinematic progressive mask reveal sequence (~950ms total)
  useEffect(() => {
    if (shouldReduceMotion) {
      setRevealWidth(420);
      setAccentsOpacity(1);
      const timer = setTimeout(() => {
        setIsAnimationFinished(true);
      }, 150);
      return () => clearTimeout(timer);
    }

    const timers: Array<ReturnType<typeof setTimeout>> = [];

    // Stage 1: Reveal 'V'
    timers.push(
      setTimeout(() => {
        setRevealWidth(90);
      }, 50)
    );

    // Stage 2: Reveal 'VE'
    timers.push(
      setTimeout(() => {
        setRevealWidth(145);
      }, 200)
    );

    // Stage 3: Reveal 'VEX'
    timers.push(
      setTimeout(() => {
        setRevealWidth(224);
      }, 350)
    );

    // Stage 4: Reveal 'VEXO'
    timers.push(
      setTimeout(() => {
        setRevealWidth(300);
      }, 500)
    );

    // Stage 5: Illuminate Crown Accents & Subtitle ("ENTERTAINMENT PRIVATE LIMITED")
    timers.push(
      setTimeout(() => {
        setRevealWidth(420);
        setAccentsOpacity(1);
      }, 650)
    );

    // Stage 6: Hold complete mark briefly (~300ms) then trigger smooth dismissal
    timers.push(
      setTimeout(() => {
        setIsAnimationFinished(true);
      }, 950)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [shouldReduceMotion]);

  // 2. Pre-warm / preload critical page data in the background without blocking the loader
  useEffect(() => {
    try {
      const criticalPromise = getCriticalInitialPromise(currentPath);
      Promise.resolve(criticalPromise).catch((err) => {
        console.warn('[VexoLogoLoader] Background data preload note:', err);
      });
    } catch {
      // Non-blocking
    }
  }, [currentPath]);

  // 3. Smooth exit once visual reveal is finished - NEVER blocked by live API latency
  useEffect(() => {
    if (isAnimationFinished && isVisible) {
      setIsVisible(false);
    }
  }, [isAnimationFinished, isVisible]);

  // Prevent background scroll while loading
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleExitComplete = () => {
    if (!onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete?.();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          key="vexo-logo-reveal-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: shouldReduceMotion ? 0.15 : 0.28,
              ease: [0.22, 1, 0.36, 1], // Smooth, gentle fade-out
            },
          }}
          style={
            {
              '--logo-primary': '#FFFFFF',
              '--logo-o-bg': '#050505',
              '--logo-subtext': '#94A3B8',
              transform: 'translateZ(0)',
              willChange: 'opacity',
            } as React.CSSProperties
          }
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white select-none pointer-events-auto"
          role="status"
          aria-live="polite"
          aria-label="Loading VEXO Music Entertainment"
        >
          {/* Subtle Ambient Radial Glow (Hardware-accelerated, zero-blur) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[280px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(224, 0, 0, 0.12) 0%, rgba(5, 5, 5, 0) 72%)',
              transform: 'translate3d(-50%, -50%, 0)',
            }}
          />

          {/* Centered Logo Container with subtle cinematic presence */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform, opacity',
            }}
            className="relative z-10 flex flex-col items-center justify-center px-4"
          >
            {/* Reused official VEXO Logo with animated mask clipPath */}
            <VexoLogo
              size="xl"
              clipId="vexoWordmarkRevealClip"
              revealWidth={revealWidth}
              accentsOpacity={accentsOpacity}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VexoLogoLoader;
