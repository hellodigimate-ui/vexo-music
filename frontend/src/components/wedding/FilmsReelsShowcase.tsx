import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../ui/Container';

import {
  FEATURED_WEDDING_FILMS,
  type WeddingFilmItem,
  WEDDING_STUDIO_INFO,
} from '../../data/weddingData';
import {
  Play,
  Film,
  MapPin,
  Clock,

  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { InstagramIcon } from '../common/InstagramIcon';

type FilterCategory = 'All' | 'Cinematic Film' | 'Pre-Wedding' | 'Instagram Reel';

export interface FilmsReelsShowcaseProps {
  videos?: WeddingFilmItem[];
  defaultCategory?: FilterCategory;
}

export const FilmsReelsShowcase: React.FC<FilmsReelsShowcaseProps> = ({
  videos,
  defaultCategory = 'All',
}) => {
  const [activeTab, setActiveTab] = useState<FilterCategory>(defaultCategory);
  const [activeVideo, setActiveVideo] = useState<WeddingFilmItem | null>(null);

  const allFilms = videos && videos.length > 0 ? videos : FEATURED_WEDDING_FILMS;

  const filteredFilms = useMemo(() => {
    if (activeTab === 'All') return allFilms;
    return allFilms.filter(
      (item: WeddingFilmItem) => item.category === activeTab
    );
  }, [activeTab, allFilms]);

  const tabs: FilterCategory[] = ['All', 'Cinematic Film', 'Pre-Wedding', 'Instagram Reel'];

  return (
    <section id="films-and-reels" className="relative py-24 bg-[#07070b] overflow-hidden text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-4"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>PORTFOLIO SHOWCASE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight"
          >
            FILMS & <span className="text-amber-400">REELS</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Every love story is unique. Experience some of our favorite weddings, pre-weddings, and trending viral reels crafted across India.
          </motion.p>
        </div>

        {/* Filter Tabs with Animated Sliding Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {tabs.map((tab: FilterCategory) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'text-black font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilmTabPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-amber-400 rounded-full shadow-md shadow-amber-400/30"
                  />
                )}
                <span className="relative z-10">
                  {tab === 'Instagram Reel' ? (
                    <span className="flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5" />
                      Instagram Reels
                    </span>
                  ) : (
                    tab
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Films Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredFilms.map((film: WeddingFilmItem, idx: number) => {
            const isReel = film.aspectRatio === '9:16';

            return (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                onClick={() => setActiveVideo(film)}
                className="group relative rounded-2xl overflow-hidden bg-[#111018] border border-white/10 hover:border-amber-400/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-black/70 flex flex-col"
              >
                {/* Thumbnail Container */}
                <div
                  className={`relative overflow-hidden ${isReel ? 'aspect-[4/5] sm:aspect-[3/4]' : 'aspect-video'
                    }`}
                >
                  <img
                    src={film.thumbnailUrl}
                    alt={film.title}
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Category & Duration Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30">
                      {film.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-gray-200 bg-black/60 backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {film.duration}
                    </span>
                  </div>

                  {/* Centered Play Button with Ripple Glow Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative w-14 h-14 rounded-full bg-amber-400/90 text-black flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-115 group-hover:bg-amber-400 transition-all duration-300">
                        <Play className="w-6 h-6 fill-black ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Views counter if present */}
                  {film.views && (
                    <div className="absolute bottom-3 left-3.5 flex items-center gap-1 text-[11px] font-medium text-white/80 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>{film.views}</span>
                    </div>
                  )}
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-1 line-clamp-1">
                      {film.title}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium mb-2">
                      Couple: {film.couple}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1 truncate mr-2">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{film.location}</span>
                    </div>
                    <span className="text-[11px] text-amber-400 group-hover:underline shrink-0">
                      Watch Film →
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Instagram Profile CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-pink-500/10 via-[#13111b] to-amber-500/10 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg">
              <InstagramIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Follow {WEDDING_STUDIO_INFO.instagramHandle} on Instagram
              </h4>
              <p className="text-xs sm:text-sm text-gray-400">
                Daily behind-the-scenes, reel edits, outfit inspirations & couple teasers.
              </p>
            </div>
          </div>

          <a
            href={WEDDING_STUDIO_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 shrink-0 shadow-md cursor-pointer"
          >
            <span>Visit Instagram Profile</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </Container>

      {/* Video Modal Preview */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#111018] rounded-2xl overflow-hidden border border-amber-400/40 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0d0c13]">
                <div>
                  <h3 className="text-base font-bold text-white">{activeVideo.title}</h3>
                  <p className="text-xs text-amber-400">{activeVideo.couple} • {activeVideo.location}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoUrl.split('v=')[1] || 'HcEcM5AtEZ8'}?autoplay=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FilmsReelsShowcase;
