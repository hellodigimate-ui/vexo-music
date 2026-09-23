import React, { useState, useEffect } from 'react';
import { PageSection } from '../ui/PageSection';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { ServiceSelector } from './ServiceSelector';
import { ServicePreview } from './ServicePreview';
import { servicesApi } from '../../lib/api';
import type { ServiceItem } from '../../types/service';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../../lib/utils';
import { Skeleton } from '../ui/Skeleton';

export const ServicesSection: React.FC = () => {
  const navigate = useNavigate();

  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    servicesApi.getServicesList().then((res) => {
      if (isMounted) {
        if (res.data && res.data.length > 0) {
          setServicesList(res.data);
          setSelectedService(res.data[0]);
          setExpandedMobileId(res.data[0].id);
        }
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleMobileAccordion = (id: string) => {
    setExpandedMobileId((prev) => (prev === id ? null : id));
  };

  return (
    <PageSection id="services" variant="surface" padding="lg">
      <SectionHeading
        badge="STUDIO SUITE"
        title="SPECIALIZED PRODUCTION SERVICES"
        subtitle="From analog SSL mixing to 4K cinematic visualizers, explore our end-to-end entertainment production capabilities."
        action={
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/services')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-extrabold text-xs uppercase tracking-wider hover:text-white"
          >
            ALL SERVICES
          </Button>
        }
      />

      {/* Loading Skeleton */}
      {isLoading ? (
        <>
          <div className="hidden lg:grid grid-cols-12 gap-8 items-start mt-8">
            <div className="col-span-5 flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
            <div className="col-span-7">
              <Skeleton className="h-[420px] w-full rounded-3xl" />
            </div>
          </div>
          <div className="flex lg:hidden flex-col gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Desktop Layout: Split-Screen Interactive Selector */}
          {selectedService && (
            <div className="hidden lg:grid grid-cols-12 gap-8 items-start mt-8">
              <div className="col-span-5">
                <ServiceSelector
                  services={servicesList}
                  selectedServiceId={selectedService.id}
                  onSelectService={setSelectedService}
                />
              </div>

              <div className="col-span-7">
                <ServicePreview service={selectedService} />
              </div>
            </div>
          )}

          {/* Mobile Layout: Clean Accordion */}
          <div className="flex lg:hidden flex-col gap-4 mt-8">
            {servicesList.map((service) => {
              const isExpanded = expandedMobileId === service.id;
              return (
                <div
                  key={service.id}
                  className="glass-card rounded-2xl overflow-hidden border border-white/10 transition-all duration-300"
                >
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
        </>
      )}
    </PageSection>
  );
};

export default ServicesSection;
