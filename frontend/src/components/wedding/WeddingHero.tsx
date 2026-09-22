import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { WEDDING_STUDIO_INFO, type PreWeddingHeroStat } from '../../data/weddingData';
import { Sparkles, Calendar, Camera, Film, Play, ArrowDown, Award, Heart } from 'lucide-react';
import { getMediaUrl } from '../../lib/utils';

export interface WeddingHeroProps {
  studioInfo?: any;
  heroStats?: PreWeddingHeroStat[];
  onExplorePackages?: () => void;
  onBookDate?: () => void;
}

export const WeddingHero: React.FC<WeddingHeroProps> = ({
  studioInfo = WEDDING_STUDIO_INFO,
  heroStats,
  onExplorePackages,
  onBookDate,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const scrollToSection = (id: string): boolean => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return true;
    }
    return false;
  };

  const handleExplore = () => {
    if (onExplorePackages) {
      onExplorePackages();
    } else if (!scrollToSection('pre-wedding-packages')) {
      scrollToSection('packages');
    }
  };

  const handleBook = () => {
    if (onBookDate) {
      onBookDate();
    } else if (!scrollToSection('book-your-date')) {
      scrollToSection('book-date');
    }
  };

  // Dynamic Background Image from studioInfo, resolved through getMediaUrl
  const rawBg =
    studioInfo?.heroBgImage ||
    WEDDING_STUDIO_INFO.heroBgImage ||
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2000&q=85';
  const bgImage = getMediaUrl(rawBg);

  // Statistics: use heroStats if provided with data, otherwise fall back to WEDDING_STUDIO_INFO.stats
  const statsList =
    heroStats && heroStats.length > 0
      ? heroStats.map((s: any) => ({
          value: s.number || s.value || '01',
          label: s.title || s.label || '',
        }))
      : WEDDING_STUDIO_INFO.stats;

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#050508] pt-28 pb-14 text-white">
      {/* 1. Cinematic Background Layer with Subtle Ken Burns & Vignette */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        {/* Background Image with Slow Ambient Motion */}
        <motion.div
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.06, 1], x: [0, -10, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${bgImage}')`,
            filter: 'brightness(0.55) contrast(1.08) saturate(1.15)',
          }}
        />

        {/* Deep Gradient Overlays & Gold Radial Halo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/50 to-[#050508]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gold opacity-50 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[160px] pointer-events-none" />
      </div>

      {/* 2. Hero Content Container */}
      <Container className="relative z-10 my-auto py-8">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Top Royal Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full gold-badge text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6 shadow-lg shadow-[#D4AF37]/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{studioInfo?.tagline || WEDDING_STUDIO_INFO.tagline}</span>
          </motion.div>

          {/* Main Royal Cinematic Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            Your Story.{' '}
            <span className="text-gradient-gold italic font-normal">Our Frames.</span>{' '}
            Forever.
          </motion.h1>

          {/* Emotional Story Hook */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative px-6 py-4 rounded-2xl bg-white/[0.04] border border-vexo-red/30 backdrop-blur-md mb-8 max-w-2xl shadow-xl text-center"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0A0A0E] border border-vexo-red/50 rounded-full text-[10px] font-semibold text-vexo-red tracking-wider uppercase flex items-center gap-1 shadow-md">
              <Heart className="w-2.5 h-2.5 fill-vexo-red text-vexo-red" /> FROM THE HEART
            </div>
            <p className="text-base sm:text-lg md:text-xl text-zinc-200 font-medium leading-relaxed">
              &ldquo;{studioInfo?.subHeadlineHindi || WEDDING_STUDIO_INFO.subHeadlineHindi}&rdquo;
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button
              size="lg"
              onClick={handleExplore}
              className="w-full sm:w-auto px-8 py-4 bg-vexo-red hover:bg-[#ff1a1a] text-white font-bold tracking-wider rounded-xl shadow-lg shadow-red-600/30 hover:scale-[1.02] hover:shadow-red-600/50 transition-all text-sm uppercase flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <Camera className="w-4 h-4" />
              <span>EXPLORE PACKAGES</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleBook}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 bg-black/50 backdrop-blur-md hover:bg-white/10 hover:border-vexo-red text-white font-semibold tracking-wider text-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <Calendar className="w-4 h-4 text-vexo-red shrink-0" />
              <span>BOOK YOUR DATE</span>
            </Button>
          </motion.div>

          {/* Floating Feature Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-10 text-xs sm:text-sm text-zinc-400 font-medium"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
              <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Sony Cinema Rig (FX3 & FX6)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Hollywood DaVinci Colour Grading</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
              <Play className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Cinematic Storytelling</span>
            </div>
          </motion.div>

        </div>
      </Container>

      {/* 3. Hero Bottom Statistics Strip */}
      <div className="relative z-10 border-t border-[#D4AF37]/20 bg-black/60 backdrop-blur-xl">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#D4AF37]/15 py-6">
            {statsList.map((stat: { value: string; label: string }, idx: number) => (
              <div key={idx} className="px-4 py-3 sm:py-2 text-center flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gradient-gold font-serif">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-zinc-400 font-medium uppercase tracking-wider mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden lg:block opacity-60 hover:opacity-100 transition-opacity">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex flex-col items-center gap-1 text-[11px] text-[#D4AF37] uppercase tracking-widest"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </motion.div>
      </div>
    </section>
  );
};

export default WeddingHero;
