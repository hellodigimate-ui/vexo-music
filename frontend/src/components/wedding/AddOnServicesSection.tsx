import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { ADD_ON_SERVICES, type AddOnService, } from '../../data/weddingData';
import {
  Sparkles,
  Check,

  ArrowRight,
  ShieldCheck,
  Plane,
  Smartphone,
  Calendar,
  MapPin,
  BookOpen,
  Camera,
  Video,
  Shirt,

} from 'lucide-react';

interface AddOnServicesSectionProps {
  selectedAddOns?: string[];
  onToggleAddOn?: (id: string) => void;
  onProceedToBooking?: (selectedIds: string[]) => void;
  addOns?: AddOnService[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'addon-drone': Plane,
  'addon-reel': Smartphone,
  'addon-shoot-day': Calendar,
  'addon-location': MapPin,
  'addon-album': BookOpen,
  'addon-makeup': Sparkles,
  'addon-costume': Shirt,
  'addon-extra-photo': Camera,
  'addon-extra-cinema': Video,
};

export const AddOnServicesSection: React.FC<AddOnServicesSectionProps> = ({
  selectedAddOns: propSelectedAddOns,
  onToggleAddOn,
  onProceedToBooking,
  addOns = ADD_ON_SERVICES,
}) => {
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  const activeSelected = propSelectedAddOns ?? localSelected;

  const handleToggle = (id: string) => {
    if (onToggleAddOn) {
      onToggleAddOn(id);
    } else {
      setLocalSelected((prev: string[]) =>
        prev.includes(id) ? prev.filter((item: string) => item !== id) : [...prev, id]
      );
    }
  };

  const selectedTotal = addOns.filter((addon: AddOnService) =>
    activeSelected.includes(addon.id)
  ).reduce((sum: number, addon: AddOnService) => sum + addon.priceINR, 0);

  return (
    <section id="add-on-services" className="relative py-24 bg-[#07070a] overflow-hidden text-white border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-vexo-red/10 blur-[140px] rounded-full pointer-events-none opacity-20" />

      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-xs font-mono font-bold tracking-widest uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-vexo-red" />
            <span>ENHANCE YOUR EXPERIENCE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
          >
            ADD-ON <span className="text-vexo-red">SERVICES</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Customise your pre-wedding & wedding shoot package with our premium cinematic enhancements and luxury upgrades.
          </motion.p>
        </div>

        {/* Add-ons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {addOns.map((addon: AddOnService, idx: number) => {
            const isSelected = activeSelected.includes(addon.id);
            const IconComponent = ICON_MAP[addon.id] || Sparkles;

            return (
              <motion.div
                key={addon.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => handleToggle(addon.id)}
                className={`relative group cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-vexo-red/15 via-[#160a0c] to-[#0e0709] border-vexo-red shadow-[0_0_25px_rgba(224,0,0,0.18)]'
                    : 'bg-[#0c0c0f] hover:bg-[#121217] border-white/10 hover:border-vexo-red/40'
                }`}
              >
                {/* Header with Icon and Badge */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-vexo-red text-white shadow-lg shadow-vexo-red/30'
                          : 'bg-white/5 text-zinc-300 border border-white/10 group-hover:border-vexo-red/30'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-2">
                      {addon.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-vexo-red/15 text-vexo-red border border-vexo-red/30">
                          {addon.badge}
                        </span>
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-vexo-red border-vexo-red text-white'
                            : 'border-white/30 group-hover:border-vexo-red/50 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-vexo-red-bright transition-colors">
                    {addon.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {addon.description}
                  </p>
                </div>

                {/* Price Strip */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Estimated Cost</span>
                  <span className="text-base font-bold text-vexo-red">
                    {addon.priceDisplay}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Interactive Summary Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-vexo-red/10 via-[#14080a] to-vexo-red/10 border border-vexo-red/30 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {activeSelected.length > 0
                  ? `${activeSelected.length} Add-On${activeSelected.length > 1 ? 's' : ''} Selected`
                  : 'Select add-on services to enhance your coverage'}
              </h4>
              <p className="text-sm text-zinc-400">
                {activeSelected.length > 0
                  ? `Additional estimate: ₹${selectedTotal.toLocaleString('en-IN')} (final quote tailored to shoot requirements)`
                  : 'Click on any card above to include it in your customized wedding package.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {activeSelected.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (onToggleAddOn) {
                    activeSelected.forEach((id: string) => onToggleAddOn(id));
                  } else {
                    setLocalSelected([]);
                  }
                }}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer py-2 px-3"
              >
                Clear all
              </button>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full md:w-auto font-bold tracking-wide"
              onClick={() => {
                if (onProceedToBooking) {
                  onProceedToBooking(activeSelected);
                } else {
                  const el = document.getElementById('book-your-date') || document.getElementById('book-date');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <span>Proceed to Booking</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default AddOnServicesSection;
