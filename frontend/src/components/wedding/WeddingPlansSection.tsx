import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '../ui/Container';
import { DEFAULT_WEDDING_PLANS, WEDDING_STUDIO_INFO } from '../../data/weddingData';
import type { PreWeddingPackage } from '../../data/weddingData';
import {
  Camera,
  Video,
  Film,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Crown,
  Share2,
  ArrowRight,
  Compass,
  Utensils,
} from 'lucide-react';

export interface WeddingPlansSectionProps {
  onSelectPackage?: (pkgId: string) => void;
  packages?: PreWeddingPackage[];
  whatsappNumber?: string;
}

export const WeddingPlansSection: React.FC<WeddingPlansSectionProps> = ({
  onSelectPackage,
  packages = DEFAULT_WEDDING_PLANS,
  whatsappNumber = WEDDING_STUDIO_INFO.whatsappNumber,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const handleBookPackage = (pkgId: string) => {
    if (onSelectPackage) {
      onSelectPackage(pkgId);
    } else {
      const el = document.getElementById('book-your-date') || document.getElementById('book-date');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShareWhatsApp = (pkg: PreWeddingPackage) => {
    const text =
      pkg.whatsappMessage ||
      `Hello VEXO Wedding Studio! I am interested in the ${pkg.name} (${pkg.priceDisplay || 'Wedding Plan'}). Please share available dates and detailed coverage itinerary.`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  // Ensure we have packages to display
  const plans = packages && packages.length > 0 ? packages : DEFAULT_WEDDING_PLANS;

  return (
    <section
      id="wedding-plans"
      className="relative py-20 sm:py-28 bg-[#050508] text-white overflow-hidden border-b border-white/5"
    >
      {/* Ambient Glass Glow Lighting Behind Cards (zero-cost hardware accelerated radial gradients) */}
      <div className="absolute top-1/4 -left-20 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(220,38,38,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(220,38,38,0.14)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />

      <Container className="relative z-10">
        {/* 1. Subtle Section Transition Divider */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center justify-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            <span className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <span>FROM THE FIRST LOOK TO THE FINAL RITUAL</span>
            <span className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>
        </div>

        {/* 2. Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-sm backdrop-blur-md"
          >
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>WEDDING DAY EXPERIENCES</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
          >
            WEDDING <span className="text-vexo-red">PLANS</span>
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Complete wedding-day photography and cinematography experiences, crafted to preserve every ritual, emotion and celebration.
          </motion.p>
        </div>

        {/* 3. 3-Card Responsive Grid (Essential, Signature, Royal) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((pkg: PreWeddingPackage, idx: number) => {
            // Check if card is highlighted (Signature Wedding or marked isPopular)
            const isFeatured = pkg.isPopular || pkg.id === 'wedding-signature';
            const displayPrice = pkg.priceDisplay || (pkg.priceINR ? `₹${pkg.priceINR.toLocaleString('en-IN')}` : 'Custom Quote');
            const hasRupee = displayPrice.startsWith('₹');
            const rupeeSymbol = hasRupee ? '₹' : '';
            const priceValue = hasRupee ? displayPrice.slice(1) : displayPrice;

            return (
              <motion.div
                key={pkg.id || idx}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.75, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={shouldReduceMotion ? undefined : { y: -8, transition: { duration: 0.25 } }}
                className={`relative flex flex-col transition-all duration-500 ${
                  isFeatured ? 'lg:-translate-y-3' : ''
                }`}
              >
                {/* Badge for Featured/Special Plan with subtle pulse */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <span
                      className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase shadow-xl ${
                        isFeatured
                          ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white border border-red-400/60 shadow-[0_0_25px_rgba(224,0,0,0.55)]'
                          : 'bg-zinc-900/95 text-zinc-300 border border-white/20 shadow-md backdrop-blur-md'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                      <span>{pkg.badge}</span>
                    </span>
                  </div>
                )}

                {/* Illuminated Glass Border Frame */}
                <div
                  className={`p-[1.5px] rounded-[28px] h-full transition-all duration-500 ${
                    isFeatured
                      ? 'bg-gradient-to-b from-red-500 via-red-600/40 to-white/5 shadow-[0_0_45px_rgba(224,0,0,0.22),0_20px_50px_rgba(0,0,0,0.9)] hover:shadow-[0_0_65px_rgba(224,0,0,0.4)] hover:from-red-400'
                      : 'bg-gradient-to-b from-white/25 via-white/10 to-white/[0.02] shadow-[0_20px_45px_rgba(0,0,0,0.7)] hover:from-white/40 hover:via-white/15'
                  }`}
                >
                  {/* Card Interior */}
                  <div
                    className={`relative rounded-[26.5px] overflow-hidden flex flex-col justify-between h-full backdrop-blur-3xl transition-all duration-500 ${
                      isFeatured
                        ? 'bg-gradient-to-b from-[#160608]/95 via-[#0b0304]/98 to-[#050507]'
                        : 'bg-gradient-to-b from-[#121217]/95 via-[#0a0a0d]/98 to-[#050507]'
                    }`}
                  >
                    {/* Top ambient glass sheen reflection */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />

                    {/* Featured ambient top flare */}
                    {isFeatured && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-52 h-36 bg-red-600/25 blur-3xl pointer-events-none" />
                    )}

                    <div className="p-7 sm:p-8 relative z-20">
                      {/* Plan Title & Short Description */}
                      <div className="text-center pt-2 mb-4">
                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wide mb-1.5 flex items-center justify-center gap-2">
                          <span className={isFeatured ? 'text-red-500' : 'text-zinc-400'}>✦</span>
                          <span className="text-white">{pkg.name}</span>
                        </h3>
                        <p className="text-xs text-zinc-400 font-normal min-h-[32px] flex items-center justify-center max-w-[260px] mx-auto leading-relaxed">
                          {pkg.tagline}
                        </p>
                      </div>

                      {/* Sleek Glass Pricing Showcase */}
                      <div
                        className={`relative my-6 py-5 px-6 rounded-2xl overflow-hidden text-center transition-all duration-300 ${
                          isFeatured
                            ? 'bg-gradient-to-b from-red-950/40 via-red-950/15 to-transparent border border-red-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]'
                            : 'bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                        }`}
                      >
                        {/* Delicate horizontal light edge */}
                        <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                        <div className="flex items-baseline justify-center gap-1.5 mb-1.5">
                          {rupeeSymbol && (
                            <span
                              className={`text-xl sm:text-2xl font-bold font-mono ${
                                isFeatured ? 'text-red-400' : 'text-zinc-400'
                              }`}
                            >
                              {rupeeSymbol}
                            </span>
                          )}
                          <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                            {priceValue}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-mono">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isFeatured ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'
                            }`}
                          />
                          <span>INCLUSIVE OF SHOOT & DELIVERABLES</span>
                        </div>
                      </div>

                      {/* Feature Lists */}
                      <div className="space-y-6 text-sm">
                        {/* Photography Features */}
                        {pkg.photography && (
                          <div>
                            <div className="flex items-center gap-2.5 mb-3">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isFeatured
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-white/[0.04] border-white/15 text-zinc-300'
                                }`}
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-200">
                                Photography
                              </span>
                            </div>
                            <ul className="space-y-2 pl-9 text-zinc-300 text-xs">
                              {(pkg.photography.details || []).map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className={isFeatured ? 'text-red-400 font-bold' : 'text-zinc-500 font-bold'}>•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Cinematography Features */}
                        {pkg.cinematography && (
                          <div>
                            <div className="flex items-center gap-2.5 mb-3">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isFeatured
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-white/[0.04] border-white/15 text-zinc-300'
                                }`}
                              >
                                <Video className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-200">
                                Cinematography
                              </span>
                            </div>
                            <ul className="space-y-2 pl-9 text-zinc-300 text-xs">
                              {(pkg.cinematography.details || []).map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className={isFeatured ? 'text-red-400 font-bold' : 'text-zinc-500 font-bold'}>•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Deliverables */}
                        {pkg.deliverables && pkg.deliverables.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2.5 mb-3">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isFeatured
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-white/[0.04] border-white/15 text-zinc-300'
                                }`}
                              >
                                <Film className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-200">
                                Deliverables
                              </span>
                            </div>
                            <ul className="space-y-2 pl-9 text-zinc-300 text-xs">
                              {pkg.deliverables.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle2
                                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                      isFeatured ? 'text-red-400' : 'text-zinc-400'
                                    }`}
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Food & Travel Payment Responsibility */}
                        {(pkg.foodTravel || 'Food, Travel — Paid By Client / Company') && (
                          <div
                            className={`py-2.5 px-3.5 rounded-xl flex items-center gap-2.5 text-xs transition-all ${
                              isFeatured
                                ? 'bg-red-500/[0.08] border border-red-500/25 text-zinc-200 shadow-[0_0_15px_rgba(224,0,0,0.1)]'
                                : 'bg-white/[0.04] border border-white/15 text-zinc-300'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                isFeatured ? 'bg-red-500/15 text-red-400' : 'bg-white/10 text-zinc-400'
                              }`}
                            >
                              <Utensils className="w-3 h-3" />
                            </div>
                            <span className="text-[11px] font-mono tracking-wide leading-snug font-medium">
                              {pkg.foodTravel || 'Food, Travel — Paid By Client / Company'}
                            </span>
                          </div>
                        )}

                        {/* Shoot Logistics (Days & Locations) */}
                        {pkg.shoot && (
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-zinc-300">
                              <Calendar className={`w-3.5 h-3.5 ${isFeatured ? 'text-red-400' : 'text-zinc-400'}`} />
                              <span>{pkg.shoot.days}</span>
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-zinc-300">
                              <MapPin className={`w-3.5 h-3.5 ${isFeatured ? 'text-red-400' : 'text-zinc-400'}`} />
                              <span>{pkg.shoot.locations}</span>
                            </span>
                          </div>
                        )}

                        {/* Optional Bonus Inclusions */}
                        {pkg.bonus && pkg.bonus.length > 0 && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/30 via-red-900/10 to-transparent border border-red-500/25 text-xs">
                            <span className="font-bold text-red-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5 font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-red-400" />
                              <span>★ Bonus Inclusions</span>
                            </span>
                            <ul className="space-y-1.5 text-zinc-300 pl-4">
                              {pkg.bonus.map((b: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Optional Platinum / Royal Inclusions */}
                        {pkg.platinumExperience && pkg.platinumExperience.length > 0 && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/[0.02] to-transparent border border-amber-500/25 text-xs">
                            <span className="font-bold text-amber-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5 font-mono">
                              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Royal VIP Experience</span>
                            </span>
                            <ul className="space-y-1.5 text-zinc-300 pl-4">
                              {pkg.platinumExperience.map((exp: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>{exp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="p-7 sm:p-8 pt-0 space-y-3 relative z-20">
                      <button
                        type="button"
                        onClick={() => handleBookPackage(pkg.id)}
                        className={`relative w-full py-4 px-6 rounded-xl font-bold tracking-wider text-xs sm:text-sm uppercase flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 cursor-pointer shadow-lg group ${
                          isFeatured
                            ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-[0_0_25px_rgba(224,0,0,0.4)] hover:shadow-[0_0_40px_rgba(224,0,0,0.65)] hover:brightness-110 active:scale-[0.98]'
                            : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/15 hover:border-white/35 text-white shadow-sm hover:shadow-md active:scale-[0.98]'
                        }`}
                      >
                        <span>{pkg.ctaText || `Choose ${pkg.name}`}</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(pkg)}
                        className="w-full py-2.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Inquire via WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default WeddingPlansSection;
