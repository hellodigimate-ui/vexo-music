import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  WeddingHero,
  WeddingDayStoriesSection,
  WeddingPlansSection,
  FilmsReelsShowcase,
  PortfolioGallerySection,
  DirectorAboutSection,
  ProcessWorkflowSection,
  CoupleStoriesSection,
  CoverageCategoriesSection,
  SignaturePackageBuilder,
  WhyVexoSection,
  AddOnServicesSection,
  BookDateSection,
} from '../components/wedding';
import {
  DEFAULT_WEDDING_PROCESS_STEPS,
} from '../data/weddingData';
import { API_BASE_URL, adminPreWeddingApi } from '../admin/services/adminApiClient';
import { Skeleton } from '../components/ui/Skeleton';
import { Crown, Film, Award, Play } from 'lucide-react';

export const WeddingPage: React.FC = () => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('wedding-signature');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [initialNotes, setInitialNotes] = useState<string>('');
  const [weddingData, setWeddingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fetch latest from public backend API endpoint (no auth required)
    fetch(`${API_BASE_URL}/pre-wedding`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((res: any) => {
        if (isMounted && res.success && res.data) {
          setWeddingData(res.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        // Fallback to adminPreWeddingApi if backend request fails
        adminPreWeddingApi
          .get()
          .then((res: any) => {
            if (isMounted && res.success && res.data) {
              setWeddingData(res.data);
            }
          })
          .catch(() => {})
          .finally(() => {
            if (isMounted) setIsLoading(false);
          });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const studioInfo = weddingData?.studioInfo || {};
  const rawPackages = weddingData?.packages;
  const weddingPlans =
    weddingData?.weddingPackages && weddingData.weddingPackages.length > 0
      ? weddingData.weddingPackages
      : rawPackages?.some((p: any) => p.category === 'WEDDING')
      ? rawPackages.filter((p: any) => p.category === 'WEDDING')
      : [];

  const customServices = weddingData?.customServices || [];
  const addOns = weddingData?.addOns || [];
  const whyUsPillars = weddingData?.whyUsPillars || [];
  const heroStats = weddingData?.heroStats || [];
  const directorInfo = weddingData?.directorInfo || {};
  const videos = weddingData?.videos || [];
  const portfolioGallery = weddingData?.portfolioGallery || [];
  const coverageTypes = weddingData?.coverageTypes || [];
  const coupleStories = weddingData?.coupleStories || [];
  const weddingDayStories = weddingData?.weddingDayStories;

  const scrollToBooking = () => {
    setTimeout(() => {
      const el = document.getElementById('book-your-date') || document.getElementById('book-date');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const scrollToPlans = () => {
    setTimeout(() => {
      const el = document.getElementById('wedding-plans') || document.getElementById('wedding-plans-section');
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
    setSelectedPackageId('wedding-signature');
    setInitialNotes(
      `Selected Custom Wedding Day Services:\n• ${services.join('\n• ')}\n\nEstimated Subtotal: ₹${totalEstimate.toLocaleString('en-IN')}`
    );
    scrollToBooking();
  };

  if (isLoading || !weddingData) {
    return (
      <div className="cinematic-dark bg-[#050505] text-white min-h-screen pt-24 pb-20 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Skeleton */}
          <div className="flex flex-col items-center text-center py-16 gap-6">
            <Skeleton className="h-8 w-60 rounded-full" />
            <Skeleton className="h-14 sm:h-20 w-3/4 max-w-2xl rounded-2xl" />
            <Skeleton className="h-5 w-4/5 max-w-lg rounded-md" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-12 w-44 rounded-xl" />
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>

          {/* 3 Highlights Strip Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>

          {/* Package Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-16">
            <Skeleton className="h-[520px] rounded-3xl" />
            <Skeleton className="h-[560px] rounded-3xl" />
            <Skeleton className="h-[520px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="cinematic-dark bg-[#050505] text-white min-h-screen relative overflow-hidden"
    >
      {/* Ambient Royal & Crimson Lighting Atmosphere */}
      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] -left-40 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[180px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.12, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[38%] -right-40 w-[650px] h-[650px] bg-amber-500/15 rounded-full blur-[200px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.15, 0.08], scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-[65%] -left-40 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[180px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.07, 0.15, 0.07], scale: [1, 1.1, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[88%] -right-40 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[190px] pointer-events-none"
      />

      {/* 1. Hero Section Tailored for Wedding Day */}
      <WeddingHero
        studioInfo={studioInfo}
        heroStats={heroStats}
        tagline="ROYAL WEDDING DAY CINEMATOGRAPHY"
        headline={
          <>
            Every Sacred Ritual.{' '}
            <span className="text-gradient-gold italic font-normal">Crafted Into Art.</span>{' '}
            Forever.
          </>
        }
        subHeadlineHindi="Beyond the pre-wedding, we capture every sacred ritual, emotional pheras, grand entry, and royal celebration of your wedding day with cinema mastery."
        storyBadgeText="ROYAL WEDDING CINEMA"
        exploreText="EXPLORE WEDDING PLANS"
        exploreIcon={<Crown className="w-4 h-4 text-[#D4AF37]" />}
        featurePills={[
          { icon: <Film className="w-3.5 h-3.5 text-[#D4AF37]" />, text: 'Multi-Crew Sony Cinema Rig' },
          { icon: <Award className="w-3.5 h-3.5 text-[#D4AF37]" />, text: 'Master Wedding Feature Film' },
          { icon: <Play className="w-3.5 h-3.5 text-[#D4AF37]" />, text: 'DaVinci Resolve Master Grading' },
        ]}
        bgImage="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"
        onExplorePackages={scrollToPlans}
        onBookDate={scrollToBooking}
      />

      {/* 2. Wedding Day Stories Section (Editorial Gallery) */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <WeddingDayStoriesSection
          data={weddingDayStories}
          onViewStories={scrollToPlans}
        />
      </motion.div>

      {/* 3. Curated Wedding Plans (Essential, Signature, Royal) */}
      <motion.div
        id="wedding-plans"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <WeddingPlansSection
          packages={weddingPlans}
          whatsappNumber={studioInfo?.whatsappNumber}
          onSelectPackage={handleSelectPackage}
        />
      </motion.div>

      {/* 4. Wedding Films & Celebration Reels Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <FilmsReelsShowcase
          videos={videos}
          defaultCategory="Cinematic Film"
        />
      </motion.div>

      {/* 5. Process Workflow for Wedding Day */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <ProcessWorkflowSection
          processSteps={DEFAULT_WEDDING_PROCESS_STEPS}
          badgeText="WEDDING DAY PROCESS"
          heading={
            <>
              A FLAWLESS SCHEDULE. <span className="text-vexo-red">CALM RITUAL COVERAGE.</span> ART THAT LASTS.
            </>
          }
          subtitle="From pre-ceremony itinerary alignment to delivering your handcrafted master wedding documentary, every sacred hour is captured with royal precision."
        />
      </motion.div>

      {/* 6. Featured Portfolio Gallery ("Stories Made For The Long After") */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <PortfolioGallerySection galleryItems={portfolioGallery} />
      </motion.div>

      {/* 7. About Lead Artist / Creative Director */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <DirectorAboutSection
          directorInfo={directorInfo}
          whatsappNumber={studioInfo?.whatsappNumber}
          onBookDiscovery={scrollToBooking}
        />
      </motion.div>

      {/* 8. Couple Stories / Testimonials Preview */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <CoupleStoriesSection coupleStories={coupleStories} />
      </motion.div>

      {/* 9. Wedding Day Coverage Categories */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <CoverageCategoriesSection
          coverageTypes={coverageTypes}
          scrollTargetId="wedding-plans"
          title={
            <>
              COVERAGE DESIGNED <span className="text-vexo-red">AROUND YOUR WEDDING.</span>
            </>
          }
          subtitle="Specialized multi-camera crews, prime lenses, and audio rigs calibrated for every sacred ceremony from Haldi to Reception."
          onSelectCoverage={() => scrollToPlans()}
        />
      </motion.div>

      {/* 10. VEXO Signature Custom Package Builder */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <SignaturePackageBuilder
          customServices={customServices}
          addOns={addOns}
          studioInfo={studioInfo}
          onProceedToBooking={handleProceedToCustomBooking}
        />
      </motion.div>

      {/* 11. Add-On Services */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <AddOnServicesSection
          addOns={addOns}
          selectedAddOns={selectedAddOnIds}
          onToggleAddOn={handleToggleAddOn}
          onProceedToBooking={handleProceedToBooking}
        />
      </motion.div>

      {/* 12. Why VEXO Studio Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <WhyVexoSection pillars={whyUsPillars} />
      </motion.div>

      {/* 13. Book Date / Reservation Form for Wedding Day */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <BookDateSection
          studioInfo={studioInfo}
          packages={weddingPlans}
          addOns={addOns}
          selectedPackageId={selectedPackageId}
          selectedAddOnIds={selectedAddOnIds}
          initialNotes={initialNotes}
          badgeText="RESERVE WEDDING CEREMONY DATE"
          serviceTypeLabel="Wedding Photography | Full Day Cinematography | Multi-Event Royal Coverage"
        />
      </motion.div>
    </motion.div>
  );
};

export default WeddingPage;
