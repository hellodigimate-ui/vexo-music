import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ServiceItem } from '../../types/service';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Disc3 } from 'lucide-react';
import { cn, getMediaUrl } from '../../lib/utils';

export interface ServicePreviewProps {
  service: ServiceItem;
  className?: string;
}

export const ServicePreview: React.FC<ServicePreviewProps> = ({ service, className }) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'cinematic-dark relative rounded-3xl overflow-hidden border border-white/10 shadow-xl flex flex-col justify-between h-full min-h-[480px] lg:min-h-[580px] bg-[#050505]',
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={service.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 select-none pointer-events-none"
        >
          {/* Large Cinematic Image Background */}
          <img
            src={getMediaUrl(service.imageUrl)}
            alt={service.title}
            className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.15]"
          />

          {/* Dark Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/60" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={service.id + '-content'}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 p-6 sm:p-10 flex flex-col justify-between h-full"
        >
          {/* Header Badge & Number */}
          <div className="flex items-center justify-between mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-vexo-red/20 text-vexo-red border border-vexo-red/30">
              <Disc3 className="w-3.5 h-3.5 text-vexo-red" /> SERVICE {service.number}
            </span>

            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 bg-black/60 px-3 py-1 rounded-full border border-white/10">
              {service.category}
            </span>
          </div>

          {/* Title & Description */}
          <div className="my-auto">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight mb-4 leading-tight">
              {service.title}
            </h3>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl text-balance">
              {service.fullDesc}
            </p>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {service.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-vexo-red shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/contact')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm hover:scale-105 transition-transform"
            >
              BOOK THIS SERVICE
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/services')}
              className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider hidden sm:flex"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ServicePreview;
