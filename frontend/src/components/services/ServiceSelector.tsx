import React from 'react';
import type { ServiceItem } from '../../types/service';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

export interface ServiceSelectorProps {
  services: ServiceItem[];
  selectedServiceId: string;
  onSelectService: (service: ServiceItem) => void;
  className?: string;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServiceId,
  onSelectService,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-2 select-none', className)}>
      {services.map((service) => {
        const isSelected = service.id === selectedServiceId;

        return (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            onMouseEnter={() => onSelectService(service)}
            className={cn(
              'group relative w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 flex items-center justify-between border cursor-pointer',
              isSelected
                ? 'bg-vexo-surface border-vexo-red/50 shadow-[0_0_25px_rgba(224,0,0,0.25)] translate-x-1.5'
                : 'bg-transparent border-white/5 hover:border-white/15 hover:bg-white/5'
            )}
          >
            {/* Left Accent Indicator Line */}
            <div
              className={cn(
                'absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-300',
                isSelected ? 'bg-gradient-to-b from-vexo-red-bright to-vexo-red opacity-100' : 'opacity-0'
              )}
            />

            <div className="flex items-center gap-4 sm:gap-6 pl-2">
              {/* Number */}
              <span
                className={cn(
                  'font-mono text-base sm:text-lg font-bold transition-colors duration-300',
                  isSelected
                    ? 'text-vexo-red-bright font-black drop-shadow-[0_0_8px_rgba(255,17,17,0.8)]'
                    : 'text-vexo-muted group-hover:text-white/70'
                )}
              >
                {service.number}
              </span>

              {/* Title */}
              <span
                className={cn(
                  'text-base sm:text-lg font-extrabold tracking-tight transition-colors duration-300',
                  isSelected
                    ? 'text-white'
                    : 'text-vexo-white/80 group-hover:text-white'
                )}
              >
                {service.title}
              </span>
            </div>

            {/* Chevron Icon */}
            <ChevronRight
              className={cn(
                'w-5 h-5 transition-all duration-300 shrink-0',
                isSelected
                  ? 'text-vexo-red-bright translate-x-1'
                  : 'text-vexo-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default ServiceSelector;
