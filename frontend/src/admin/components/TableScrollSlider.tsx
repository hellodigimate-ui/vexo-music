import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface TableScrollSliderProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export const TableScrollSlider: React.FC<TableScrollSliderProps> = ({
  scrollRef,
  className = '',
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setCanScroll(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 6) {
      setCanScroll(true);
      const progress = (el.scrollLeft / maxScroll) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    } else {
      setCanScroll(false);
    }
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 6) {
        const progress = (el.scrollLeft / maxScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    // Re-check after layout shifts or images loading
    const timer = setTimeout(checkScroll, 350);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [scrollRef, checkScroll]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setScrollProgress(val);
    const el = scrollRef.current;
    if (el) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      el.scrollLeft = (val / 100) * maxScroll;
    }
  };

  const handleScrollStep = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(160, el.clientWidth * 0.4);
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  if (!canScroll) return null;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-3 sm:px-4 py-2 bg-slate-50/95 dark:bg-[#121218]/95 border-t border-slate-200 dark:border-zinc-800 select-none ${className}`}
    >
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => handleScrollStep('left')}
        disabled={scrollProgress <= 0.5}
        className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-vexo-red disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs shrink-0"
        title="Slide Table Left"
        aria-label="Slide Table Left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Interactive Draggable Range Slider Track */}
      <div className="flex-1 flex items-center gap-2.5 min-w-0">
        <div className="hidden xs:flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-zinc-400 whitespace-nowrap shrink-0">
          <SlidersHorizontal className="w-3 h-3 text-vexo-red" />
          <span>Slide Table:</span>
        </div>

        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(scrollProgress)}
            onChange={handleSliderChange}
            aria-label="Table horizontal slider"
            className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-vexo-red focus:outline-none focus:ring-1 focus:ring-vexo-red"
          />
        </div>

        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 whitespace-nowrap shrink-0 w-8 text-right">
          {Math.round(scrollProgress)}%
        </span>
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => handleScrollStep('right')}
        disabled={scrollProgress >= 99.5}
        className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-vexo-red disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs shrink-0"
        title="Slide Table Right"
        aria-label="Slide Table Right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TableScrollSlider;
