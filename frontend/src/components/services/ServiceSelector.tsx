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
            type="button"
            onClick={() => onSelectService(service)}
            onMouseEnter={() => onSelectService(service)}
            className={cn(
              'group relative w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 flex items-center justify-between border cursor-pointer',
              isSelected
                ? 'bg-vexo-surface border-vexo-red/40 shadow-sm translate-x-1.5'
                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
            )}
          >
            {/* Left Accent Indicator Line */}
            <div
              className={cn(
                'absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-200',
                isSelected ? 'bg-vexo-red opacity-100' : 'opacity-0'
              )}
            />

            <div className="flex items-center gap-4 sm:gap-6 pl-2">
              {/* Number */}
              <span
                className={cn(
                  'font-mono text-base sm:text-lg font-bold transition-colors duration-200',
                  isSelected
                    ? 'text-vexo-red font-black'
                    : 'text-vexo-muted group-hover:text-vexo-white'
                )}
              >
                {service.number}
              </span>

              {/* Title */}
              <span
                className={cn(
                  'text-base sm:text-lg font-extrabold tracking-tight transition-colors duration-200',
                  isSelected
                    ? 'text-vexo-white font-black'
                    : 'text-vexo-white/70 group-hover:text-vexo-white'
                )}
              >
                {service.title}
              </span>
            </div>

            {/* Chevron Icon */}
            <ChevronRight
              className={cn(
                'w-5 h-5 transition-all duration-200 shrink-0',
                isSelected
                  ? 'text-vexo-red translate-x-1 opacity-100'
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
