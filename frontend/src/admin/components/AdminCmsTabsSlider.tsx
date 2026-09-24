import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface AdminCmsTabsSliderProps {
  tabs: TabItem[];
  activeTab: string;
  onChangeTab: (tabId: string) => void;
  accentColor?: 'amber' | 'red';
}

export const AdminCmsTabsSlider: React.FC<AdminCmsTabsSliderProps> = ({
  tabs,
  activeTab,
  onChangeTab,
  accentColor = 'amber',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Dragging interaction state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const checkScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < maxScroll - 6);

    if (maxScroll > 0) {
      const progress = Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100));
      setScrollProgress(progress);
    } else {
      setScrollProgress(100);
    }
  }, []);

  useEffect(() => {
    checkScrollState();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState, tabs]);

  // Center the active tab smoothly into view when activeTab changes
  useEffect(() => {
    const targetButton = tabButtonRefs.current[activeTab];
    if (targetButton && containerRef.current) {
      targetButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  const slide = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const distance = 280;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    setIsMouseDown(true);
    setDragStartX(e.pageX - el.offsetLeft);
    setDragScrollLeft(el.scrollLeft);
    setHasMoved(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    el.scrollLeft = dragScrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const isAmber = accentColor === 'amber';

  return (
    <div className="relative group/slider w-full">
      {/* Outer Slider Shell with Glassmorphism */}
      <div className="relative flex items-center bg-slate-100/80 dark:bg-[#0c0c12]/90 border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl p-1.5 shadow-sm backdrop-blur-md transition-all">
        
        {/* Left Slider Arrow Button */}
        <button
          type="button"
          onClick={() => slide('left')}
          disabled={!canScrollLeft}
          title="Scroll Left"
          aria-label="Scroll left"
          className={`relative z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs ${
            canScrollLeft
              ? isAmber
                ? 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 shadow-amber-500/10'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-vexo-red hover:bg-vexo-red hover:text-white hover:border-vexo-red shadow-red-500/10'
              : 'opacity-25 cursor-not-allowed text-slate-400 dark:text-zinc-600 bg-transparent border-transparent'
          }`}
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Left Fade Gradient Mask */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-10 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-slate-100 dark:from-[#0c0c12] to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Scrollable Tabs Track */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 flex items-center gap-1.5 overflow-x-auto px-2 py-0.5 select-none no-scrollbar scroll-smooth ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabButtonRefs.current[tab.id] = el;
                }}
                type="button"
                onClick={() => {
                  if (!hasMoved) {
                    onChangeTab(tab.id);
                  }
                }}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? isAmber
                      ? 'text-amber-500 dark:text-amber-400 font-extrabold'
                      : 'text-vexo-red dark:text-red-400 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-zinc-800/40'
                }`}
              >
                {/* Active Sliding Glowing Capsule */}
                {isActive && (
                  <motion.div
                    layoutId="activeCmsTabPill"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 32,
                    }}
                    className={`absolute inset-0 rounded-xl pointer-events-none ${
                      isAmber
                        ? 'bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 dark:border-amber-400/50 shadow-[0_0_16px_rgba(212,175,55,0.22)]'
                        : 'bg-red-500/15 dark:bg-red-500/20 border border-red-500/40 dark:border-red-400/50 shadow-[0_0_16px_rgba(224,0,0,0.22)]'
                    }`}
                  />
                )}

                {/* Tab Icon */}
                <div className="relative z-10">
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                </div>

                {/* Tab Label */}
                <span className="relative z-10 whitespace-nowrap tracking-wide">
                  {tab.label}
                </span>

                {/* Numeric Count Pill Badge */}
                {tab.count !== undefined && (
                  <span
                    className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-tight transition-colors ${
                      isActive
                        ? isAmber
                          ? 'bg-amber-500 text-black dark:bg-amber-400 dark:text-black shadow-xs'
                          : 'bg-vexo-red text-white shadow-xs'
                        : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Fade Gradient Mask */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-10 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-slate-100 dark:from-[#0c0c12] to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Right Slider Arrow Button */}
        <button
          type="button"
          onClick={() => slide('right')}
          disabled={!canScrollRight}
          title="Scroll Right"
          aria-label="Scroll right"
          className={`relative z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs ${
            canScrollRight
              ? isAmber
                ? 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 shadow-amber-500/10'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-vexo-red hover:bg-vexo-red hover:text-white hover:border-vexo-red shadow-red-500/10'
              : 'opacity-25 cursor-not-allowed text-slate-400 dark:text-zinc-600 bg-transparent border-transparent'
          }`}
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Unique Slider Track Progress Indicator */}
      <div className="relative w-full h-[3px] bg-slate-200/50 dark:bg-zinc-800/50 rounded-full mt-1.5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isAmber
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300'
              : 'bg-gradient-to-r from-vexo-red via-red-500 to-amber-500'
          }`}
          style={{ width: `${Math.max(12, scrollProgress)}%` }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        />
      </div>
    </div>
  );
};
