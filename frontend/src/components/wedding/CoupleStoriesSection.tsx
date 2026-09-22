import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Heart, MapPin } from 'lucide-react';
import type { PreWeddingCoupleStory } from '../../data/weddingData';

interface CoupleStoriesSectionProps {
  coupleStories?: PreWeddingCoupleStory[];
}

export const CoupleStoriesSection: React.FC<CoupleStoriesSectionProps> = ({ coupleStories = [] }) => {
  if (!coupleStories || coupleStories.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 bg-[#050508] text-white overflow-hidden">
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
            <Heart className="w-3.5 h-3.5 text-vexo-red fill-vexo-red" />
            <span>REAL COUPLES • REAL MEMORIES</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
          >
            A QUICK PREVIEW OF <span className="text-vexo-red">COUPLE STORIES</span> BEFORE THE BIG DAY.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Unfiltered romance, quiet smiles, and royal backgrounds that set the stage for your wedding celebrations.
          </motion.p>
        </div>

        {/* 3 Story Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {coupleStories.map((story, idx) => (
            <motion.div
              key={story.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="group relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-vexo-red/50 transition-all duration-500 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-black"
            >
              {/* Image with gradient */}
              <div className="relative h-[280px] sm:h-[320px] overflow-hidden">
                <img
                  src={story.imageUrl}
                  alt={story.couple}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09080e] via-transparent to-transparent" />
                
                {/* Location Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-zinc-300 border border-white/10 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-vexo-red" />
                    {story.location}
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 sm:p-7 bg-[#09080e] flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2 group-hover:text-vexo-red transition-colors">
                    {story.couple}
                  </h3>
                  <p className="text-xs font-mono text-vexo-red uppercase tracking-wider mb-3">
                    {story.title}
                  </p>
                  <p
                    className="text-sm text-zinc-300 italic font-serif leading-relaxed"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-[11px] text-zinc-400">PRE-WEDDING MEMORY</span>
                  <span className="text-vexo-red font-mono font-bold">VEXO FRAMES</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default CoupleStoriesSection;
