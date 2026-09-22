import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Container } from '../ui/Container';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DEFAULT_WEDDING_DAY_STORIES,
  type WeddingDayStoriesData,
  type WeddingDayStoryItem,
} from '../../data/weddingData';
import { getMediaUrl } from '../../lib/utils';

export interface WeddingDayStoriesSectionProps {
  data?: WeddingDayStoriesData;
  onViewStories?: () => void;
}

export const WeddingDayStoriesSection: React.FC<WeddingDayStoriesSectionProps> = ({
  data,
  onViewStories,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [lightboxStory, setLightboxStory] = useState<WeddingDayStoryItem | null>(null);

  const config = data || DEFAULT_WEDDING_DAY_STORIES;
  const eyebrow = config.eyebrow || 'WEDDING DAY COVERAGE';
  const heading = config.heading || 'Wedding Day Stories';
  const supportingText =
    config.supportingText ||
    'Beyond the pre-wedding, we capture every emotion, ritual and celebration of your wedding day.';
  const quote = config.quote || 'Every moment deserves its frame.';
  const ctaText = config.ctaText || 'VIEW WEDDING STORIES →';

  const rawStories = config.stories && config.stories.length > 0
    ? config.stories
    : DEFAULT_WEDDING_DAY_STORIES.stories || [];

  // Identify featured dominant story and supporting items
  const featuredStory = rawStories.find((s) => s.featured) || rawStories[0];
  const supportingStories = rawStories.filter((s) => s.id !== featuredStory.id).slice(0, 3);

  const handleCta = () => {
    if (onViewStories) {
      onViewStories();
      return;
    }
    const el = document.getElementById('portfolio-gallery') || document.getElementById('portfolio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openLightbox = (story: WeddingDayStoryItem) => {
    setLightboxStory(story);
  };

  const closeLightbox = () => {
    setLightboxStory(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!lightboxStory) return;
    const allStories = [featuredStory, ...supportingStories];
    const currentIndex = allStories.findIndex((s) => s.id === lightboxStory.id);
    if (currentIndex === -1) return;

    if (direction === 'prev') {
      const nextIdx = (currentIndex - 1 + allStories.length) % allStories.length;
      setLightboxStory(allStories[nextIdx]);
    } else {
      const nextIdx = (currentIndex + 1) % allStories.length;
      setLightboxStory(allStories[nextIdx]);
    }
  };

  return (
    <section
      id="wedding-day-stories"
      className="relative py-20 sm:py-28 bg-[#050508] text-white overflow-hidden border-b border-white/5"
    >

      <Container className="relative z-10">
        {/* 2. Section Header with Royal Eyebrow & Serif Title */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-semibold tracking-widest uppercase mb-4 shadow-sm shadow-[#D4AF37]/5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{eyebrow}</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.15]"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            {heading.split(' ')[0]}{' '}
            <span className="text-gradient-gold italic font-normal">
              {heading.split(' ').slice(1).join(' ') || 'Stories'}
            </span>
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            {supportingText}
          </motion.p>
        </div>

        {/* 3. Premium Asymmetric Editorial Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Dominant Featured Story Card (Large Left Showcase) */}
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => openLightbox(featuredStory)}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-[0_0_35px_rgba(212,175,55,0.15)] flex flex-col justify-end min-h-[380px] sm:min-h-[440px] lg:min-h-[560px] md:col-span-2 lg:col-span-7"
          >
            {/* Background Image with Cinematic Slow Zoom & Contrast Boost on Hover */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out filter brightness-[0.90] contrast-[1.05] group-hover:brightness-100 group-hover:contrast-[1.10] group-hover:scale-105"
              style={{ backgroundImage: `url('${getMediaUrl(featuredStory.imageUrl)}')` }}
            />

            {/* Deep Vignette & Dark Luxury Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Top Bar Indicators */}
            <div className="relative z-10 p-5 sm:p-7 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-mono font-bold tracking-widest uppercase">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>{featuredStory.category}</span>
              </span>

              <div className="w-8 h-8 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-[#D4AF37] transition-all">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bottom Caption Area */}
            <div className="relative z-10 p-5 sm:p-7 mt-auto space-y-2">
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight group-hover:text-amber-100 transition-colors"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {featuredStory.title}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                {featuredStory.location && (
                  <span className="inline-flex items-center gap-1.5 text-[#D4AF37]">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{featuredStory.location}</span>
                  </span>
                )}
                {featuredStory.couple && (
                  <>
                    <span className="text-zinc-500">&bull;</span>
                    <span className="text-zinc-300 font-serif italic text-sm">
                      {featuredStory.couple}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3 Supporting Editorial Stories */}
          <div className="md:col-span-2 lg:col-span-5 flex flex-col gap-5 sm:gap-6">
            {/* Supporting Story 1 (Candid Moments - Wide Top) */}
            {supportingStories[0] && (
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => openLightbox(supportingStories[0])}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(212,175,55,0.12)] flex flex-col justify-end min-h-[250px] sm:min-h-[265px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out filter brightness-[0.88] contrast-[1.04] group-hover:brightness-100 group-hover:contrast-[1.08] group-hover:scale-105"
                  style={{ backgroundImage: `url('${getMediaUrl(supportingStories[0].imageUrl)}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase">
                    <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                    <span>{supportingStories[0].category}</span>
                  </span>
                  <div className="w-7 h-7 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-[#D4AF37] transition-all">
                    <Maximize2 className="w-3 h-3" />
                  </div>
                </div>

                <div className="relative z-10 p-5 mt-auto space-y-1">
                  <h4
                    className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-amber-100 transition-colors"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {supportingStories[0].title}
                  </h4>
                  {supportingStories[0].location && (
                    <div className="flex items-center gap-1.5 text-xs text-[#D4AF37]">
                      <MapPin className="w-3 h-3 text-[#D4AF37]" />
                      <span>{supportingStories[0].location}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Bottom Row: 2 Supporting Stories Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 flex-1">
              {supportingStories.slice(1, 3).map((story, sIdx) => (
                <motion.div
                  key={story.id || sIdx}
                  initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 + sIdx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => openLightbox(story)}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(212,175,55,0.12)] flex flex-col justify-end min-h-[250px] sm:min-h-[265px]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out filter brightness-[0.88] contrast-[1.04] group-hover:brightness-100 group-hover:contrast-[1.08] group-hover:scale-105"
                    style={{ backgroundImage: `url('${getMediaUrl(story.imageUrl)}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                  <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-mono font-semibold tracking-wider uppercase">
                      <span>{story.category}</span>
                    </span>
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-[#D4AF37] transition-all">
                      <Maximize2 className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="relative z-10 p-4 sm:p-5 mt-auto space-y-1">
                    <h4
                      className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-amber-100 transition-colors"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {story.title}
                    </h4>
                    {story.location && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 truncate">
                        <MapPin className="w-2.5 h-2.5 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{story.location}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Small Supporting Line Below Gallery */}
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12 sm:mt-14 mb-4"
        >
          <p
            className="text-sm sm:text-base font-serif italic text-zinc-400 tracking-wide inline-flex items-center justify-center gap-3 sm:gap-4"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            <span className="w-6 sm:w-10 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
            <span>&ldquo;{quote}&rdquo;</span>
            <span className="w-6 sm:w-10 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
          </p>
        </motion.div>

        {/* 5. Call to Action Button */}
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-4"
        >
          <a
            href="#portfolio-gallery"
            onClick={(e) => {
              e.preventDefault();
              handleCta();
            }}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-black/80 via-black/60 to-black/80 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/15 hover:scale-[1.02] cursor-pointer group"
          >
            <span>{ctaText.replace('→', '').trim()}</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </Container>

      {/* 6. Fullscreen Cinematic Lightbox Modal */}
      <AnimatePresence>
        {lightboxStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-5xl w-full rounded-2xl overflow-hidden bg-[#07070a] border border-[#D4AF37]/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 border border-white/20 text-white/80 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
                title="Close View"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev / Next Arrows */}
              <button
                onClick={(e) => navigateLightbox('prev', e)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/70 border border-white/20 text-white/80 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
                title="Previous Frame"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => navigateLightbox('next', e)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/70 border border-white/20 text-white/80 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
                title="Next Frame"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image Container */}
              <div className="relative aspect-[16/10] max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={getMediaUrl(lightboxStory.imageUrl)}
                  alt={lightboxStory.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Modal Caption Bar */}
              <div className="p-6 border-t border-[#D4AF37]/20 bg-[#08080c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-block text-[11px] font-mono font-semibold text-[#D4AF37] uppercase tracking-wider mb-1">
                    {lightboxStory.category}
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {lightboxStory.title}
                  </h3>
                  {lightboxStory.location && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{lightboxStory.location}</span>
                      {lightboxStory.couple && (
                        <>
                          <span className="text-zinc-600">&bull;</span>
                          <span className="italic font-serif text-zinc-300">
                            {lightboxStory.couple}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    closeLightbox();
                    handleCta();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37] border border-[#D4AF37]/40 text-[#D4AF37] hover:text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors shrink-0 cursor-pointer"
                >
                  Explore Portfolio
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default WeddingDayStoriesSection;
