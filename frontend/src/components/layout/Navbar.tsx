import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { VexoLogo } from '../ui/VexoLogo';
import { cn } from '../../lib/utils';
import { Search, Menu, X, ArrowUpRight } from 'lucide-react';

import { navItems, type NavItem } from './navData';
export type { NavItem };

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // GPU-Accelerated Bubble sliding animation state
  const [bubbleStyle, setBubbleStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isScrolled
            ? 'bg-[#050505]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3'
            : 'bg-transparent py-5'
        )}
      >
        <Container size="full" className="px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          {/* Official Transparent Vector VEXO Entertainment Logo */}
          <Link
            to="/"
            className="flex items-center group focus:outline-none hover:scale-105 transition-transform duration-300"
          >
            <VexoLogo size="md" />
          </Link>

          {/* Desktop Nav Items with Silky GPU-Accelerated Sliding Bubble */}
          <nav
            ref={navRef}
            onMouseLeave={() => setHoveredPath(null)}
            className="relative hidden lg:flex items-center glass-panel p-1.5 rounded-full border border-white/10 shadow-inner"
          >
            {/* Ultra-Smooth Animated Red Pill Indicator */}
            <div
              className="absolute top-1.5 bottom-1.5 left-0 rounded-full bg-gradient-to-r from-vexo-red to-vexo-red-bright shadow-[0_0_22px_rgba(224,0,0,0.65)] border border-vexo-red-bright/40 pointer-events-none"
              style={{
                transform: `translate3d(${bubbleStyle.left}px, 0, 0)`,
                width: `${bubbleStyle.width}px`,
                opacity: bubbleStyle.opacity,
                transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1), width 380ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out',
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
                    'relative z-10 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-colors duration-300 select-none whitespace-nowrap flex items-center justify-center',
                    isHighlighted
                      ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                      : 'text-vexo-muted hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Trigger */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center bg-neutral-900 border border-vexo-red/50 rounded-full px-3.5 py-2 text-xs text-white w-52 transition-all animate-fadeIn shadow-[0_0_15px_rgba(224,0,0,0.2)]">
                  <Search className="w-3.5 h-3.5 text-vexo-muted mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search music, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-vexo-muted w-full"
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-vexo-muted hover:text-white ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-vexo-muted hover:text-white hover:border-vexo-red/50 hover:bg-vexo-red/10 transition-all duration-300"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-1.5 border-l border-r border-white/10 px-3">
              <a
                href="https://www.instagram.com/vexomusicentertainment"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-vexo-muted hover:text-pink-500 transition-colors"
                title="Instagram"
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
                className="p-2 text-vexo-muted hover:text-red-500 transition-colors"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://x.com/vexomusicentertainment"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-vexo-muted hover:text-sky-400 transition-colors"
                title="X / Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            {/* Book A Project CTA */}
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/contact')}
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
              className="font-bold tracking-wider text-xs uppercase"
            >
              BOOK A PROJECT
            </Button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-vexo-muted hover:text-white"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red hover:text-white hover:bg-vexo-red transition-all"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </Container>

        {/* Mobile Search Overlay Bar */}
        {isSearchOpen && (
          <div className="lg:hidden px-4 py-3 bg-[#0A0A0A] border-b border-white/10 animate-fadeIn">
            <div className="flex items-center bg-neutral-900 border border-white/10 rounded-full px-4 py-2 text-sm">
              <Search className="w-4 h-4 text-vexo-muted mr-3" />
              <input
                type="text"
                placeholder="Search tracks, artists, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent border-none outline-none text-sm text-white placeholder-vexo-muted w-full"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-vexo-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Fullscreen Menu Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-[#050505]/95 backdrop-blur-2xl transition-all duration-500 lg:hidden flex flex-col justify-between p-6 sm:p-10 pt-28',
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-4'
        )}
      >
        {/* Background Accent glow */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-vexo-red/20 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile Large Links */}
        <nav className="flex flex-col gap-3 relative z-10 my-auto">
          {navItems.map((item, idx) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ transitionDelay: `${idx * 40}ms` }}
              className={cn(
                'text-3xl sm:text-4xl font-black tracking-tight transition-all duration-300 w-fit flex items-center gap-3',
                location.pathname === item.path
                  ? 'text-vexo-red-bright translate-x-2'
                  : 'text-white/80 hover:text-white hover:translate-x-2'
              )}
            >
              <span className="text-xs font-mono text-vexo-muted">0{idx + 1}.</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Footer CTA & Socials */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col gap-5">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/contact');
            }}
            rightIcon={<ArrowUpRight className="w-5 h-5" />}
            className="w-full font-bold tracking-wider uppercase text-sm py-4"
          >
            BOOK A PROJECT
          </Button>

          <div className="flex items-center justify-between text-xs text-vexo-muted">
            <span>Follow VEXO</span>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/vexomusicentertainment" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
                Instagram
              </a>
              <a href="https://www.youtube.com/@vexomusicentertainment" target="_blank" rel="noopener noreferrer" className="hover:text-red-500">
                YouTube
              </a>
              <a href="https://x.com/vexomusicentertainment" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400">
                X
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
