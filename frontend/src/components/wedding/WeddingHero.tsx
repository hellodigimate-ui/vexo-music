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
  tagline?: string;
  headline?: React.ReactNode;
  subHeadlineHindi?: string;
  storyBadgeText?: string;
  exploreText?: string;
  exploreIcon?: React.ReactNode;
  featurePills?: Array<{ icon?: React.ReactNode; text: string }>;
  bgImage?: string;
}

export const WeddingHero: React.FC<WeddingHeroProps> = ({
  studioInfo = WEDDING_STUDIO_INFO,
  heroStats,
  onExplorePackages,
  onBookDate,
  tagline,
  headline,
  subHeadlineHindi,
  storyBadgeText,
  exploreText,
  exploreIcon,
  featurePills,
  bgImage: customBgImage,
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
    } else if (!scrollToSection('pre-wedding-packages') && !scrollToSection('wedding-plans')) {
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
    customBgImage ||
    studioInfo?.heroBgImage ||
    WEDDING_STUDIO_INFO.heroBgImage ||
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2000&q=85';
  const resolvedBgImage = getMediaUrl(rawBg);

  // Statistics: use heroStats if provided with data, otherwise fall back to WEDDING_STUDIO_INFO.stats
  const statsList =
    heroStats && heroStats.length > 0
      ? heroStats.map((s: any) => ({
          value: s.number || s.value || '01',
          label: s.title || s.label || '',
        }))
      : WEDDING_STUDIO_INFO.stats;

  const numStats = statsList.length;
  const gridColsClass =
    numStats === 3
      ? 'grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x'
      : numStats === 2
      ? 'grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x'
      : numStats === 1
      ? 'grid-cols-1'
      : 'grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x';

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#050508] pt-24 sm:pt-28 pb-0 text-white">
      {/* 1. Cinematic Background Layer with Subtle Ken Burns & Vignette */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        {/* Background Image with Slow Ambient Motion & Opening Zoom */}
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: [1.12, 1.04, 1.08],
                  x: [0, -8, 0],
                }
          }
          transition={{
            opacity: { duration: 1.4, ease: 'easeOut' },
            scale: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${resolvedBgImage}')`,
            filter: 'brightness(0.55) contrast(1.08) saturate(1.15)',
          }}
        />

        {/* Deep Gradient Overlays & Gold Radial Halo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/50 to-[#050508]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gold opacity-50 pointer-events-none" />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18)_0%,transparent_70%)] pointer-events-none"
        />

        {/* Floating Golden Stardust Particles */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { top: '15%', left: '10%', size: 4, delay: 0, dur: 5 },
              { top: '25%', left: '85%', size: 6, delay: 1, dur: 6.5 },
              { top: '45%', left: '18%', size: 3, delay: 2, dur: 4.5 },
              { top: '60%', left: '80%', size: 5, delay: 0.5, dur: 6 },
              { top: '35%', left: '70%', size: 4, delay: 1.5, dur: 5.5 },
              { top: '75%', left: '25%', size: 5, delay: 2.5, dur: 7 },
              { top: '20%', left: '50%', size: 3, delay: 3, dur: 4 },
              { top: '70%', left: '60%', size: 4, delay: 1.2, dur: 5.2 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -25, 0],
                  x: [0, 10, 0],
                  opacity: [0.15, 0.8, 0.15],
                  scale: [0.9, 1.3, 0.9],
                }}
                transition={{
                  duration: pt.dur,
                  repeat: Infinity,
                  delay: pt.delay,
                  ease: 'easeInOut',
                }}
                className="absolute rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"
                style={{
                  top: pt.top,
                  left: pt.left,
                  width: `${pt.size}px`,
                  height: `${pt.size}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Hero Content Container */}
      <Container className="relative z-10 my-auto py-8">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Top Royal Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full gold-badge text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6 shadow-lg shadow-[#D4AF37]/15 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            <span>{tagline || studioInfo?.tagline || WEDDING_STUDIO_INFO.tagline}</span>
          </motion.div>

          {/* Main Royal Cinematic Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            {headline || (
              <>
                Your Story.{' '}
                <span className="text-gradient-gold italic font-normal">Our Frames.</span>{' '}
                Forever.
              </>
            )}
          </motion.h1>

          {/* Emotional Story Hook */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative px-6 py-4.5 rounded-2xl bg-white/[0.04] border border-vexo-red/30 backdrop-blur-md mb-8 max-w-2xl shadow-xl text-center group hover:border-vexo-red/50 transition-colors"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0A0A0E] border border-vexo-red/50 rounded-full text-[10px] font-semibold text-vexo-red tracking-wider uppercase flex items-center gap-1 shadow-md">
              <Heart className="w-2.5 h-2.5 fill-vexo-red text-vexo-red animate-pulse" /> {storyBadgeText || 'ROMANCE IN FRAMES'}
            </div>
            <p className="text-base sm:text-lg md:text-xl text-zinc-200 font-medium leading-relaxed italic">
              &ldquo;{subHeadlineHindi || studioInfo?.subHeadlineHindi || WEDDING_STUDIO_INFO.subHeadlineHindi}&rdquo;
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button
              size="lg"
              onClick={handleExplore}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-4 bg-vexo-red hover:bg-[#ff1a1a] text-white font-bold tracking-wider rounded-xl shadow-lg shadow-red-600/30 hover:scale-[1.03] active:scale-[0.98] hover:shadow-red-600/50 transition-all text-sm uppercase flex items-center justify-center gap-2 cursor-pointer font-mono group"
            >
              {exploreIcon || <Camera className="w-4 h-4" />}
              <span>{exploreText || 'EXPLORE PACKAGES'}</span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleBook}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 bg-black/50 backdrop-blur-md hover:bg-white/10 hover:border-vexo-red hover:scale-[1.03] active:scale-[0.98] text-white font-semibold tracking-wider text-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <Calendar className="w-4 h-4 text-vexo-red shrink-0" />
              <span>BOOK YOUR DATE</span>
            </Button>
          </motion.div>

          {/* Floating Feature Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.52 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-10 text-xs sm:text-sm text-zinc-400 font-medium"
          >
            {(featurePills || [
              { icon: <Film className="w-3.5 h-3.5 text-[#D4AF37]" />, text: 'Sony Cinema Rig (FX3 & FX6)' },
              { icon: <Award className="w-3.5 h-3.5 text-[#D4AF37]" />, text: 'Hollywood DaVinci Colour Grading' },
              { icon: <Play className="w-3.5 h-3.5 text-[#D4AF37]" />, text: 'Cinematic Storytelling' },
            ]).map((pill, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.06, y: -2 }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black/60 border border-white/10 hover:border-[#D4AF37]/50 shadow-xs cursor-default backdrop-blur-sm transition-colors"
              >
                {pill.icon}
                <span>{pill.text}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </Container>

      {/* Scroll Down Cue */}
      <div className="relative z-10 flex justify-center pb-5 pt-2">
        <motion.button
          type="button"
          onClick={() => {
            const el =
              document.getElementById('pre-wedding-packages') ||
              document.getElementById('wedding-plans') ||
              document.getElementById('packages');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 0.95, 0.45], y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 border border-[#D4AF37]/30 text-[11px] font-mono tracking-widest uppercase text-[#D4AF37] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] transition-all cursor-pointer group shadow-sm backdrop-blur-md"
        >
          <span>Scroll to explore</span>
          <ArrowDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
        </motion.button>
      </div>

      {/* 3. Hero Bottom Statistics Strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 border-t border-[#D4AF37]/25 bg-black/80 backdrop-blur-xl shadow-2xl"
      >
        <Container>
          <div className={`grid ${gridColsClass} divide-[#D4AF37]/15 py-5 sm:py-6`}>
            {statsList.map((stat: { value: string; label: string }, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75 + idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
                className="px-6 py-4 sm:py-2 text-center flex flex-col items-center justify-center group cursor-default transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/40 group-hover:bg-[#D4AF37] group-hover:scale-125 transition-all" />
                  <motion.span
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-gradient-gold font-serif inline-block tracking-tight"
                  >
                    {stat.value}
                  </motion.span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/40 group-hover:bg-[#D4AF37] group-hover:scale-125 transition-all" />
                </div>
                <span className="text-xs sm:text-sm text-zinc-300 font-semibold uppercase tracking-widest group-hover:text-white transition-colors">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </Container>
      </motion.div>
    </section>
  );
};

export default WeddingHero;
