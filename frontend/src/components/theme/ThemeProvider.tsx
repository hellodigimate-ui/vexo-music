import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'dark' | 'light';

export interface TransitionOrigin {
  x: number;
  y: number;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (event?: React.MouseEvent | { clientX: number; clientY: number }) => void;
  isTransitioning: boolean;
  transitionOrigin: TransitionOrigin | null;
  targetTheme: Theme | null;
  isReducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'vexo_music_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setCurrentTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // localStorage may be disabled
    }
    // Default to dark for VEXO Record Label
    return 'dark';
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState<TransitionOrigin | null>(null);
  const [targetTheme, setTargetTheme] = useState<Theme | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Sync DOM classes whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch { }
  }, [theme]);

  // VEXO Music Record Label defaults to dark ('Midnight') theme unless user explicitly toggles theme
  useEffect(() => {
    // Only set default if nothing is in localStorage
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, 'dark');
      }
    } catch { }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setCurrentTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(
    (event?: React.MouseEvent | { clientX: number; clientY: number }) => {
      const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

      // If reduced motion is requested, switch instantly without visual soundwave animation
      if (isReducedMotion) {
        setCurrentTheme(nextTheme);
        return;
      }

      // Calculate exact origin coordinates from click or center of viewport
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;

      if (event && 'clientX' in event && event.clientX !== undefined) {
        x = event.clientX;
        y = event.clientY;
      }

      setTransitionOrigin({ x, y });
      setTargetTheme(nextTheme);
      setIsTransitioning(true);

      // Switch theme class at peak wave moment (approx 260ms)
      const themeTimer = setTimeout(() => {
        setCurrentTheme(nextTheme);
      }, 260);

      // End transition state smoothly
      const endTimer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionOrigin(null);
        setTargetTheme(null);
      }, 750);

      return () => {
        clearTimeout(themeTimer);
        clearTimeout(endTimer);
      };
    },
    [theme, isReducedMotion]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isTransitioning,
        transitionOrigin,
        targetTheme,
        isReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
