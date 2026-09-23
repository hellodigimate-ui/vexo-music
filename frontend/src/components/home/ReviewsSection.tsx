import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Check, Sparkles } from 'lucide-react';
import { PageSection } from '../ui/PageSection';
import { homepageApi } from '../../lib/api';
import type { ReviewItem } from '../../types';
import { Skeleton } from '../ui/Skeleton';

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    clientName: 'Rashmi Nishad',
    roleOrProject: 'Lead Vocalist • "Satane Lage Ho"',
    rating: 5,
    reviewText: 'Working with VEXO Music on "Satane Lage Ho" was a transformative experience. Their studio engineering, arrangement sensibilities, and dedication to visual storytelling elevated our folk release to international chart standards.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    category: 'Music Production',
    verified: true,
    date: 'August 2026',
  },
  {
    id: 'rev-2',
    clientName: 'Aarav & Simran Rathore',
    roleOrProject: 'Royal Pre-Wedding Shoot • Jaipur Forts',
    rating: 5,
    reviewText: 'The cinematic pre-wedding film produced by VEXO looked like a Bollywood period epic. From synchronized drone choreography over Nahargarh Fort to the original background score they composed for us, it was beyond our wildest dreams.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    category: 'Wedding & Film',
    verified: true,
    date: 'September 2026',
  },
  {
    id: 'rev-3',
    clientName: 'Vikramaditya Sen',
    roleOrProject: 'Executive Producer • Desert Storm Festival',
    rating: 5,
    reviewText: 'VEXO handled live audio engineering, multi-camera 4K visual feeds, and headline artist management for our 15,000-attendee festival with surgical precision. The sound was pristine and unforgettable.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    category: 'Artist Management',
    verified: true,
    date: 'July 2026',
  },
  {
    id: 'rev-4',
    clientName: 'Kabir & Meera Singhania',
    roleOrProject: 'Destination Pre-Wedding • Udaipur Lakes',
    rating: 5,
    reviewText: 'Their signature package was worth every rupee. The team took care of luxury logistics, custom styling, multi-camera 4K drone reels, and delivered the finished cut in record time. Every guest was mesmerized.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    category: 'Wedding & Film',
    verified: true,
    date: 'June 2026',
  },
  {
    id: 'rev-5',
    clientName: 'R Beer',
    roleOrProject: 'Singer-Songwriter • "Bhartar"',
    rating: 5,
    reviewText: 'The creative freedom and sonic power VEXO brings is unmatched. The production on "Bhartar" hit millions of streams within weeks. Their mixing, mastering, and global DSP distribution network are best-in-class.',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    category: 'Music Production',
    verified: true,
    date: 'August 2026',
  },
  {
    id: 'rev-6',
    clientName: 'Ananya Deshmukh',
    roleOrProject: 'Indie Artist • Debut EP Production',
    rating: 5,
    reviewText: 'As an independent musician, finding a team that respects your vision while providing world-class Dolby Atmos mastering and visualizer production is rare. VEXO is the definitive home for serious artists.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    category: 'Music Production',
    verified: true,
    date: 'May 2026',
  },
];

