import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { WEDDING_STUDIO_INFO } from '../../data/weddingData';
import { Sparkles, Calendar, Camera, Film, Play, ArrowDown, Award, Heart } from 'lucide-react';

export const WeddingHero: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            backgroundImage: `url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2000&q=85')`,
            filter: 'brightness(0.38) contrast(1.1) saturate(1.15)',
          }}
        />

        {/* Deep Gradient Overlays & Gold Radial Halo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-[#050508]/85" />
        <div className="absolute inset-0 bg-radial-gold opacity-60" />
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
            <span>{WEDDING_STUDIO_INFO.tagline}</span>
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
            className="relative px-6 py-4 rounded-2xl bg-white/[0.04] border border-[#D4AF37]/25 backdrop-blur-md mb-8 max-w-2xl shadow-xl text-center"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0A0A0E] border border-[#D4AF37]/30 rounded-full text-[10px] font-semibold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 fill-[#D4AF37]" /> FROM THE HEART
            </div>
            <p className="text-base sm:text-lg md:text-xl text-zinc-200 font-medium leading-relaxed">
              &ldquo;{WEDDING_STUDIO_INFO.subHeadlineHindi}&rdquo;
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
              onClick={() => scrollToSection('packages')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-bold tracking-wider rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:scale-[1.02] hover:shadow-[#D4AF37]/45 transition-all text-sm uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>EXPLORE PACKAGES</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection('book-date')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#D4AF37]/40 bg-black/40 backdrop-blur-md hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] text-white font-semibold tracking-wider text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
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
            {WEDDING_STUDIO_INFO.stats.map((stat: { value: string; label: string }, idx: number) => (
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
