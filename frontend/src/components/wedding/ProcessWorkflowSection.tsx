import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Compass, Sparkles } from 'lucide-react';
import type { PreWeddingProcessStep } from '../../data/weddingData';

interface ProcessWorkflowSectionProps {
  processSteps?: PreWeddingProcessStep[];
}

export const ProcessWorkflowSection: React.FC<ProcessWorkflowSectionProps> = ({ processSteps = [] }) => {
  if (!processSteps || processSteps.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 bg-[#050508] text-white overflow-hidden">
      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-xs font-mono font-bold tracking-widest uppercase mb-4"
          >
            <Compass className="w-3.5 h-3.5 text-vexo-red" />
            <span>THE EXPERIENCE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
          >
            A CLEAR PROCESS. <span className="text-vexo-red">A CALM SHOOT DAY.</span> ART THAT LASTS.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            From the very first phone call to delivering your final handcrafted cinema cut, we keep every detail seamless, calm, and tailored to you.
          </motion.p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {processSteps.map((step, idx) => (
            <motion.div
              key={step.step || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="relative rounded-3xl bg-white/[0.03] border border-white/10 hover:border-vexo-red/40 p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-black/80 flex flex-col justify-between group"
            >
              {/* Number indicator */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-4xl sm:text-5xl font-black font-mono text-zinc-700 group-hover:text-vexo-red transition-colors duration-300">
                  {step.step || `0${idx + 1}`}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-vexo-red/20 border border-white/10 group-hover:border-vexo-red/40 flex items-center justify-center text-zinc-400 group-hover:text-vexo-red transition-all">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-white mb-3 group-hover:text-vexo-red transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Bottom decorative bar */}
              <div className="w-12 h-1 bg-white/10 group-hover:bg-vexo-red group-hover:w-full transition-all duration-500 rounded-full mt-8" />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default ProcessWorkflowSection;
