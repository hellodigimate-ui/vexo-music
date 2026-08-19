import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { Play, Music, ArrowRight } from 'lucide-react';

import { homepageApi } from '../../lib/api';
import { adminMockStore } from '../../admin/services/adminMockStore';

const formatHeadline = (headline?: string) => {
  if (!headline) return { h1: 'SONIC ARCHITECTURE', h2: 'FOR THE NEXT ERA' };
  const words = headline.trim().split(/\s+/);
  if (words.length > 2) {
    const mid = Math.ceil(words.length / 2);
    return {
      h1: words.slice(0, mid).join(' '),
      h2: words.slice(mid).join(' '),
    };
  }
  return { h1: headline, h2: '' };
};

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [homepageData, setHomepageData] = React.useState(() => {
    const initial = adminMockStore.getHomepage().data || {};
    const { h1, h2 } = formatHeadline(initial.heroHeadline);
    return {
      heroTagline: initial.heroTagline || 'Pioneering Original Soundscapes & Entertainment',
      heroHeadline1: h1,
      heroHeadline2: h2,
      heroSubtitle:
        initial.heroSubtitle ||
        'VEXO Music Entertainment is a global record label, high-end audio-visual production powerhouse, and artist development agency.',
      heroBgImage: initial.heroBgImage || initial.heroBgMedia || '',
      heroCtaText: initial.heroCtaText || 'EXPLORE RELEASES',
      heroCtaUrl: initial.heroCtaUrl || '/music',
      heroSecondaryCtaText: initial.heroSecondaryCtaText || 'STUDIO SERVICES',
      heroSecondaryCtaUrl: initial.heroSecondaryCtaUrl || '/services',
    };
  });

  React.useEffect(() => {
    let isMounted = true;
    homepageApi.getHomepage().then((res) => {
      if (!isMounted || !res.data) return;
      const data = res.data;
      const { h1, h2 } = formatHeadline(data.heroHeadline);

      setHomepageData({
        heroTagline: data.heroTagline || 'Pioneering Original Soundscapes & Entertainment',
        heroHeadline1: h1,
        heroHeadline2: h2,
        heroSubtitle:
          data.heroSubtitle ||
          'VEXO Music Entertainment is a global record label, high-end audio-visual production powerhouse, and artist development agency.',
        heroBgImage: data.heroBgImage || data.heroBgMedia || '',
        heroCtaText: data.heroCtaText || 'EXPLORE RELEASES',
        heroCtaUrl: data.heroCtaUrl || '/music',
        heroSecondaryCtaText: data.heroSecondaryCtaText || 'STUDIO SERVICES',
        heroSecondaryCtaUrl: data.heroSecondaryCtaUrl || '/services',
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Optimized GPU Animation variants
  const bgVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const lineVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="cinematic-dark relative min-h-[90vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#050505] pt-32 pb-12 sm:pb-16">
      {/* 1. Dynamic Animated Music Waves & Pulsing Ambient Glow */}
      <motion.div
        variants={bgVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
      >
        {/* Pitch Black Base */}
        <div className="absolute inset-0 bg-[#050505]" />

        {/* Optional Custom Background Media Layer */}
        {homepageData.heroBgImage && (
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src={homepageData.heroBgImage}
              alt="Hero Background"
              className="w-full h-full object-cover brightness-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/90" />
          </div>
        )}

        {/* Pulsing Red Ambient Lighting Blobs */}
        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1, 1.15, 0.95, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-gradient-to-r from-vexo-red/35 to-red-900/20 rounded-full blur-[150px] pointer-events-none"
        />

        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1, 1.25, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-vexo-red-bright/20 rounded-full blur-[160px] pointer-events-none"
        />

        {/* Fluid 60fps Animated Audio Waves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-60 text-vexo-red"
          viewBox="0 0 1440 800"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Animated Wave 1 - Main Rhythmic Undulation */}
          <motion.path
            animate={{
              d: shouldReduceMotion
                ? 'M-100,400 C200,200 400,600 720,350 C1040,100 1240,500 1540,300'
                : [
                  'M-100,400 C200,180 400,620 720,330 C1040,80 1240,520 1540,280',
                  'M-100,350 C250,550 450,220 720,450 C990,620 1290,180 1540,380',
                  'M-100,430 C180,280 420,500 720,290 C1020,120 1200,440 1540,320',
                  'M-100,400 C200,180 400,620 720,330 C1040,80 1240,520 1540,280',
                ],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            stroke="url(#animated-red-wave-1)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Animated Wave 2 - Counter-Phase Deep Bass Curve */}
          <motion.path
            animate={{
              d: shouldReduceMotion
                ? 'M-100,450 C150,550 450,250 720,420 C990,590 1290,200 1540,450'
                : [
                  'M-100,450 C150,550 450,250 720,420 C990,590 1290,200 1540,450',
                  'M-100,480 C220,320 480,580 720,350 C960,180 1250,480 1540,400',
                  'M-100,400 C180,480 420,300 720,480 C1020,300 1200,550 1540,320',
                  'M-100,450 C150,550 450,250 720,420 C990,590 1290,200 1540,450',
                ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            stroke="url(#animated-red-wave-2)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Animated Wave 3 - Treble High Frequency Wave */}
          <motion.path
            animate={{
              d: shouldReduceMotion
                ? 'M-100,300 C300,500 500,200 720,380 C940,560 1140,250 1540,380'
                : [
                  'M-100,300 C300,500 500,200 720,380 C940,560 1140,250 1540,380',
                  'M-100,360 C240,280 520,450 720,260 C920,480 1180,320 1540,420',
                  'M-100,280 C320,420 480,250 720,410 C960,350 1100,200 1540,340',
                  'M-100,300 C300,500 500,200 720,380 C940,560 1140,250 1540,380',
                ],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            stroke="url(#animated-red-wave-1)"
            strokeWidth="1.8"
            strokeDasharray="8 6"
          />

          <defs>
            <linearGradient id="animated-red-wave-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E00000" stopOpacity="0.05" />
              <stop offset="35%" stopColor="#FF1111" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#FF7B7B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#E00000" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="animated-red-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8A0000" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#E00000" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FF1111" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Top & Bottom Soft Gradient Voids */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#050505] via-[#050505]/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent" />
      </motion.div>

      {/* 2. Hero Content Container */}
      <Container className="relative z-10 text-center flex flex-col items-center my-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Brand Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-vexo-red/10 text-vexo-red border border-vexo-red/30">
              <Music className="w-3.5 h-3.5 text-vexo-red animate-pulse" />
              {homepageData.heroTagline}
            </span>
          </motion.div>

          {/* Headline Line-by-Line Reveal */}
          <div className="overflow-hidden mb-6 max-w-5xl">
            <motion.h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.95] flex flex-col items-center select-none text-balance break-normal text-center">
              <motion.span variants={lineVariants} className="block break-normal">
                {homepageData.heroHeadline1}
              </motion.span>
              {homepageData.heroHeadline2 && (
                <motion.span
                  variants={lineVariants}
                  className="block text-vexo-red break-normal"
                >
                  {homepageData.heroHeadline2}
                </motion.span>
              )}
            </motion.h1>
          </div>

          {/* Subtitle Description */}
          <motion.p
            variants={itemVariants}
            className="text-zinc-400 text-base sm:text-lg lg:text-xl max-w-2xl font-normal leading-relaxed mb-10 text-balance"
          >
            {homepageData.heroSubtitle}
          </motion.p>

          {/* Action CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(homepageData.heroCtaUrl)}
              leftIcon={<Play className="w-4 h-4 fill-white" />}
              className="w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase rounded-xl shadow-md shadow-red-950/50 hover:scale-105 transition-all duration-300"
            >
              {homepageData.heroCtaText}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(homepageData.heroSecondaryCtaUrl)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto px-9 py-4 text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded-xl bg-neutral-950/80 backdrop-blur-md border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              {homepageData.heroSecondaryCtaText}
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      {/* 3. Non-Overlapping Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-2.5 mt-10 sm:mt-14 cursor-pointer select-none"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight * 0.88,
            behavior: 'smooth',
          });
        }}
      >
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-vexo-muted hover:text-white transition-colors">
          SCROLL TO EXPLORE ↓
        </span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-center justify-center p-1 backdrop-blur-sm hover:border-vexo-red/60 transition-colors">
          <motion.div
            animate={{ y: shouldReduceMotion ? 0 : [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-vexo-red-bright shadow-[0_0_10px_rgba(255,17,17,0.9)]"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
