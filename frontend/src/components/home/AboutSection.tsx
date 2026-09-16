import React, { useState, useEffect } from 'react';
import { PageSection } from '../ui/PageSection';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Disc, ShieldCheck, ArrowRight } from 'lucide-react';
import { homepageApi } from '../../lib/api';
import { adminMockStore } from '../../admin/services/adminMockStore';

export const AboutSection: React.FC = () => {
  const navigate = useNavigate();
  const [aboutData, setAboutData] = useState(() => {
    const d = adminMockStore.getHomepage().data || {};
    return {
      badge: d.aboutBadge || 'ABOUT VEXO',
      heading: d.aboutHeading || 'VEXO MUSIC ENTERTAINMENT PVT. LTD.',
      subtitle:
        d.aboutHeading && d.aboutHeading !== 'VEXO MUSIC ENTERTAINMENT PVT. LTD.'
          ? d.aboutHeading
          : 'Pioneering original soundscapes, artist management, and digital distribution for the next generation.',
      description:
        d.aboutDescription ||
        'VEXO Music Entertainment Pvt. Ltd. is a premier music agency and record label headquartered in Jaipur, Rajasthan. We specialize in producing chart-topping commercial tracks, high-concept audio visualizers, and empowering recording artists with global digital distribution.',
      image:
        d.aboutImage ||
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    };
  });

  useEffect(() => {
    let isMounted = true;
    homepageApi.getHomepage().then((res) => {
      if (!isMounted || !res.data) return;
      const data = res.data;
      setAboutData({
        badge: data.aboutBadge || 'ABOUT VEXO',
        heading: data.aboutHeading || 'VEXO MUSIC ENTERTAINMENT PVT. LTD.',
        subtitle:
          data.aboutHeading && data.aboutHeading !== 'VEXO MUSIC ENTERTAINMENT PVT. LTD.'
            ? data.aboutHeading
            : 'Pioneering original soundscapes, artist management, and digital distribution for the next generation.',
        description:
          data.aboutDescription ||
          'VEXO Music Entertainment Pvt. Ltd. is a premier music agency and record label headquartered in Jaipur, Rajasthan. We specialize in producing chart-topping commercial tracks, high-concept audio visualizers, and empowering recording artists with global digital distribution.',
        image:
          data.aboutImage ||
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const paragraphs: string[] = aboutData.description.split('\n\n').filter(Boolean);

  return (
    <PageSection id="about" variant="bg" padding="lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left: Large Editorial Cinematic Image */}
        <div className="lg:col-span-6 relative aspect-square sm:aspect-video lg:aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
          <img
            src={aboutData.image}
            alt="VEXO Studio Setup"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Dark Overlay & Red Ambient Lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-vexo-red/20 rounded-full blur-3xl pointer-events-none" />

          {/* Bottom Badge */}
          <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-vexo-red/20 text-vexo-red-bright border border-vexo-red/30">
                <Disc className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">VEXO Flagship Studio</h4>
                <p className="text-xs text-vexo-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-vexo-red" /> Jaipur, Rajasthan, India
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Editorial Content */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <SectionHeading
            badge={aboutData.badge}
            title={aboutData.heading}
            subtitle={aboutData.subtitle}
          />

          {paragraphs.length > 0 ? (
            paragraphs.map((p: string, idx: number) => (
              <p
                key={idx}
                className={`text-vexo-muted text-sm sm:text-base leading-relaxed ${
                  idx === paragraphs.length - 1 ? 'mb-8' : 'mb-6'
                }`}
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-vexo-muted text-sm sm:text-base leading-relaxed mb-8">
              {aboutData.description}
            </p>
          )}

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-vexo-red/10 text-vexo-red-bright border border-vexo-red/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">100% Original Music</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-vexo-red/10 text-vexo-red-bright border border-vexo-red/20">
                <Disc className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Global Distribution</span>
            </div>
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/about')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider shadow-[0_0_25px_rgba(224,0,0,0.5)] hover:scale-105 transition-transform"
            >
              LEARN MORE ABOUT US
            </Button>
          </div>
        </div>
      </div>
    </PageSection>
  );
};

export default AboutSection;