export const ReviewsSection: React.FC = () => {
  const [reviewsData, setReviewsData] = useState<{
    badge: string;
    heading: string;
    subtitle: string;
    reviews: ReviewItem[];
  } | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with live backend API
  useEffect(() => {
    let isMounted = true;
    homepageApi.getHomepage().then((res) => {
      if (!isMounted || !res.data) return;
      const d = res.data;
      setReviewsData({
        badge: d.reviewsBadge || 'TESTIMONIALS & TRUST',
        heading: d.reviewsHeading || 'VOICES OF EXCELLENCE',
        subtitle:
          d.reviewsSubtitle ||
          'What artists, visionary couples, and industry partners say about producing with VEXO.',
        reviews: Array.isArray(d.reviews) && d.reviews.length > 0 ? d.reviews : DEFAULT_REVIEWS,
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Responsive itemsPerPage calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalReviews = reviewsData?.reviews?.length ?? 0;
  const maxIndex = Math.max(0, totalReviews - itemsPerPage);

  // Clamp currentIndex when itemsPerPage changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  // Autoplay functionality with hover pause
  useEffect(() => {
    if (isPaused || totalReviews <= itemsPerPage) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, totalReviews, itemsPerPage, handleNext]);

  // Calculate slide offset percentage
  const offsetPercent = totalReviews > 0 ? (currentIndex * (100 / itemsPerPage)) : 0;

  // Helper for initials if avatar is not provided
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  if (!reviewsData) {
    return (
      <PageSection
        variant="bg"
        padding="xl"
        className="relative overflow-hidden bg-slate-50 dark:bg-black/80 transition-colors border-t border-slate-200 dark:border-white/5"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-4 max-w-2xl">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection
      variant="bg"
      padding="xl"
      className="relative overflow-hidden bg-slate-50 dark:bg-black/80 transition-colors border-t border-slate-200 dark:border-white/5"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-vexo-red/10 blur-[130px] rounded-full pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header with Title & Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/20 text-vexo-red text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{reviewsData.badge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
              {reviewsData.heading}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
              {reviewsData.subtitle}
            </p>
          </div>

          {/* Carousel Arrows & Indicator */}
          <div className="flex items-center gap-3 self-start md:self-end shrink-0">
            <span className="font-mono text-xs text-slate-500 dark:text-zinc-500 mr-2">
              <span className="text-slate-900 dark:text-white font-bold">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>{' '}
              / {String(maxIndex + 1).padStart(2, '0')}
            </span>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous review"
              className="w-11 h-11 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:text-white hover:bg-vexo-red hover:border-vexo-red shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next review"
              className="w-11 h-11 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:text-white hover:bg-vexo-red hover:border-vexo-red shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Slider Track Container */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="relative overflow-hidden py-2"
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: `translateX(-${offsetPercent}%)`,
            }}
          >
            {reviewsData.reviews.map((rev: ReviewItem, index: number) => {
              const rating = typeof rev.rating === 'number' ? rev.rating : 5;
              return (
                <div
                  key={rev.id || index}
                  className="px-2 sm:px-3 shrink-0"
                  style={{
                    width: `${100 / itemsPerPage}%`,
                  }}
                >
                  <div className="h-full rounded-3xl bg-white dark:bg-[#0c0c12]/90 border border-slate-200/90 dark:border-white/10 p-7 sm:p-8 shadow-md dark:shadow-2xl flex flex-col justify-between hover:border-vexo-red/50 hover:shadow-xl hover:shadow-red-950/15 transition-all duration-300 group relative">
                    {/* Top Row: 5 Stars & Category Pill */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>

                      {rev.category && (
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-400 border border-slate-200 dark:border-white/5">
                          {rev.category}
                        </span>
                      )}
                    </div>

                    {/* Quote Icon & Review Text */}
                    <div className="space-y-3 relative z-10 my-2 flex-1">
                      <Quote className="w-8 h-8 text-slate-200 dark:text-zinc-800 group-hover:text-vexo-red/30 transition-colors" />
                      <p className="text-slate-800 dark:text-zinc-200 text-sm sm:text-[15px] leading-relaxed italic font-normal">
                        "{rev.reviewText}"
                      </p>
                    </div>

                    {/* Bottom Row: Client Profile & Verified Badge */}
                    <div className="pt-6 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar / Initials */}
                        {rev.avatarUrl ? (
                          <img
                            src={rev.avatarUrl}
                            alt={rev.clientName}
                            className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-vexo-red/30 group-hover:ring-vexo-red transition-all"
                            onError={(e) => {
                              // If image fails to load, replace with initials badge
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-vexo-red to-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 ring-2 ring-white/10">
                            {getInitials(rev.clientName)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-950 dark:text-white truncate group-hover:text-vexo-red transition-colors">
                            {rev.clientName}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate font-mono mt-0.5">
                            {rev.roleOrProject}
                          </p>
                        </div>
                      </div>

                      {/* Verified Badge */}
                      {rev.verified && (
                        <div
                          className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/20"
                          title="Verified Client of VEXO Music"
                        >
                          <Check className="w-3 h-3" />
                          <span className="hidden sm:inline">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot Pagination Controls */}
        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-1 pt-1">
            {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className="p-1.5 bg-transparent border-0 outline-none cursor-pointer flex items-center justify-center group focus:outline-none"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    currentIndex === dotIdx
                      ? 'w-4 h-1.5 bg-vexo-red shadow-sm shadow-red-500/40'
                      : 'w-1.5 h-1.5 bg-slate-300 dark:bg-zinc-700 group-hover:bg-slate-400 dark:group-hover:bg-zinc-500'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </PageSection>
  );
};

export default ReviewsSection;
