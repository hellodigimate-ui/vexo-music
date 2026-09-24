import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  WeddingHero,
  PortfolioGallerySection,
  DirectorAboutSection,
  ProcessWorkflowSection,
  VideoTeasersSection,
  CoupleStoriesSection,
  CoverageCategoriesSection,
  PreWeddingPackagesSection,
  SignaturePackageBuilder,
  WhyVexoSection,
  AddOnServicesSection,
  BookDateSection,
} from '../components/wedding';
import { API_BASE_URL, adminPreWeddingApi } from '../admin/services/adminApiClient';
import { Skeleton } from '../components/ui/Skeleton';
import { Camera } from 'lucide-react';

export const PreWeddingPage: React.FC = () => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('gold');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [initialNotes, setInitialNotes] = useState<string>('');
  const [preWeddingData, setPreWeddingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fetch latest from public backend API endpoint (no auth required)
    fetch(`${API_BASE_URL}/pre-wedding`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((res: any) => {
        if (isMounted && res.success && res.data) {
          setPreWeddingData(res.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        // Fallback to adminPreWeddingApi if backend request fails
        adminPreWeddingApi
          .get()
          .then((res: any) => {
            if (isMounted && res.success && res.data) {
              setPreWeddingData(res.data);
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

  const studioInfo = preWeddingData?.studioInfo || {};
  const rawPackages = preWeddingData?.packages;
  const preWeddingPackages = Array.isArray(rawPackages)
    ? rawPackages.filter((p: any) => p.category !== 'WEDDING')
    : [];

  const customServices = preWeddingData?.customServices || [];
  const addOns = preWeddingData?.addOns || [];
  const whyUsPillars = preWeddingData?.whyUsPillars || [];
  const heroStats = preWeddingData?.heroStats || [];
  const directorInfo = preWeddingData?.directorInfo || {};
  const processSteps = Array.isArray(preWeddingData?.processSteps) ? preWeddingData.processSteps : [];
  const videos = preWeddingData?.videos;
  const portfolioGallery = preWeddingData?.portfolioGallery;
  const coverageTypes = preWeddingData?.coverageTypes;
  const coupleStories = preWeddingData?.coupleStories;

  const scrollToBooking = () => {
    setTimeout(() => {
      const el = document.getElementById('book-your-date') || document.getElementById('book-date');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const scrollToPackages = () => {
    setTimeout(() => {
      const el = document.getElementById('pre-wedding-packages') || document.getElementById('packages');
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
      `Selected Custom Pre-Wedding Shoot Services:\n• ${services.join('\n• ')}\n\nEstimated Subtotal: ₹${totalEstimate.toLocaleString('en-IN')}`
    );
    scrollToBooking();
  };

  if (isLoading || !preWeddingData) {
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
      {/* Ambient Lighting Atmosphere */}
      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[12%] -left-40 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[180px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.12, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[35%] -right-40 w-[650px] h-[650px] bg-amber-500/15 rounded-full blur-[200px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.15, 0.08], scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-[62%] -left-40 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[180px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.07, 0.15, 0.07], scale: [1, 1.1, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[85%] -right-40 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[190px] pointer-events-none"
      />

      {/* 1. Hero Section Tailored for Pre-Wedding */}
      <WeddingHero
        studioInfo={studioInfo}
        heroStats={heroStats}
        tagline="CURATED PRE-WEDDING EXPERIENCES"
        headline={
          <>
            Your Romance Story.{' '}
            <span className="text-gradient-gold italic font-normal">Our Frames.</span>{' '}
            Forever.
          </>
        }
        subHeadlineHindi={
          studioInfo?.subHeadlineHindi ||
          "Every couple has a story of their own — and we don't just capture it, we turn it into a beautiful memory that lasts forever."
        }
        storyBadgeText="ROMANCE IN FRAMES"
        exploreText="EXPLORE PACKAGES"
        exploreIcon={<Camera className="w-4 h-4" />}
        onExplorePackages={scrollToPackages}
        onBookDate={scrollToBooking}
      />

      {/* 2. Curated Pre-Wedding Packages (Silver, Gold, Platinum) */}
      <motion.div
        id="pre-wedding-packages"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <PreWeddingPackagesSection
          packages={preWeddingPackages}
          whatsappNumber={studioInfo?.whatsappNumber}
          onSelectPackage={handleSelectPackage}
        />
      </motion.div>

      {/* 3. Process Workflow ("A clear process. A calm shoot day. Art that lasts.") */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <ProcessWorkflowSection
          processSteps={processSteps}
          badgeText="THE EXPERIENCE"
          heading={
            <>
              A CLEAR PROCESS. <span className="text-vexo-red">A CALM SHOOT DAY.</span> ART THAT LASTS.
            </>
          }
          subtitle="From location scouting and wardrobe styling to delivering your final handcrafted cinema cut, we keep every detail seamless, calm, and tailored to you."
        />
      </motion.div>

      {/* 4. Pre-Wedding Teasers & Cinematic Highlights (Video Player Grid) */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <VideoTeasersSection videos={videos} />
      </motion.div>

      {/* 5. Featured Portfolio Gallery ("Stories Made For The Long After") */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <PortfolioGallerySection galleryItems={portfolioGallery} />
      </motion.div>

      {/* 6. About Lead Artist / Creative Director */}
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

      {/* 7. Couple Stories / Testimonials Preview */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <CoupleStoriesSection coupleStories={coupleStories} />
      </motion.div>

      {/* 8. Coverage Designed Around Your Day */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <CoverageCategoriesSection
          coverageTypes={coverageTypes}
          scrollTargetId="pre-wedding-packages"
          onSelectCoverage={() => scrollToPackages()}
        />
      </motion.div>

      {/* 9. VEXO Signature Custom Package Builder */}
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

      {/* 10. Add-On Services */}
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

      {/* 11. Why VEXO Studio Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <WhyVexoSection pillars={whyUsPillars} />
      </motion.div>

      {/* 12. Book Date / Reservation Form */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <BookDateSection
          studioInfo={studioInfo}
          packages={preWeddingPackages}
          addOns={addOns}
          selectedPackageId={selectedPackageId}
          selectedAddOnIds={selectedAddOnIds}
          initialNotes={initialNotes}
          badgeText="RESERVE PRE-WEDDING DATE"
          serviceTypeLabel="Pre-Wedding Romance Shoots | 4K Cinematic Highlights | Destination Sessions"
        />
      </motion.div>
    </motion.div>
  );
};

export default PreWeddingPage;
