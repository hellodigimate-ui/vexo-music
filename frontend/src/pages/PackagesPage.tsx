import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PreWeddingPackagesSection,
  SignaturePackageBuilder,
  WhyVexoSection,
  AddOnServicesSection,
  BookDateSection,
} from '../components/wedding';
import { Container } from '../components/ui/Container';
import { Sparkles, Heart } from 'lucide-react';
import { WEDDING_STUDIO_INFO } from '../data/weddingData';
import { adminPreWeddingApi } from '../admin/services/adminApiClient';

export const PackagesPage: React.FC = () => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('gold');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [initialNotes, setInitialNotes] = useState<string>('');
  const [preWeddingData, setPreWeddingData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    adminPreWeddingApi
      .get()
      .then((res: any) => {
        if (isMounted && res.success && res.data) {
          setPreWeddingData(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const studioInfo = preWeddingData?.studioInfo || WEDDING_STUDIO_INFO;
  const packages = preWeddingData?.packages;
  const customServices = preWeddingData?.customServices;
  const addOns = preWeddingData?.addOns;
  const whyUsPillars = preWeddingData?.whyUsPillars;

  const scrollToBooking = () => {
    setTimeout(() => {
      const el = document.getElementById('book-your-date') || document.getElementById('book-date');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    scrollToBooking();
  };

  const handleToggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((item: string) => item !== id) : [...prev, id]
    );
  };

  const handleProceedToBooking = (addOnIds: string[]) => {
    setSelectedAddOnIds(addOnIds);
    scrollToBooking();
  };

  const handleProceedToCustomBooking = (services: string[], totalEstimate: number) => {
    setSelectedPackageId('gold');
    setInitialNotes(
      `Selected Custom Package Services:\n• ${services.join('\n• ')}\n\nEstimated Subtotal: ₹${totalEstimate.toLocaleString('en-IN')}`
    );
    scrollToBooking();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="cinematic-dark bg-[#050505] text-white min-h-screen pt-20 sm:pt-24"
    >
      {/* Top Banner */}
      <section className="cinematic-dark relative py-16 sm:py-20 bg-gradient-to-b from-[#0c0c10] to-[#050505] border-b border-white/10 text-center overflow-hidden">
        {/* Subtle Ambient Red Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[200px] bg-vexo-red/10 rounded-full blur-[130px] pointer-events-none"
        />

        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-xs font-mono font-bold uppercase tracking-widest mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-vexo-red" />
            <span>TRANSPARENT & LUXURY PACKAGES</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white mb-4"
          >
            PRE-WEDDING & <span className="text-vexo-red">CINEMATOGRAPHY</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
            className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Choose from our curated Pre-Wedding tiers (Silver, Gold, Platinum) or build your custom package with the VEXO Signature Builder.
          </motion.p>
        </Container>
      </section>

      {/* Brand Philosophy Hook Banner (Positioned Upper on the Page) */}
      <section className="cinematic-dark relative pt-12 pb-2 bg-[#050505]">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-vexo-red/10 via-[#100607] to-vexo-red/10 border border-vexo-red/20 text-center relative overflow-hidden max-w-4xl mx-auto shadow-2xl shadow-black/80"
          >
            <div className="max-w-3xl mx-auto relative z-10">
              <Heart className="w-8 h-8 text-vexo-red mx-auto mb-4" />
              <p className="text-lg sm:text-xl italic text-white/95 mb-4 leading-relaxed font-medium">
                &ldquo;{studioInfo.subHeadlineHindi}&rdquo;
              </p>
              <p className="text-xs uppercase tracking-widest font-mono font-bold text-vexo-red">
                — {studioInfo.name} PHILOSOPHY
              </p>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* 1. Pre-Wedding Packages (Silver, Gold, Platinum) */}
      <PreWeddingPackagesSection
        packages={packages}
        whatsappNumber={studioInfo?.whatsappNumber}
        onSelectPackage={handleSelectPackage}
      />

      {/* 2. Signature Custom Package Builder */}
      <SignaturePackageBuilder
        customServices={customServices}
        studioInfo={studioInfo}
        onProceedToBooking={handleProceedToCustomBooking}
      />

      {/* 3. Add-On Services */}
      <AddOnServicesSection
        addOns={addOns}
        selectedAddOns={selectedAddOnIds}
        onToggleAddOn={handleToggleAddOn}
        onProceedToBooking={handleProceedToBooking}
      />

      {/* 4. Why VEXO Studio */}
      <WhyVexoSection pillars={whyUsPillars} />

      {/* 5. Book Date Section */}
      <BookDateSection
        studioInfo={studioInfo}
        packages={packages}
        addOns={addOns}
        selectedPackageId={selectedPackageId}
        selectedAddOnIds={selectedAddOnIds}
        initialNotes={initialNotes}
      />
    </motion.div>
  );
};

export default PackagesPage;

