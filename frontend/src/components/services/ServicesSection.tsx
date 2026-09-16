import React, { useState, useEffect } from 'react';
import { PageSection } from '../ui/PageSection';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { ServiceSelector } from './ServiceSelector';
import { ServicePreview } from './ServicePreview';
import { servicesApi } from '../../lib/api';
import { adminMockStore } from '../../admin/services/adminMockStore';
import { mockServicesList } from '../../data/services';
import type { ServiceItem } from '../../types/service';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../../lib/utils';

function mapStoreServiceToItem(s: any): ServiceItem {
  return {
    id: s.id,
    number: s.number || (s.order ? (s.order < 10 ? `0${s.order}` : `${s.order}`) : '01'),
    title: s.title,
    slug: s.slug || s.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    shortDesc: s.shortDesc || '',
    fullDesc: s.fullDesc || s.shortDesc || '',
    imageUrl: getMediaUrl(s.imageUrl) || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    icon: s.icon || 'Music',
    features: Array.isArray(s.features)
      ? s.features
      : typeof s.features === 'string'
      ? s.features.split('\n').map((f: string) => f.trim()).filter(Boolean)
      : [],
    category: s.category || 'Production',
    ctaText: s.ctaText || 'INITIATE PROJECT',
    pricingRange: s.pricingRange || undefined,
    order: s.order,
    isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
  };
}

export const ServicesSection: React.FC = () => {
  const navigate = useNavigate();

  const [servicesList, setServicesList] = useState<ServiceItem[]>(() => {
    try {
      const raw = (adminMockStore.getServices().data || []).filter((s: any) => s.isActive !== false);
      if (raw.length > 0) return raw.map(mapStoreServiceToItem);
    } catch {}
    return mockServicesList;
  });

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(() => {
    try {
      const raw = (adminMockStore.getServices().data || []).filter((s: any) => s.isActive !== false);
      if (raw.length > 0) return mapStoreServiceToItem(raw[0]);
    } catch {}
    return mockServicesList[0] || null;
  });

  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(() => {
    try {
      const raw = (adminMockStore.getServices().data || []).filter((s: any) => s.isActive !== false);
      if (raw.length > 0) return raw[0].id;
    } catch {}
    return mockServicesList[0]?.id || null;
  });

  useEffect(() => {
    let isMounted = true;
    servicesApi.getServicesList().then((res) => {
      if (isMounted && res.data && res.data.length > 0) {
        setServicesList(res.data);
        setSelectedService(res.data[0]);
        setExpandedMobileId(res.data[0].id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleMobileAccordion = (id: string) => {
    setExpandedMobileId(expandedMobileId === id ? null : id);
  };

  return (
    <PageSection id="services" variant="surface" padding="lg">
      <SectionHeading
        badge="WHAT WE DO"
        title="OUR SERVICES"
        subtitle="End-to-end music production, video creation, global distribution, and strategic artist management."
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/services')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-extrabold text-xs uppercase tracking-wider border-vexo-red/40 hover:border-vexo-red hidden sm:flex"
          >
            VIEW ALL SERVICES
          </Button>
        }
      />

      {/* Desktop Layout: 2-Column Split (List on Left, Preview on Right) */}
      {selectedService && (
        <div className="hidden lg:grid grid-cols-12 gap-8 lg:gap-12 items-stretch mt-8">
          {/* Left Column: Numbered Service List */}
          <div className="col-span-5 flex flex-col justify-center">
            <ServiceSelector
              services={servicesList}
              selectedServiceId={selectedService.id}
              onSelectService={setSelectedService}
            />
          </div>

          {/* Right Column: Large Cinematic Image/Video Preview */}
          <div className="col-span-7">
            <ServicePreview service={selectedService} />
          </div>
        </div>
      )}

      {/* Mobile Layout: Clean Accordion / Vertical Expandable List */}
      <div className="flex lg:hidden flex-col gap-4 mt-8">
        {servicesList.map((service) => {
          const isExpanded = expandedMobileId === service.id;

          return (
            <div
              key={service.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 transition-all duration-300"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleMobileAccordion(service.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`font-mono text-base font-black transition-colors ${
                      isExpanded ? 'text-vexo-red-bright' : 'text-vexo-muted'
                    }`}
                  >
                    {service.number}
                  </span>
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">{service.title}</span>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-vexo-muted transition-transform duration-300 ${
                    isExpanded ? 'rotate-180 text-vexo-red-bright' : ''
                  }`}
                />
              </button>

              {/* Accordion Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-white/5 animate-fadeIn flex flex-col gap-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden my-2">
                    <img
                      src={getMediaUrl(service.imageUrl)}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-vexo-muted leading-relaxed">
                    {service.fullDesc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                    {service.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-white/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-vexo-red-bright shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/contact')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full text-xs font-extrabold uppercase tracking-wider mt-2"
                  >
                    BOOK THIS SERVICE
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageSection>
  );
};

export default ServicesSection;
