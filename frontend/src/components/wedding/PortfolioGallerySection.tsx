import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../ui/Container';
import { Camera, MapPin, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { PreWeddingGalleryItem } from '../../data/weddingData';

interface PortfolioGallerySectionProps {
  galleryItems?: PreWeddingGalleryItem[];
}

export const PortfolioGallerySection: React.FC<PortfolioGallerySectionProps> = ({ galleryItems = [] }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = ['All'];
    galleryItems.forEach((item) => {
      if (item.category && !cats.includes(item.category)) {
        cats.push(item.category);
      }
    });
    return cats;
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return galleryItems;
    return galleryItems.filter((item) => item.category === activeCategory);
  }, [galleryItems, activeCategory]);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && filteredItems.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && filteredItems.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  if (!galleryItems || galleryItems.length === 0) return null;

  return (
    <section id="portfolio-gallery" className="relative py-20 sm:py-28 bg-[#050508] text-white overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-vexo-red/5 blur-[160px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-xs font-mono font-bold tracking-widest uppercase mb-4"
          >
            <Camera className="w-3.5 h-3.5 text-vexo-red" />
            <span>FEATURED PORTFOLIO</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
          >
            STORIES MADE FOR <span className="text-vexo-red">THE LONG AFTER.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Timeless portraits, raw candid laughter, and heritage romance captured across the iconic palaces of Rajasthan and destination weddings pan-India.
          </motion.p>

          {/* Category Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-vexo-red text-white shadow-lg shadow-red-600/30 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                key={item.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                onClick={() => openLightbox(idx)}
                className="group relative h-[340px] sm:h-[380px] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-vexo-red/50 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-black/80"
              >
                {/* Image */}
                <img
                  src={item.imageUrl}
                  alt={item.title || item.couple}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white/90 border border-white/15">
                    {item.category}
                  </span>
                </div>

                {/* Expand Icon */}
                <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-vexo-red transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Couple & Location Info */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide mb-1 group-hover:text-vexo-red transition-colors line-clamp-1">
                    {item.couple || item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-lg"
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close Lightbox"
              className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous Image"
              className="absolute left-4 sm:left-8 z-50 p-3 rounded-full bg-white/10 hover:bg-vexo-red text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next Image"
              className="absolute right-4 sm:right-8 z-50 p-3 rounded-full bg-white/10 hover:bg-vexo-red text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Modal Image Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={filteredItems[lightboxIndex].imageUrl}
                alt={filteredItems[lightboxIndex].title || filteredItems[lightboxIndex].couple}
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
              />
              <div className="mt-4 text-center">
                <h4 className="text-lg font-bold text-white tracking-wide">
                  {filteredItems[lightboxIndex].couple}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-vexo-red" />
                  <span>{filteredItems[lightboxIndex].location}</span>
                  <span>•</span>
                  <span className="font-mono text-vexo-red">{filteredItems[lightboxIndex].category}</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PortfolioGallerySection;
