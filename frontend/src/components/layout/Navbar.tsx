import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { VexoLogo } from '../ui/VexoLogo';
import { cn } from '../../lib/utils';
import { Search, Menu, X, ArrowUpRight, Music, Sparkles } from 'lucide-react';
import { MusicThemeToggle } from '../theme';

import { navItems, type NavItem } from './navData';
export type { NavItem };

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // GPU-Accelerated Bubble sliding animation state
  const [bubbleStyle, setBubbleStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut (⌘K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update bubble position using GPU transform offsets
  const updateBubblePosition = (targetPath: string) => {
    const itemEl = itemRefs.current.get(targetPath);
    if (itemEl && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();

      setBubbleStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    const currentTarget = hoveredPath || location.pathname;
    updateBubblePosition(currentTarget);
  }, [location.pathname, hoveredPath]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      updateBubblePosition(hoveredPath || location.pathname);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname, hoveredPath]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Close mobile menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/music?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* Apple-Grade Frosted Glass Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 apple-glass-header h-16 sm:h-20 flex items-center overflow-x-clip">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 flex items-center justify-between gap-2 sm:gap-3 xl:gap-4">
          {/* 1. LEFT: VEXO Logo */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className="inline-flex items-center group focus:outline-none hover:opacity-90 transition-opacity duration-200"
              aria-label="VEXO Music Entertainment Home"
            >
              <VexoLogo size="md" />
            </Link>
          </div>

          {/* 2. CENTER: Apple-Style Translucent Nav Pill */}
          <div className="hidden lg:flex items-center justify-center shrink-0 min-w-0">
            <nav
              ref={navRef}
              onMouseLeave={() => setHoveredPath(null)}
              className="relative flex items-center apple-nav-pill p-0.5 xl:p-1 rounded-full"
            >
              {/* Ultra-Smooth Animated Red Active Indicator */}
              <div
                className="absolute top-0.5 bottom-0.5 xl:top-1 xl:bottom-1 left-0 rounded-full bg-vexo-red shadow-sm pointer-events-none"
                style={{
                  transform: `translate3d(${bubbleStyle.left}px, 0, 0)`,
                  width: `${bubbleStyle.width}px`,
                  opacity: bubbleStyle.opacity,
                  transition:
                    'transform 280ms cubic-bezier(0.16, 1, 0.3, 1), width 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease-out',
                  willChange: 'transform, width',
                }}
              />

              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isHovered = hoveredPath === item.path;
                const isHighlighted = isHovered || (hoveredPath === null && isActive);

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    ref={(el) => {
                      if (el) itemRefs.current.set(item.path, el);
                      else itemRefs.current.delete(item.path);
                    }}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    className={cn(
                      'relative z-10 px-2.5 xl:px-3.5 py-1 xl:py-1.5 rounded-full text-[11px] xl:text-xs font-semibold tracking-wide transition-colors duration-200 select-none whitespace-nowrap flex items-center justify-center',
                      isHighlighted
                        ? 'nav-link-active text-white font-bold'
                        : 'nav-link-inactive text-slate-600 dark:text-zinc-400'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 3. RIGHT: Controls (Cool Search Bar + Theme Toggle + Socials + BOOK A PROJECT) */}
          <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
            {/* Desktop Cool Search Capsule with ⌘K Badge */}
            <div className="relative hidden md:block shrink-0">
              <form
                onSubmit={handleSearchSubmit}
                className={cn(
                  'group flex items-center gap-2 px-3 py-1.5 h-9 rounded-full transition-all duration-300 border cursor-text',
                  isSearchFocused
                    ? 'w-48 lg:w-56 xl:w-64 border-vexo-red/60 bg-white dark:bg-zinc-900/95 shadow-md ring-2 ring-vexo-red/20'
                    : 'w-36 lg:w-40 xl:w-48 bg-white/80 dark:bg-white/[0.06] border-slate-300 dark:border-white/[0.12] hover:border-slate-400 dark:hover:border-white/25 shadow-2xs'
                )}
                onClick={() => searchInputRef.current?.focus()}
              >
                <Search
                  className={cn(
                    'w-3.5 h-3.5 shrink-0 transition-colors duration-200',
                    isSearchFocused ? 'text-vexo-red' : 'text-slate-600 dark:text-zinc-400 group-hover:text-vexo-red'
                  )}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 220)}
                  className="apple-search-input bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-400 font-medium"
                />

                {/* Clear or ⌘K Shortcut Chip */}
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-white/10 select-none shrink-0 shadow-2xs">
                    ⌘K
                  </kbd>
                )}
              </form>

              {/* Apple-Style Live Spotlight Dropdown */}
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-11 right-0 w-64 sm:w-72 p-3.5 rounded-2xl apple-glass-card shadow-2xl border z-50 text-xs select-none"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-400 mb-2.5 pb-1.5 border-b border-black/5 dark:border-white/10">
                      <span className="flex items-center gap-1 font-bold">
                        <Sparkles className="w-3 h-3 text-vexo-red" /> Trending Releases
                      </span>
                      <span>Press ↵</span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { title: 'Satane Lage Ho', sub: 'Official Release • Rashmi Nishad' },
                        { title: 'Rashmi Nishad', sub: 'Featured Artist' },
                        { title: 'Music Production', sub: 'Studio Service' },
                      ].map((item) => (
                        <div
                          key={item.title}
                          onMouseDown={() => {
                            navigate(`/music?search=${encodeURIComponent(item.title)}`);
                            setSearchQuery(item.title);
                            setIsSearchFocused(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-vexo-red/10 text-vexo-red flex items-center justify-center shrink-0 group-hover:bg-vexo-red group-hover:text-white transition-colors">
                            <Music className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                              {item.sub}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Button (Compact round icon on mobile only) */}
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
              className="w-9 h-9 min-h-[36px] max-h-[36px] rounded-full apple-btn-round md:!hidden flex items-center justify-center cursor-pointer shrink-0 transition-transform active:scale-95"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Music-Themed Theme Visualizer Toggle */}
            <MusicThemeToggle variant="compact" className="shrink-0" />

            {/* Social Icons (Shown only on ultra-wide screens 2xl: 1536px+ to preserve navbar width on standard screens) */}
            <div className="hidden 2xl:flex items-center gap-2 pl-1 shrink-0">
              <a
                href="https://www.instagram.com/vexomusicentertainment"
                target="_blank"
                rel="noopener noreferrer"
                className="apple-control-btn apple-social-insta"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@vexomusicentertainment"
                target="_blank"
                rel="noopener noreferrer"
                className="apple-control-btn apple-social-yt"
                title="YouTube"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://x.com/vexomusicentertainment"
                target="_blank"
                rel="noopener noreferrer"
                className="apple-control-btn apple-social-x"
                title="X / Twitter"
                aria-label="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            {/* Book A Project CTA */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/contact')}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex font-bold tracking-wider text-xs uppercase shadow-sm hover:bg-red-700 transition-colors shrink-0 px-3 xl:px-4 py-1.5"
            >
              <span className="hidden xl:inline">BOOK A PROJECT</span>
              <span className="xl:hidden">BOOK NOW</span>
            </Button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (isMobileSearchOpen) setIsMobileSearchOpen(false);
              }}
              className="w-9 h-9 min-h-[36px] max-h-[36px] rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red hover:text-white hover:bg-vexo-red transition-all flex items-center justify-center cursor-pointer lg:hidden shrink-0 active:scale-95"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Down Search Bar (Underneath Header) */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 sm:top-20 left-0 right-0 z-40 p-3 apple-glass-header border-b md:hidden"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-300 dark:border-white/15 apple-glass-card shadow-sm">
              <Search className="w-4 h-4 text-vexo-red shrink-0" />
              <input
                type="text"
                placeholder="Search tracks, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="apple-search-input bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apple-Style Slide-Down Fullscreen Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 apple-mobile-drawer flex flex-col p-6 sm:p-10 pt-20 sm:pt-24 overflow-y-auto"
          >
            {/* Background Accent glow */}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-vexo-red/15 rounded-full blur-3xl pointer-events-none" />

            <div className="min-h-full flex flex-col justify-between gap-8 relative z-10">
              {/* Mobile Large Links */}
              <nav className="flex flex-col gap-3 my-auto pt-4">
                {navItems.map((item, idx) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ transitionDelay: `${idx * 30}ms` }}
                    className={cn(
                      'text-2xl sm:text-3xl font-black tracking-tight transition-all duration-200 w-fit flex items-center gap-3',
                      location.pathname === item.path
                        ? 'text-vexo-red translate-x-2'
                        : 'text-slate-800 dark:text-white/80 hover:text-black dark:hover:text-white hover:translate-x-2'
                    )}
                  >
                    <span className="text-xs font-mono text-zinc-400">0{idx + 1}.</span>
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Footer CTA & Theme Switcher */}
              <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">
                    Studio Theme
                  </span>
                  <MusicThemeToggle variant="pill" />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/contact');
                  }}
                  rightIcon={<ArrowUpRight className="w-5 h-5" />}
                  className="w-full font-bold tracking-wider uppercase text-sm py-4 shadow-sm hover:bg-red-700 transition-colors"
                >
                  BOOK A PROJECT
                </Button>

                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Follow VEXO</span>
                  <div className="flex items-center gap-4">
                    <a
                      href="https://www.instagram.com/vexomusicentertainment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-pink-500"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://www.youtube.com/@vexomusicentertainment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-500"
                    >
                      YouTube
                    </a>
                    <a
                      href="https://x.com/vexomusicentertainment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-sky-400"
                    >
                      X
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
