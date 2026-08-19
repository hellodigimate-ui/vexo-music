import React, { useState, useEffect } from 'react';
import { PageSection } from '../components/ui/PageSection';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { AnimatedHeroBackground } from '../components/ui/AnimatedHeroBackground';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Disc3,
  CheckCircle2,
  Music,
  Video,
  Users,
  Radio,
  TrendingUp,
  Sparkles,
  Camera,
  Mic2,
  Headphones,
  Layers,
  Flame,
  Award,
  Heart,
  Shield,
  Globe,
  Zap,
  Sliders,
} from 'lucide-react';
import { servicesApi } from '../lib/api';
import type { ServiceItem } from '../types/service';

const ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  music: Music,
  video: Video,
  users: Users,
  radio: Radio,
  trendingup: TrendingUp,
  sparkles: Sparkles,
  camera: Camera,
  disc3: Disc3,
  mic2: Mic2,
  headphones: Headphones,
  layers: Layers,
  flame: Flame,
  award: Award,
  heart: Heart,
  shield: Shield,
  globe: Globe,
  zap: Zap,
  sliders: Sliders,
};

const getServiceIcon = (iconName?: string) => {
  if (!iconName) return Music;
  const key = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return ICONS_MAP[key] || Music;
};

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    servicesApi
      .getServicesList()
      .then((res) => {
        if (isMounted && res.data) {
          // Sort by display order
          const sorted = [...res.data].sort((a, b) => (a.order || 0) - (b.order || 0));
          setServices(sorted);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-[#050505] text-white pb-24 selection:bg-vexo-red selection:text-white">
      {/* 1. HERO HEADER SECTION WITH CINEMATIC STUDIO PHOTO BACKGROUND */}
      <div className="relative pt-20 pb-28 border-b border-white/10 overflow-hidden bg-[#050505]">
        <AnimatedHeroBackground bgImage="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=2000&q=80" />

        <Container size="md" className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Animated Glow Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-vexo-red/15 text-vexo-red-bright border border-vexo-red/35 shadow-[0_0_25px_rgba(224,0,0,0.4)] mb-6 animate-pulse">
            <Disc3 className="w-3.5 h-3.5" /> PRODUCTION & MEDIA SUITE
          </div>

          {/* BOLD DISPLAY TITLE */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-[0.08em] text-white mb-6 leading-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.95)]">
            OUR CAPABILITIES
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-100 font-medium leading-relaxed max-w-2xl mx-auto tracking-wide mb-8 drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)]">
            Premium execution for visionary artists and brands. From raw audio engineering to cinematic visual storytelling, we craft immersive entertainment experiences.
          </p>

          {/* Quick Capabilities Metrics Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-mono text-neutral-300 shadow-inner">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-vexo-red shadow-[0_0_8px_#FF1111]" />
              <strong className="text-white">{services.length} ACTIVE SERVICES</strong>
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="flex items-center gap-2">
              <strong className="text-white">ANALOG SSL CONSOLE</strong>
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="flex items-center gap-2">
              <strong className="text-white">DOLBY ATMOS MASTERING</strong>
            </span>
          </div>
        </Container>
      </div>

      {/* 2. ALTERNATING CAPABILITIES EDITORIAL LIST */}
      <PageSection padding="lg">
        <Container size="lg" className="max-w-6xl mx-auto flex flex-col gap-24 sm:gap-32">
          {isLoading ? (
            <div className="py-24 text-center text-xs font-mono text-zinc-500 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-vexo-red border-t-transparent rounded-full animate-spin" />
              <span>LOADING CAPABILITIES SUITE...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="py-20 text-center text-zinc-500">
              <p className="text-sm">No services are currently published.</p>
            </div>
          ) : (
            services.map((item, index) => {
              const isEven = index % 2 === 0;
              const number =
                item.number || (index + 1 < 10 ? `0${index + 1}` : `${index + 1}`);
              const ctaText = item.ctaText || (isEven ? 'INITIATE PROJECT' : 'BOOK SERVICE');
              const IconComponent = getServiceIcon(item.icon);

              return (
                <div
                  key={item.id || item.slug || item.number}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center group"
                >
                  {/* Content Column */}
                  <div
                    className={`lg:col-span-6 flex flex-col justify-center ${
                      !isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    {/* Header Row: Sequence Number + Category Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl sm:text-4xl font-mono font-black text-neutral-600 tracking-widest block select-none">
                        {number}
                      </span>
                      {item.category && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                          <IconComponent className="w-3.5 h-3.5 text-vexo-red" />
                          <span>{item.category}</span>
                        </div>
                      )}
                    </div>

                    {/* Bold Uppercase Title */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white mb-4 leading-tight group-hover:text-vexo-red-bright transition-colors duration-300">
                      {item.title}
                    </h2>

                    {/* Editorial Description */}
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed tracking-wide mb-6 max-w-xl font-normal">
                      {item.fullDesc || item.shortDesc}
                    </p>

                    {/* Key Features List */}
                    {item.features && item.features.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 max-w-xl">
                        {item.features.map((feat, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center gap-2 text-xs font-mono text-zinc-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {isEven ? (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() =>
                            navigate(`/contact?service=${encodeURIComponent(item.title)}`)
                          }
                          rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                          className="font-bold text-xs uppercase tracking-widest px-7 py-3.5 bg-gradient-to-r from-[#FF4D4D] to-[#E00000] text-white hover:shadow-[0_0_30px_rgba(255,77,77,0.5)] transition-all duration-300 border-none rounded-sm"
                        >
                          {ctaText}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() =>
                            navigate(`/contact?service=${encodeURIComponent(item.title)}`)
                          }
                          rightIcon={<ArrowUpRight className="w-4 h-4 ml-1" />}
                          className="font-bold text-xs uppercase tracking-widest px-7 py-3.5 bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white transition-all duration-300 rounded-sm"
                        >
                          {ctaText}
                        </Button>
                      )}
                      {item.pricingRange && (
                        <span className="text-xs font-mono text-zinc-400 sm:ml-2">
                          {item.pricingRange}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Framed Cinematic Image Column */}
                  <div
                    className={`lg:col-span-6 ${
                      !isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] group-hover:border-vexo-red/40 transition-all duration-500 bg-neutral-950">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 contrast-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </Container>
      </PageSection>
    </div>
  );
};

export default ServicesPage;
