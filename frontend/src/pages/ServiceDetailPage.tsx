import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageSection } from '../components/ui/PageSection';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { servicesApi } from '../lib/api';
import type { ServiceItem, ServicePlan } from '../types/service';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Disc3,
  Sliders,
  HelpCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { getMediaUrl } from '../lib/utils';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    servicesApi.getServicesList().then((res) => {
      if (isMounted && res.data) {
        setAllServices(res.data);
        const match = res.data.find(
          (s) =>
            s.slug === slug ||
            s.id === slug ||
            s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
        );
        if (match) {
          setService(match);
        } else if (res.data.length > 0) {
          setService(res.data[0]);
        }
      }
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleSelectPlan = (plan: ServicePlan) => {
    if (!service) return;
    navigate(
      `/contact?service=${encodeURIComponent(service.title)}&plan=${encodeURIComponent(plan.name)}`
    );
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  if (isLoading) {
    return (
      <div className="pt-32 min-h-screen bg-[#f8fafc] dark:bg-[#050505] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-vexo-red border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-500">LOADING SERVICE SUITE...</span>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-32 min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/services')}>
          Return to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white pb-24 transition-colors duration-300">
      {/* BREADCRUMB NAVIGATION */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#08080c] py-3.5 px-4">
        <Container size="lg" className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
            <Link to="/" className="hover:text-vexo-red transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/services" className="hover:text-vexo-red transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{service.title}</span>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-vexo-red hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Services
          </Link>
        </Container>
      </div>

      {/* HERO SECTION */}
      <div className="relative pt-12 pb-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#07070a] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-vexo-red/10 rounded-full blur-[140px] pointer-events-none" />

        <Container size="lg" className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-red-50 dark:bg-vexo-red/10 text-vexo-red border border-red-200 dark:border-vexo-red/30 mb-4">
                <Disc3 className="w-3.5 h-3.5" /> {service.category || 'PRODUCTION CAPABILITY'}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-4 leading-none">
                {service.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed font-normal mb-6 max-w-2xl">
                {service.fullDesc || service.shortDesc}
              </p>

              {/* Currency Selector & Quick Metrics */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-mono font-semibold">
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      currency === 'INR'
                        ? 'bg-vexo-red text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      currency === 'USD'
                        ? 'bg-vexo-red text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                    }`}
                  >
                    $ USD
                  </button>
                </div>

                {service.pricingRange && (
                  <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300">
                    {service.pricingRange}
                  </span>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5">
              <div className="aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-black relative">
                <img
                  src={getMediaUrl(service.imageUrl)}
                  alt={service.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover brightness-95 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 3 PLANS SHOWCASE SECTION */}
      <PageSection padding="lg">
        <Container size="lg" className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-red-50 dark:bg-vexo-red/10 text-vexo-red border border-red-200 dark:border-vexo-red/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> THREE TIERS OF EXCELLENCE
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-3">
              CHOOSE YOUR PRODUCTION PLAN
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Select any tier below to lock in studio dates and receive full project onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {service.plans && service.plans.length > 0 ? (
              service.plans.map((plan) => {
                const price = currency === 'INR' ? plan.priceINR : plan.priceUSD;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                      plan.isPopular
                        ? 'bg-gradient-to-b from-red-50/50 to-white dark:from-vexo-red/10 dark:to-[#111118] border-2 border-vexo-red shadow-2xl shadow-vexo-red/10'
                        : 'bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-vexo-red text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                        ★ MOST POPULAR CHOICE
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          {plan.badge || 'TIER'}
                        </span>
                        {plan.duration && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                            <Clock className="w-3 h-3 text-vexo-red" /> {plan.duration}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-2">
                        {plan.name}
                      </h3>

                      <div className="my-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-black/40 border border-slate-200/60 dark:border-white/5 flex flex-col">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono whitespace-nowrap shrink-0">
                            {price}
                          </span>
                          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                            / project
                          </span>
                        </div>
                        {plan.revisions && (
                          <span className="text-[11px] font-mono text-vexo-red mt-1 font-semibold">
                            ✓ {plan.revisions}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-neutral-300 mb-6 leading-relaxed">
                        {plan.tagline}
                      </p>

                      <div className="h-px bg-slate-200 dark:bg-white/10 mb-6" />

                      <div className="space-y-3 mb-6">
                        <div className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
                          INCLUDED DELIVERABLES & SPECS:
                        </div>
                        {plan.features.map((feat, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300 font-mono"
                          >
                            <CheckCircle2 className="w-4 h-4 text-vexo-red shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {plan.deliverables && plan.deliverables.length > 0 && (
                        <div className="mb-6 pt-3 border-t border-slate-200/60 dark:border-white/5">
                          <div className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider mb-2">
                            ASSETS DELIVERED:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {plan.deliverables.map((deliv, dIdx) => (
                              <span
                                key={dIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-zinc-300"
                              >
                                {deliv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        plan.isPopular
                          ? 'bg-vexo-red text-white hover:bg-red-700 shadow-lg shadow-vexo-red/20'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200'
                      }`}
                    >
                      <span>{plan.ctaText || 'SELECT PLAN'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : null}
          </div>

          {/* WORKFLOW ROADMAP */}
          {service.processSteps && service.processSteps.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6 text-center">
                HOW WE WORK (PRODUCTION ROADMAP)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {service.processSteps.map((step) => (
                  <div
                    key={step.step}
                    className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10"
                  >
                    <div className="font-mono text-3xl font-black text-slate-300 dark:text-neutral-700 mb-2">
                      {step.step}
                    </div>
                    <h4 className="text-xs font-bold font-mono uppercase text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TECH SPECS & GEAR */}
          {((service.specs && service.specs.length > 0) ||
            (service.specifications && service.specifications.length > 0)) && (
            <div className="mb-16">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6 text-center">
                STUDIO GEAR & TECHNICAL SPECIFICATIONS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {(service.specs || service.specifications || []).map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex items-center gap-3 text-xs font-mono text-slate-800 dark:text-zinc-200"
                  >
                    <Sliders className="w-4 h-4 text-vexo-red shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQS ACCORDION */}
          {service.faqs && service.faqs.length > 0 && (
            <div className="mb-16 max-w-3xl mx-auto">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6 text-center">
                FREQUENTLY ASKED QUESTIONS
              </h3>
              <div className="space-y-3">
                {service.faqs.map((faq, fIdx) => {
                  const isOpen = openFaqIndex === fIdx;
                  return (
                    <div
                      key={fIdx}
                      className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02]"
                    >
                      <button
                        onClick={() => toggleFaq(fIdx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-mono text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <HelpCircle className="w-4 h-4 text-vexo-red shrink-0" />
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180 text-vexo-red' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-200/50 dark:border-white/5">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ALL SERVICES CAROUSEL / BROWSE OTHERS */}
          <div className="pt-12 border-t border-slate-200 dark:border-white/10">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 text-center mb-6">
              EXPLORE ALL OTHER PRODUCTION CAPABILITIES
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {allServices
                .filter((s) => s.id !== service.id)
                .map((other) => (
                  <Link
                    key={other.id}
                    to={`/services/${other.slug || other.id}`}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-vexo-red text-center transition-all group"
                  >
                    <div className="text-[10px] font-mono text-slate-400 mb-1">{other.number}</div>
                    <div className="text-xs font-bold font-mono uppercase text-slate-900 dark:text-white group-hover:text-vexo-red transition-colors line-clamp-1">
                      {other.title}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </Container>
      </PageSection>
    </div>
  );
};
