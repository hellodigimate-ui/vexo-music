import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { WHY_US_PILLARS, type WhyUsPillar } from '../../data/weddingData';
import {
  Film,
  Camera,
  Palette,
  Compass,
  HeartHandshake,
  Award,
  CheckCircle2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Film,
  Camera,
  Palette,
  Compass,
  HeartHandshake,
};

interface WhyVexoSectionProps {
  pillars?: WhyUsPillar[];
}

export const WhyVexoSection: React.FC<WhyVexoSectionProps> = ({
  pillars = WHY_US_PILLARS,
}) => {
  return (
    <section id="why-vexo" className="cinematic-dark relative py-24 bg-[#050505] overflow-hidden text-white border-t border-white/5">
      {/* Background glow accents */}
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-vexo-red/10 blur-[150px] rounded-full pointer-events-none opacity-20" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-xs font-mono font-bold tracking-widest uppercase mb-4"
          >
            <Award className="w-3.5 h-3.5 text-vexo-red" />
            <span>THE VEXO DIFFERENCE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
          >
            WHY <span className="text-vexo-red">VEXO WEDDING STUDIO</span>?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            We blend the artistry of cinema with heartfelt wedding documentation, ensuring your precious moments shine forever.
          </motion.p>
        </div>

        {/* 5 Pillars Layout: Top 3 Cards, Bottom 2 Wider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {pillars.slice(0, 3).map((pillar: WhyUsPillar, idx: number) => {
            const IconComp = ICON_MAP[pillar.icon] || Film;

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative p-8 rounded-2xl bg-[#0c0c0f] border border-white/10 hover:border-vexo-red/40 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(224,0,0,0.12)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-vexo-red/10 border border-vexo-red/20 text-vexo-red flex items-center justify-center group-hover:bg-vexo-red group-hover:text-white transition-all duration-300 group-hover:scale-105">
                      <IconComp className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-vexo-red uppercase px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-3 group-hover:text-vexo-red-bright transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-vexo-red" />
                  <span>VEXO Quality Guarantee</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom 2 Pillars (Wider cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {pillars.slice(3, 5).map((pillar: WhyUsPillar, idx: number) => {
            const IconComp = ICON_MAP[pillar.icon] || Film;

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                className="group relative p-8 rounded-2xl bg-[#0c0c0f] border border-white/10 hover:border-vexo-red/40 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(224,0,0,0.12)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-vexo-red/10 border border-vexo-red/20 text-vexo-red flex items-center justify-center group-hover:bg-vexo-red group-hover:text-white transition-all duration-300 group-hover:scale-105">
                      <IconComp className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-vexo-red uppercase px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-3 group-hover:text-vexo-red-bright transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-vexo-red" />
                  <span>Tailored Direction & Attention</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default WhyVexoSection;
