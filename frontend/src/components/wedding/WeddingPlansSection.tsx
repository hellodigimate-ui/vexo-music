import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-bold tracking-widest uppercase mb-4"
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

            return (
              <motion.div
                key={pkg.id || idx}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? 'bg-gradient-to-b from-[#180a0c] via-[#120708] to-[#0a0a0c] border-2 border-vexo-red shadow-[0_0_40px_rgba(224,0,0,0.22)] lg:-translate-y-3'
                    : 'bg-[#0c0c0f] border border-white/10 hover:border-vexo-red/40 hover:shadow-lg'
                }`}
              >
                {/* Badge for Featured/Special Plan */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg ${
                        isFeatured
                          ? 'bg-gradient-to-r from-vexo-red to-vexo-red-bright text-white shadow-vexo-red/40'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}
                    >
                      ✦ {pkg.badge}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Title & Short Description */}
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-black uppercase text-white tracking-wide mb-1">
                      ✦ {pkg.name}
                    </h3>
                    <p className="text-xs text-zinc-400 min-h-[32px] flex items-center justify-center">
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="py-5 px-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center mb-8">
                    <div
                      className={`text-2xl sm:text-3xl font-black tracking-tight mb-1 ${
                        isFeatured ? 'text-vexo-red' : 'text-white'
                      }`}
                    >
                      {pkg.priceDisplay || (pkg.priceINR ? `₹${pkg.priceINR.toLocaleString('en-IN')}` : 'Custom Quote')}
                    </div>
                    <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">
                      INCLUSIVE OF SHOOT & DELIVERABLES
                    </span>
                  </div>

                  {/* Feature Lists */}
                  <div className="space-y-6 text-sm">
                    {/* Photography Features */}
                    {pkg.photography && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-vexo-red mb-2.5 flex items-center gap-2 font-mono">
                          <Camera className="w-4 h-4 text-vexo-red" />
                          <span>Photography</span>
                        </h4>
                        <ul className="space-y-2 pl-6 text-zinc-300 text-xs">
                          {(pkg.photography.details || []).map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-vexo-red font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cinematography Features */}
                    {pkg.cinematography && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-vexo-red mb-2.5 flex items-center gap-2 font-mono">
                          <Video className="w-4 h-4 text-vexo-red" />
                          <span>Cinematography</span>
                        </h4>
                        <ul className="space-y-2 pl-6 text-zinc-300 text-xs">
                          {(pkg.cinematography.details || []).map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-vexo-red font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deliverables */}
                    {pkg.deliverables && pkg.deliverables.length > 0 && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-vexo-red mb-2.5 flex items-center gap-2 font-mono">
                          <Film className="w-4 h-4 text-vexo-red" />
                          <span>Deliverables</span>
                        </h4>
                        <ul className="space-y-2 pl-6 text-zinc-300 text-xs">
                          {pkg.deliverables.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-vexo-red shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Food & Travel Payment Responsibility */}
                    {pkg.foodTravel && (
                      <div className="py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 text-xs text-zinc-300">
                        <Utensils className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                        <span className="text-[11px] leading-snug">{pkg.foodTravel}</span>
                      </div>
                    )}

                    {/* Shoot Logistics (Days & Locations) */}
                    {pkg.shoot && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                          <span>{pkg.shoot.days}</span>
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                          <span>{pkg.shoot.locations}</span>
                        </span>
                      </div>
                    )}

                    {/* Optional Bonus Inclusions */}
                    {pkg.bonus && pkg.bonus.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-vexo-red/10 border border-vexo-red/25 text-xs">
                        <span className="font-bold text-vexo-red-bright uppercase tracking-wider block mb-1">
                          ★ Bonus Inclusions
                        </span>
                        <ul className="space-y-1 text-zinc-300">
                          {pkg.bonus.map((b: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-vexo-red shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Optional Platinum / Royal Inclusions */}
                    {pkg.platinumExperience && pkg.platinumExperience.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs">
                        <span className="font-bold text-white uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                          Royal VIP Experience
                        </span>
                        <ul className="space-y-1 text-zinc-300">
                          {pkg.platinumExperience.map((exp: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-vexo-red shrink-0" />
                              <span>{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-8 pt-0 space-y-3">
                  <Button
                    variant={isFeatured ? 'primary' : 'outline'}
                    size="lg"
                    onClick={() => handleBookPackage(pkg.id)}
                    className="w-full justify-center font-bold tracking-wide cursor-pointer"
                  >
                    <span>{pkg.ctaText || `Choose ${pkg.name}`}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(pkg)}
                    className="w-full py-2.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Inquire via WhatsApp</span>
                  </button>
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
