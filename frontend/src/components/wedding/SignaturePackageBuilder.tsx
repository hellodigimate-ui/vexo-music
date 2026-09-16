import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import {
  CUSTOM_PACKAGE_SERVICES,
  type CustomServiceOption,
  WEDDING_STUDIO_INFO,
} from '../../data/weddingData';
import {
  Camera,
  Video,
  Film,
  Heart,
  Smartphone,
  Plane,
  Clapperboard,
  Sparkles,
  Shirt,
  MapPin,
  BookOpen,
  Check,

  Send,
  Sliders,
  RotateCcw,

  ArrowRight,
} from 'lucide-react';

interface SignaturePackageBuilderProps {
  onProceedToBooking?: (selectedServiceNames: string[], totalEstimate: number) => void;
  customServices?: CustomServiceOption[];
  studioInfo?: any;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera,
  Video,
  Film,
  Heart,
  Smartphone,
  Plane,
  Clapperboard,
  Sparkles,
  Shirt,
  MapPin,
  BookOpen,
};

type CategoryKey = 'all' | 'core' | 'coverage' | 'styling' | 'deliverable';

export const SignaturePackageBuilder: React.FC<SignaturePackageBuilderProps> = ({
  onProceedToBooking,
  customServices = CUSTOM_PACKAGE_SERVICES,
  studioInfo = WEDDING_STUDIO_INFO,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'opt-photography',
    'opt-cinematography',
    'opt-reels',
  ]);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return customServices;
    return customServices.filter(
      (s: CustomServiceOption) => s.category === activeCategory
    );
  }, [activeCategory, customServices]);

  const toggleService = (id: string) => {
    setSelectedIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((item: string) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = useMemo(() => {
    return customServices.filter((s: CustomServiceOption) =>
      selectedIds.includes(s.id)
    );
  }, [selectedIds, customServices]);

  const totalEstimate = useMemo(() => {
    return selectedServices.reduce(
      (sum: number, s: CustomServiceOption) => sum + s.startingPriceINR,
      0
    );
  }, [selectedServices]);

  const handleWhatsAppQuote = () => {
    const serviceList = selectedServices
      .map((s: CustomServiceOption) => `• ${s.name} - ₹${s.startingPriceINR.toLocaleString('en-IN')}`)
      .join('%0A');

    const msg =
      `Hello VEXO Wedding Studio! ✨%0A%0A` +
      `I crafted a custom *VEXO SIGNATURE* Wedding Package on your website:%0A%0A` +
      `*Selected Services:*%0A${serviceList}%0A%0A` +
      `*Estimated Subtotal:* ₹${totalEstimate.toLocaleString('en-IN')}%0A%0A` +
      `Please check team availability and share a detailed quotation for our wedding dates.`;

    window.open(`https://wa.me/${studioInfo?.whatsappNumber || WEDDING_STUDIO_INFO.whatsappNumber}?text=${msg}`, '_blank');
  };

  const handleBookSelected = () => {
    if (onProceedToBooking) {
      onProceedToBooking(
        selectedServices.map((s: CustomServiceOption) => s.name),
        totalEstimate
      );
    } else {
      const el = document.getElementById('book-your-date') || document.getElementById('book-date');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories: { key: CategoryKey; label: string }[] = [
    { key: 'all', label: `All Services (${customServices.length})` },
    { key: 'core', label: 'Core Shoots' },
    { key: 'coverage', label: 'Coverage & Location' },
    { key: 'styling', label: 'Styling & Looks' },
    { key: 'deliverable', label: 'Edits & Deliverables' },
  ];

  return (
    <section id="signature-package-builder" className="relative py-24 bg-[#07070a] overflow-hidden text-white border-t border-white/5">
      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-vexo-red/10 blur-[150px] rounded-full opacity-20" />
      </div>

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-xs font-mono font-bold tracking-widest uppercase mb-4"
          >
            <Sliders className="w-3.5 h-3.5 text-vexo-red" />
            <span>CUSTOMISE YOUR BESPOKE PACKAGE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
          >
            ✦ VEXO <span className="text-vexo-red">SIGNATURE</span> BUILDER
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            {studioInfo?.signatureIntro || "If you're looking for a customised package based on your budget and requirements, our team will create a personalised experience for you."}
          </motion.p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat: { key: CategoryKey; label: string }) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-vexo-red text-white shadow-md shadow-vexo-red/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content Layout: Grid + Sticky Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Service Cards Grid (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredServices.map((service: CustomServiceOption, idx: number) => {
              const isSelected = selectedIds.includes(service.id);
              const IconComp = ICON_MAP[service.icon] || Sparkles;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  onClick={() => toggleService(service.id)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-gradient-to-br from-vexo-red/15 via-[#160a0c] to-[#0e0709] border-vexo-red shadow-[0_0_20px_rgba(224,0,0,0.18)]'
                      : 'bg-[#0d0d10] hover:bg-[#131318] border-white/10 hover:border-vexo-red/40'
                  }`}
                >
                  <div>
                    {/* Icon and Selection checkbox */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-vexo-red text-white shadow-md shadow-vexo-red/30'
                            : 'bg-white/5 text-zinc-300 border border-white/10'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-vexo-red border-vexo-red text-white'
                            : 'border-white/25 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mb-1.5">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {service.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                      {service.description}
                    </p>
                  </div>

                  {/* Pricing footer */}
                  <div className="pt-3 border-t border-white/10 flex items-baseline justify-between text-xs">
                    <span className="text-zinc-400 font-mono">Starting</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-vexo-red">
                        ₹{service.startingPriceINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-zinc-400 ml-1">
                        / {service.unit}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Sticky Estimate Card (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0c0c0f] border border-white/15 shadow-2xl shadow-black/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-vexo-red" />
                    <span className="text-xs uppercase font-mono font-bold tracking-wider text-vexo-red">
                      Live Estimate
                    </span>
                  </div>
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-black uppercase text-white mb-1">
                  VEXO Signature Package
                </h3>
                <p className="text-xs text-zinc-400 mb-6">
                  {selectedServices.length} selected of 11 bespoke services
                </p>

                {/* Selected Items List */}
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 mb-6">
                  {selectedServices.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400 italic">
                      Select services on the left to calculate your customized package estimate.
                    </div>
                  ) : (
                    selectedServices.map((s: CustomServiceOption) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/5 border border-white/5"
                      >
                        <span className="text-zinc-200 truncate mr-2">{s.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-vexo-red font-semibold">
                            ₹{s.startingPriceINR.toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleService(s.id);
                            }}
                            className="text-zinc-400 hover:text-red-400 text-xs cursor-pointer ml-1"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total Calc */}
                <div className="p-4 rounded-xl bg-vexo-red/10 border border-vexo-red/20 mb-6">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs uppercase tracking-wider text-zinc-300 font-mono font-medium">
                      Estimated Starting Subtotal
                    </span>
                    <span className="text-2xl font-black text-vexo-red">
                      ₹{totalEstimate.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    *Final price may vary based on shoot days, location permissions, and custom deliverables.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={selectedServices.length === 0}
                  className="w-full justify-center font-bold tracking-wide"
                  onClick={handleBookSelected}
                >
                  <span>Book This Custom Package</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <button
                  type="button"
                  onClick={handleWhatsAppQuote}
                  disabled={selectedServices.length === 0}
                  className="w-full py-3 px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Get Instant WhatsApp Quote</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default SignaturePackageBuilder;
