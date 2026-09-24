import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Camera, Film, Plane, ArrowRight } from 'lucide-react';
import type { PreWeddingCoverageType } from '../../data/weddingData';

interface CoverageCategoriesSectionProps {
  coverageTypes?: PreWeddingCoverageType[];
  onSelectCoverage?: (type: string) => void;
  title?: React.ReactNode;
  subtitle?: string;
  scrollTargetId?: string;
}

export const CoverageCategoriesSection: React.FC<CoverageCategoriesSectionProps> = ({
  coverageTypes = [],
  onSelectCoverage,
  title,
  subtitle = 'Specialized cinema teams and prime gear calibrated for each special chapter of your wedding celebration.',
  scrollTargetId,
}) => {
  if (!coverageTypes || coverageTypes.length === 0) return null;

  const getIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Camera className="w-6 h-6 text-vexo-red" />;
      case 1:
        return <Film className="w-6 h-6 text-amber-400" />;
      default:
        return <Plane className="w-6 h-6 text-cyan-400" />;
    }
  };

  const scrollToPackages = () => {
    if (scrollTargetId) {
      const el = document.getElementById(scrollTargetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    const el = document.getElementById('pre-wedding-packages') || document.getElementById('wedding-plans') || document.getElementById('packages');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative py-20 sm:py-24 bg-[#030305] text-white border-t border-white/5 overflow-hidden">
      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3"
          >
            {title || (
              <>
                COVERAGE DESIGNED <span className="text-vexo-red">AROUND YOUR DAY.</span>
              </>
            )}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {coverageTypes.map((cov, idx) => (
            <motion.div
              key={cov.id || idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-vexo-red/50 transition-all duration-300 flex flex-col justify-between group hover:shadow-2xl hover:shadow-black"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-vexo-red/10 border border-white/10 group-hover:border-vexo-red/30 flex items-center justify-center mb-6 transition-all">
                  {getIcon(idx)}
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-vexo-red/10 text-vexo-red border border-vexo-red/20 mb-3 inline-block">
                  {cov.tag}
                </span>

                <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-3 group-hover:text-vexo-red transition-colors">
                  {cov.title}
                </h3>

                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {cov.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSelectCoverage) onSelectCoverage(cov.title);
                  scrollToPackages();
                }}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-vexo-red group-hover:text-white transition-colors cursor-pointer"
              >
                <span>{cov.linkText || 'Explore Inclusions'}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default CoverageCategoriesSection;
