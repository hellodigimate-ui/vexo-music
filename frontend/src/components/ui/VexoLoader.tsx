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

interface VexoLoaderProps {
  currentPath: string;
  onComplete?: () => void;
}

/**
 * Resolves the critical initial promise for the current page route.
 * Reuses in-flight deduplicated promises so zero duplicate network requests occur.
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
  if (cleanPath === '/packages' || cleanPath === '/pre-wedding') {
    return fetch(`${API_BASE_URL}/pre-wedding`, { cache: 'no-store' }).catch(() => {});
  }
  // Default for static or contact pages: ensure site settings are ready
  return fetch(`${API_BASE_URL}/site-settings`).catch(() => {});
}

export const VexoLoader: React.FC<VexoLoaderProps> = ({ currentPath, onComplete }) => {
  const [isDataReady, setIsDataReady] = useState(false);
  const [isMinTimeElapsed, setIsMinTimeElapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const shouldReduceMotion = useReducedMotion();
  const onCompleteCalled = useRef(false);

  // 1. Minimum display threshold (450ms) for visual smoothness without sluggishness
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinTimeElapsed(true);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  // 2. Await critical backend data for the current route
  useEffect(() => {
    let isMounted = true;
    const criticalPromise = getCriticalInitialPromise(currentPath);

    // Safety timeout: ensure loader dismisses within 600ms even if live backend is sleeping/slow
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsDataReady(true);
      }
    }, 600);

    Promise.resolve(criticalPromise)
      .catch((err) => {
        console.warn('Initial data preload caught:', err);
      })
      .finally(() => {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setIsDataReady(true);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [currentPath]);

  // 3. Smooth exit as soon as data is ready AND minimum time has elapsed
  const isComplete = isDataReady && isMinTimeElapsed;

  useEffect(() => {
    if (isComplete && isVisible) {
      // Immediate, fluid transition without artificial pause
      setIsVisible(false);
    }
  }, [isComplete, isVisible]);

  // Prevent background scroll while loader is active
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
          key="vexo-initial-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: shouldReduceMotion ? 0.15 : 0.35,
              ease: [0.25, 0.1, 0.25, 1], // Smooth cubic-bezier
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
          {/* Hardware-accelerated radial glow (zero blur filter for 60/120fps performance) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[260px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(224, 0, 0, 0.14) 0%, rgba(5, 5, 5, 0) 70%)',
              transform: 'translate3d(-50%, -50%, 0)',
            }}
          />

          {/* Centered Wordmark with smooth, GPU-accelerated micro-fade */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform, opacity',
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Clean logo without expensive SVG drop-shadow filter */}
            <VexoLogo size="xl" />

            {/* Hardware-accelerated Progress Track using scaleX (zero layout reflows) */}
            <div className="mt-8 sm:mt-10 w-36 sm:w-44 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: isComplete ? 1 : 0.72,
                }}
                transition={{
                  duration: isComplete ? 0.2 : 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  transformOrigin: 'left',
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                }}
                className="h-full w-full bg-gradient-to-r from-vexo-red/50 via-vexo-red to-vexo-red rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VexoLoader;
