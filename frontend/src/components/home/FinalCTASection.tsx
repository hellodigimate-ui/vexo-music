import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import { homepageApi } from '../../lib/api';
import { Skeleton } from '../ui/Skeleton';

export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [ctaData, setCtaData] = useState<{
    badge: string;
    heading: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    homepageApi.getHomepage().then((res) => {
      if (!isMounted || !res.data) return;
      const data = res.data;
      setCtaData({
        badge: data.finalCtaBadge || 'READY TO COLLABORATE?',
        heading: data.finalCtaHeading || "LET'S CREATE SOMETHING ICONIC.",
        description:
          data.finalCtaDescription ||
          'Ready to bring your sonic or visual project to life? Collaborate with our team of elite sound engineers, music directors, and producers.',
        buttonLabel: data.finalCtaButtonLabel || 'START A PROJECT',
        buttonUrl: data.finalCtaButtonUrl || '/contact',
        secondaryLabel: data.finalCtaSecondaryLabel || 'CONTACT VEXO',
        secondaryUrl: data.finalCtaSecondaryUrl || '/contact',
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!ctaData) {
    return (
      <section className="relative bg-slate-50 dark:bg-[#050505] py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-slate-200 dark:border-white/10 select-none transition-colors duration-300">
        <Container className="relative z-10 text-center flex flex-col items-center">
          <Skeleton className="h-7 w-48 rounded-full mb-6" />
          <div className="flex flex-col items-center gap-3 mb-6 w-full">
            <Skeleton className="h-12 sm:h-20 w-3/4 max-w-xl rounded-2xl" />
            <Skeleton className="h-12 sm:h-20 w-1/2 max-w-md rounded-2xl" />
          </div>
          <Skeleton className="h-5 w-4/5 max-w-lg rounded-md mb-10" />
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Skeleton className="h-14 w-44 rounded-xl" />
            <Skeleton className="h-14 w-44 rounded-xl" />
          </div>
        </Container>
      </section>
    );
  }

  // Format heading into 3 lines for high-impact typography
  const words = ctaData.heading.split(' ');
  let line1 = "LET'S CREATE";
  let line2 = 'SOMETHING';
  let line3 = 'ICONIC.';

  if (words.length >= 3) {
    line1 = words.slice(0, Math.ceil(words.length / 3)).join(' ');
    line2 = words.slice(Math.ceil(words.length / 3), Math.ceil((words.length * 2) / 3)).join(' ');
    line3 = words.slice(Math.ceil((words.length * 2) / 3)).join(' ');
  } else if (words.length === 2) {
    line1 = words[0];
    line2 = words[1];
    line3 = '';
  } else {
    line1 = ctaData.heading;
    line2 = '';
    line3 = '';
  }

  return (
    <section className="relative bg-slate-50 dark:bg-[#050505] py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-slate-200 dark:border-white/10 select-none transition-colors duration-300">
      {/* Ambient Red Glow Backdrops */}
      <motion.div
        animate={{
          scale: shouldReduceMotion ? 1 : [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-vexo-red/10 dark:bg-vexo-red/25 rounded-full blur-[160px] pointer-events-none"
      />

      <div className="absolute top-0 right-0 w-96 h-96 bg-vexo-red-bright/5 dark:bg-vexo-red-bright/10 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10 text-center flex flex-col items-center">
        {/* Top Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-[0.25em] bg-red-50 dark:bg-vexo-red/10 text-vexo-red dark:text-white border border-red-200 dark:border-vexo-red/40 shadow-sm dark:shadow-[0_0_20px_rgba(224,0,0,0.3)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-vexo-red-bright shadow-[0_0_8px_#FF1111] animate-pulse" />
            {ctaData.badge}
          </span>
        </div>

        {/* Large Iconic Headline */}
        <h2 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tight leading-[0.92] mb-6 text-center">
          <span className="block text-slate-950 dark:text-white">{line1}</span>
          {line2 && (
            <span className="block bg-gradient-to-r from-vexo-red to-vexo-red-bright bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(224,0,0,0.35)]">
              {line2}
            </span>
          )}
          {line3 && <span className="block text-slate-950 dark:text-white">{line3}</span>}
        </h2>

        {ctaData.description && (
          <p className="text-slate-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl text-center mb-10 leading-relaxed font-normal">
            {ctaData.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(ctaData.buttonUrl)}
            rightIcon={<ArrowUpRight className="w-5 h-5 text-white" />}
            className="w-full sm:w-auto px-9 py-4 text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded-xl shadow-[0_0_30px_rgba(224,0,0,0.6)] hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {ctaData.buttonLabel}
          </Button>

          <button
            type="button"
            onClick={() => navigate(ctaData.secondaryUrl)}
            className="w-full sm:w-auto px-9 py-4 text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer bg-white text-slate-900 border border-slate-300 shadow-md hover:bg-slate-100 hover:border-slate-400 dark:bg-neutral-900/80 dark:text-white dark:border-white/15 dark:hover:bg-white/10 dark:hover:border-white/30 dark:shadow-none backdrop-blur-md"
          >
            <Mail className="w-4 h-4 text-vexo-red-bright shrink-0" />
            <span className="text-slate-900 dark:text-white">{ctaData.secondaryLabel}</span>
          </button>
        </div>
      </Container>
    </section>
  );
};

export default FinalCTASection;
