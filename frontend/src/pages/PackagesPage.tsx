import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  WeddingHero,
  WeddingDayStoriesSection,
  PortfolioGallerySection,
  DirectorAboutSection,
  ProcessWorkflowSection,
  VideoTeasersSection,
  CoupleStoriesSection,
  CoverageCategoriesSection,
  PreWeddingPackagesSection,
  WeddingPlansSection,
  SignaturePackageBuilder,
  WhyVexoSection,
  AddOnServicesSection,
  BookDateSection,
} from '../components/wedding';
import { WEDDING_STUDIO_INFO, DEFAULT_WEDDING_PLANS } from '../data/weddingData';
import { API_BASE_URL, adminPreWeddingApi } from '../admin/services/adminApiClient';
import { Skeleton } from '../components/ui/Skeleton';

export const PackagesPage: React.FC = () => {
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

  const studioInfo = preWeddingData?.studioInfo || WEDDING_STUDIO_INFO;
  const rawPackages = preWeddingData?.packages;
  const preWeddingPackages = rawPackages?.filter((p: any) => p.category !== 'WEDDING') || rawPackages;
  const weddingPlans =
    preWeddingData?.weddingPackages && preWeddingData.weddingPackages.length > 0
      ? preWeddingData.weddingPackages
      : rawPackages?.some((p: any) => p.category === 'WEDDING')
      ? rawPackages.filter((p: any) => p.category === 'WEDDING')
      : DEFAULT_WEDDING_PLANS;
  const allPackages = [
    ...(preWeddingPackages || []),
    ...(weddingPlans || []),
  ];

  const customServices = preWeddingData?.customServices;
  const addOns = preWeddingData?.addOns;
  const whyUsPillars = preWeddingData?.whyUsPillars;
  const heroStats = preWeddingData?.heroStats;
  const directorInfo = preWeddingData?.directorInfo;
  const processSteps = preWeddingData?.processSteps;
  const videos = preWeddingData?.videos;
  const portfolioGallery = preWeddingData?.portfolioGallery;
  const coverageTypes = preWeddingData?.coverageTypes;
  const coupleStories = preWeddingData?.coupleStories;
  const weddingDayStories = preWeddingData?.weddingDayStories;

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
      `Selected Custom Package Services:\n• ${services.join('\n• ')}\n\nEstimated Subtotal: ₹${totalEstimate.toLocaleString('en-IN')}`
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
      transition={{ duration: 0.5 }}
      className="cinematic-dark bg-[#050505] text-white min-h-screen"
    >
      {/* 1. Hero Section with 3 Quick Highlights Strip */}
      <WeddingHero
        studioInfo={studioInfo}
        heroStats={heroStats}
        onExplorePackages={scrollToPackages}
        onBookDate={scrollToBooking}
      />

      {/* 2. Wedding Day Stories Section (Editorial Gallery) */}
      <WeddingDayStoriesSection
        data={weddingDayStories}
        onViewStories={() => {
          const el = document.getElementById('portfolio-gallery') || document.getElementById('portfolio');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      />

      {/* 3. Curated Pre-Wedding Packages (Silver, Gold, Platinum) */}
      <div id="pre-wedding-packages">
        <PreWeddingPackagesSection
          packages={preWeddingPackages}
          whatsappNumber={studioInfo?.whatsappNumber}
          onSelectPackage={handleSelectPackage}
        />
      </div>

      {/* 4. Wedding Plans Section (Essential, Signature, Royal) */}
      <div id="wedding-plans-section">
        <WeddingPlansSection
          packages={weddingPlans}
          whatsappNumber={studioInfo?.whatsappNumber}
          onSelectPackage={handleSelectPackage}
        />
      </div>

      {/* 5. Process Workflow ("A clear process. A calm shoot day. Art that lasts.") */}
      <ProcessWorkflowSection processSteps={processSteps} />

      {/* 6. Featured Portfolio Gallery ("Stories Made For The Long After") */}
      <PortfolioGallerySection galleryItems={portfolioGallery} />

      {/* 7. About Lead Artist / Creative Director */}
      <DirectorAboutSection
        directorInfo={directorInfo}
        whatsappNumber={studioInfo?.whatsappNumber}
        onBookDiscovery={scrollToBooking}
      />

      {/* 8. Pre-Wedding Teasers & Cinematic Highlights (Video Player Grid) */}
      <VideoTeasersSection videos={videos} />

      {/* 9. Couple Stories / Testimonials Preview */}
      <CoupleStoriesSection coupleStories={coupleStories} />

      {/* 10. Coverage Designed Around Your Day */}
      <CoverageCategoriesSection
        coverageTypes={coverageTypes}
        onSelectCoverage={() => scrollToPackages()}
      />

      {/* 11. VEXO Signature Custom Package Builder */}
      <SignaturePackageBuilder
        customServices={customServices}
        addOns={addOns}
        studioInfo={studioInfo}
        onProceedToBooking={handleProceedToCustomBooking}
      />

      {/* 12. Add-On Services */}
      <AddOnServicesSection
        addOns={addOns}
        selectedAddOns={selectedAddOnIds}
        onToggleAddOn={handleToggleAddOn}
        onProceedToBooking={handleProceedToBooking}
      />

      {/* 13. Why VEXO Studio Pillars */}
      <WhyVexoSection pillars={whyUsPillars} />

      {/* 14. Book Date / Reservation Form */}
      <BookDateSection
        studioInfo={studioInfo}
        packages={allPackages}
        addOns={addOns}
        selectedPackageId={selectedPackageId}
        selectedAddOnIds={selectedAddOnIds}
        initialNotes={initialNotes}
      />
    </motion.div>
  );
};

export default PackagesPage;
