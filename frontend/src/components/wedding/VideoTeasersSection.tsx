import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../ui/Container';
import { Play, Film, MapPin, Clock, X } from 'lucide-react';
import type { WeddingFilmItem } from '../../data/weddingData';

interface VideoTeasersSectionProps {
  videos?: WeddingFilmItem[];
}

export const VideoTeasersSection: React.FC<VideoTeasersSectionProps> = ({ videos = [] }) => {
  const [activeVideo, setActiveVideo] = useState<WeddingFilmItem | null>(null);

  if (!videos || videos.length === 0) return null;

  // Helper to extract YouTube embed ID
  const getEmbedUrl = (url: string) => {
    if (!url) return 'https://www.youtube-nocookie.com/embed/HcEcM5AtEZ8?autoplay=1';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    return url;
  };

  return (
    <section id="pre-wedding-videos" className="relative py-20 sm:py-28 bg-[#030305] text-white border-t border-white/5 overflow-hidden">
      {/* Red ambient glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-vexo-red/5 blur-[160px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-18">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-xs font-mono font-bold tracking-widest uppercase mb-4"
          >
            <Film className="w-3.5 h-3.5 text-vexo-red" />
            <span>CINEMATOGRAPHY REEL</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
          >
            PRE-WEDDING TEASERS & <span className="text-vexo-red">CINEMATIC HIGHLIGHTS.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            From intimate sunset vows to grand heritage forts, experience raw emotion directed with cinema finesse and DaVinci color grading.
          </motion.p>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id || idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => setActiveVideo(video)}
              className="group relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-vexo-red/60 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-black flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 group-hover:opacity-85 transition-opacity" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-vexo-red border border-vexo-red/30">
                    {video.category || 'CINEMATIC'}
                  </span>
                  {video.duration && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono text-zinc-300 bg-black/70 backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-vexo-red/90 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:scale-115 group-hover:bg-vexo-red transition-all duration-300">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                </div>

                {/* Tag pill bottom right if exists */}
                {video.tag && (
                  <div className="absolute bottom-4 right-4 pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-white/10 text-white backdrop-blur-md">
                      {video.tag}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold uppercase text-white group-hover:text-vexo-red transition-colors duration-200 line-clamp-1 mb-1.5">
                    {video.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-zinc-400 font-medium">
                    Couple: <span className="text-white">{video.couple}</span>
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <MapPin className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                    <span className="truncate">{video.location}</span>
                  </div>
                  <span className="text-vexo-red font-mono font-bold uppercase tracking-wider text-[11px] group-hover:underline shrink-0">
                    Watch Film →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>

      {/* Video Modal Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl overflow-hidden border border-vexo-red/30 shadow-2xl"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase">{activeVideo.title}</h3>
                  <p className="text-xs text-zinc-400">{activeVideo.couple} • {activeVideo.location}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  aria-label="Close Video Modal"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Iframe Container */}
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={getEmbedUrl(activeVideo.videoUrl)}
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

export default VideoTeasersSection;
