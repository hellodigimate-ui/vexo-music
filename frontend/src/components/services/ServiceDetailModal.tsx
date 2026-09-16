import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Clock,
  Disc3,
  Sliders,
  FileCheck,
  HelpCircle,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import type { ServiceItem, ServicePlan } from '../../types/service';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = true,
  hasNext = true,
}) => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'plans' | 'process' | 'specs' | 'faqs'>('plans');

  // Handle keyboard ESC and Arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onNavigatePrev) {
        onNavigatePrev();
      } else if (e.key === 'ArrowRight' && onNavigateNext) {
        onNavigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, onNavigatePrev, onNavigateNext]);

  // Reset tab when service changes
  useEffect(() => {
    if (service) {
      setActiveTab('plans');
      setOpenFaqIndex(0);
    }
  }, [service?.id]);

  if (!isOpen || !service) return null;

  const handleSelectPlan = (plan: ServicePlan) => {
    onClose();
    if (service.slug === 'pre-wedding-shoot') {
      navigate('/packages');
      return;
    }
    navigate(
      `/contact?service=${encodeURIComponent(service.title)}&plan=${encodeURIComponent(plan.name)}`
    );
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Darkened Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 dark:bg-black/90 backdrop-blur-md z-0"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-6xl xl:max-w-7xl bg-white dark:bg-[#09090d] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-white transition-colors"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-vexo-red/5 dark:bg-vexo-red/10 rounded-full blur-[140px] pointer-events-none" />

          {/* 1. TOP HEADER & NAVIGATION BAR */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/95 dark:bg-[#0c0c12]/95 backdrop-blur-md gap-2.5 z-20">
            {/* Left: Sequence Number + Category + Service Title */}
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-black text-slate-400 dark:text-zinc-500 tracking-wider">
                {service.number || '01'}
              </span>
              <span className="text-slate-300 dark:text-white/20">•</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-50 dark:bg-vexo-red/10 text-vexo-red border border-red-200 dark:border-vexo-red/30">
                <Disc3 className="w-3 h-3 text-vexo-red animate-spin-slow" />
                {service.category || 'CAPABILITY'}
              </span>
              <span className="hidden md:inline text-slate-300 dark:text-white/20">•</span>
              <h2 className="hidden md:inline text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                {service.title}
              </h2>
            </div>

            {/* Right: Currency Toggle + Next/Prev + Close Button */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              {/* Dual-Currency Segmented Switch */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-xs font-mono font-bold">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    currency === 'INR'
                      ? 'bg-vexo-red text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-vexo-red text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  $ USD
                </button>
              </div>

              {/* Prev / Next Service Navigator */}
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-white/10 pl-2">
                <button
                  onClick={onNavigatePrev}
                  disabled={!hasPrev}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Previous Service (← Arrow)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onNavigateNext}
                  disabled={!hasNext}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Next Service (→ Arrow)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-vexo-red hover:text-white hover:border-vexo-red dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 transition-all cursor-pointer ml-1"
                title="Close (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. SUB-HEADER / TAB NAVIGATION BAR */}
          <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-[#09090e] overflow-x-auto gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                  activeTab === 'plans'
                    ? 'bg-vexo-red text-white shadow-md shadow-vexo-red/20'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>3 Pricing Plans</span>
              </button>
              <button
                onClick={() => setActiveTab('process')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                  activeTab === 'process'
                    ? 'bg-vexo-red text-white shadow-md shadow-vexo-red/20'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Production Roadmap</span>
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                  activeTab === 'specs'
                    ? 'bg-vexo-red text-white shadow-md shadow-vexo-red/20'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Tech Specs & Gear</span>
              </button>
              <button
                onClick={() => setActiveTab('faqs')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                  activeTab === 'faqs'
                    ? 'bg-vexo-red text-white shadow-md shadow-vexo-red/20'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                <span>Deliverables & FAQs</span>
              </button>
            </div>

            {/* Service Title summary on mobile */}
            <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-vexo-red" /> 100% Master Ownership
              </span>
              <span>•</span>
              <span className="text-slate-900 dark:text-white font-bold">{service.pricingRange || 'Milestone Based'}</span>
            </div>
          </div>

          {/* 3. SCROLLABLE TAB CONTENT BODY */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar space-y-5 bg-slate-50/40 dark:bg-transparent">
            {/* TAB 1: 3 PRICING PLANS */}
            {activeTab === 'plans' && (
              <div className="space-y-4">
                {/* Intro Title Banner */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pb-1">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-vexo-red font-bold flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3 h-3" /> TRANSPARENT TIER ARCHITECTURE
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                      {service.title} PLANS
                    </h1>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 max-w-md leading-relaxed">
                    Choose a tailored milestone package below. Includes stems, high-res masters, and full commercial rights.
                  </p>
                </div>

                {/* THE 3 PLANS COMPARISON CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
                  {service.plans && service.plans.length > 0 ? (
                    service.plans.map((plan) => {
                      const price = currency === 'INR' ? plan.priceINR : plan.priceUSD;

                      return (
                        <div
                          key={plan.id}
                          className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ${
                            plan.isPopular
                              ? 'bg-gradient-to-b from-red-50/90 via-white to-slate-50 dark:from-vexo-red/15 dark:via-[#13131c] dark:to-[#0c0c12] border-2 border-vexo-red shadow-lg shadow-red-500/10 dark:shadow-[0_0_35px_rgba(229,9,20,0.2)]'
                              : 'bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs hover:shadow-md'
                          }`}
                        >
                          {/* Popular Pill */}
                          {plan.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-vexo-red text-white text-[9px] font-mono font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> RECOMMENDED CHOICE
                            </div>
                          )}

                          <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-zinc-400 border border-slate-200 dark:border-white/10">
                                {plan.badge || 'TIER'}
                              </span>
                              {plan.duration && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                                  <Clock className="w-2.5 h-2.5 text-vexo-red" /> {plan.duration}
                                </span>
                              )}
                            </div>

                            {/* Plan Name */}
                            <h3 className="text-base sm:text-lg font-black uppercase tracking-normal text-slate-950 dark:text-white mb-2 leading-snug">
                              {plan.name}
                            </h3>

                            {/* Crisp Price Block (With whitespace-nowrap so numbers never wrap!) */}
                            <div className="my-3 p-3 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col shadow-2xs">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0">
                                  {price}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">/ project</span>
                              </div>
                              {plan.revisions && (
                                <span className="text-[10px] font-mono text-vexo-red mt-1 font-semibold">
                                  ✓ {plan.revisions}
                                </span>
                              )}
                            </div>

                            {/* Plan Tagline */}
                            <p className="text-[11px] text-slate-600 dark:text-zinc-300 mb-3.5 leading-relaxed font-normal">
                              {plan.tagline}
                            </p>

                            {/* Direct CTA Button Right Here */}
                            <button
                              onClick={() => handleSelectPlan(plan)}
                              className={`w-full py-2.5 px-3.5 rounded-xl text-[11px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mb-3.5 ${
                                plan.isPopular
                                  ? 'bg-vexo-red text-white hover:bg-red-600 shadow-md shadow-vexo-red/30'
                                  : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-zinc-200 shadow-xs'
                              }`}
                            >
                              <span>{plan.ctaText || 'SELECT THIS PLAN'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Subtle Divider */}
                            <div className="h-px bg-slate-200 dark:bg-white/10 mb-3.5" />

                            {/* Feature Checklist */}
                            <div className="space-y-2 mb-3.5">
                              <div className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider">
                                SPECIFICATIONS & SCOPE:
                              </div>
                              {plan.features.map((feat, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-zinc-200 font-mono"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-vexo-red shrink-0 mt-0.5" />
                                  <span className="leading-snug">{feat}</span>
                                </div>
                              ))}
                            </div>

                            {/* Deliverables Tags */}
                            {plan.deliverables && plan.deliverables.length > 0 && (
                              <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                                <div className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1.5">
                                  DELIVERABLES INCLUDED:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {plan.deliverables.map((deliv, dIdx) => (
                                    <span
                                      key={dIdx}
                                      className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300"
                                    >
                                      {deliv}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 py-10 text-center text-xs font-mono text-slate-500 dark:text-zinc-500">
                      Tier customization available upon request.
                    </div>
                  )}
                </div>

                {/* Bottom Assistance Notice */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-vexo-red shrink-0" />
                    <span className="text-xs font-mono text-slate-700 dark:text-zinc-300">
                      Need custom stems, sync licenses, or studio booking assistance?
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/contact?service=${encodeURIComponent(service.title)}`);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white border border-slate-300/80 dark:border-transparent text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                  >
                    Contact Production Desk
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTION ROADMAP */}
            {activeTab === 'process' && (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-vexo-red font-bold mb-0.5">
                    THE VEXO METHODOLOGY
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                    4-STAGE PRODUCTION ROADMAP
                  </h3>
                  <p className="text-xs font-mono text-slate-600 dark:text-zinc-400 mt-1">
                    From initial concept discovery to final Dolby Atmos master release.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {service.processSteps && service.processSteps.length > 0 ? (
                    service.processSteps.map((step) => (
                      <div
                        key={step.step}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-vexo-red/50 transition-all flex flex-col justify-between shadow-2xs"
                      >
                        <div>
                          <span className="font-mono text-3xl font-black text-slate-200 dark:text-white/20 block mb-2">
                            {step.step}
                          </span>
                          <h4 className="text-xs font-bold font-mono uppercase text-slate-900 dark:text-white mb-1.5">
                            {step.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-4 py-10 text-center text-xs font-mono text-slate-500 dark:text-zinc-500">
                      Standard agile 4-step production timeline applies.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TECH SPECS & GEAR */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-vexo-red font-bold mb-0.5">
                    STUDIO ARSENAL & HARDWARE
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                    TECHNICAL SPECIFICATIONS
                  </h3>
                  <p className="text-xs font-mono text-slate-600 dark:text-zinc-400 mt-1">
                    World-class analog consoles, microphones, cinema camera packages, and monitoring.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(service.specs || service.specifications || []).map((spec, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-3 text-xs font-mono text-slate-700 dark:text-zinc-200 shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-vexo-red/10 border border-red-200 dark:border-vexo-red/30 flex items-center justify-center shrink-0">
                        <Sliders className="w-3.5 h-3.5 text-vexo-red" />
                      </div>
                      <span className="leading-relaxed">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DELIVERABLES & FAQS */}
            {activeTab === 'faqs' && (
              <div className="space-y-5">
                {/* Deliverables Section */}
                {service.deliverables && service.deliverables.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-vexo-red font-bold mb-0.5">
                        HANDOVER ARCHIVE
                      </div>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                        WHAT YOU WALK AWAY WITH
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {service.deliverables.map((deliv, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-zinc-200 shadow-2xs"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                          <span>{deliv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQs Accordion */}
                {service.faqs && service.faqs.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-vexo-red font-bold mb-0.5">
                        FREQUENT INQUIRIES
                      </div>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                        QUESTIONS & ANSWERS
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {service.faqs.map((faq, fIdx) => {
                        const isOpen = openFaqIndex === fIdx;
                        return (
                          <div
                            key={fIdx}
                            className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-2xs"
                          >
                            <button
                              onClick={() => toggleFaq(fIdx)}
                              className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 font-mono text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <HelpCircle className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                                {faq.q}
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 shrink-0 transition-transform ${
                                  isOpen ? 'rotate-180 text-vexo-red' : ''
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-3.5 pt-1 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-normal border-t border-slate-100 dark:border-white/5">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. MODAL FOOTER STATUS BAR */}
          <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-2.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0c12] text-xs font-mono text-slate-500 dark:text-zinc-400">
            <div className="hidden sm:flex items-center gap-2 text-[10px]">
              <span>Navigate:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-[10px] border border-slate-300 dark:border-transparent">←</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-[10px] border border-slate-300 dark:border-transparent">→</kbd>
              <span className="ml-2">Dismiss:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-[10px] border border-slate-300 dark:border-transparent">Esc</kbd>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors font-bold cursor-pointer text-xs"
              >
                CLOSE
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (service.slug === 'pre-wedding-shoot') {
                    navigate('/packages');
                    return;
                  }
                  navigate(`/contact?service=${encodeURIComponent(service.title)}`);
                }}
                className="px-4 py-2 rounded-lg bg-vexo-red hover:bg-red-600 text-white font-bold transition-all shadow-md cursor-pointer text-xs flex items-center gap-1.5"
              >
                <span>{service.slug === 'pre-wedding-shoot' ? 'VIEW WEDDING STUDIO PACKAGES' : 'BOOK THIS SERVICE'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
