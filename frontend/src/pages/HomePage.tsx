import React from 'react';
import { Hero } from '../components/layout';
import { FeaturedSingleBanner } from '../components/home/FeaturedSingleBanner';
import { LatestReleases } from '../components/music';
import { ServicesSection } from '../components/services';
import { FeaturedArtists } from '../components/artists';
import { AboutSection } from '../components/home/AboutSection';
import { StatsSection } from '../components/home/StatsSection';
import { FinalCTASection } from '../components/home/FinalCTASection';

export const HomePage: React.FC = () => {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Featured Single Release Banner (NEON BLOOD) */}
      <FeaturedSingleBanner />

      {/* 3. Latest Releases Section */}
      <LatestReleases />

      {/* 4. Services Section */}
      <ServicesSection />

      {/* 5. Featured Artists Section */}
      <FeaturedArtists />

      {/* 6. About VEXO Section */}
      <AboutSection />

      {/* 7. Statistics Section */}
      <StatsSection />

      {/* 8. Final CTA Section */}
      <FinalCTASection />
    </>
  );
};

export default HomePage;
