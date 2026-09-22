import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { Award, Calendar, Sparkles, MessageCircle } from 'lucide-react';
import type { PreWeddingDirectorInfo } from '../../data/weddingData';

interface DirectorAboutSectionProps {
  directorInfo?: PreWeddingDirectorInfo;
  whatsappNumber?: string;
  onBookDiscovery?: () => void;
}

export const DirectorAboutSection: React.FC<DirectorAboutSectionProps> = ({
  directorInfo,
  whatsappNumber = '917239999966',
  onBookDiscovery,
}) => {
  if (!directorInfo) return null;

  const scrollToBooking = () => {
    if (onBookDiscovery) {
      onBookDiscovery();
      return;
    }
    const el = document.getElementById('book-your-date') || document.getElementById('book-date');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${directorInfo.name}! I would love to schedule a pre-wedding / wedding discovery call with VEXO Studio.`
    );
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <section className="relative py-20 sm:py-28 bg-gradient-to-b from-[#050508] via-[#09080e] to-[#050508] text-white border-y border-white/5 overflow-hidden">
      {/* Soft warm glow in background */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Director Photo Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl group">
              <img
                src={directorInfo.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'}
                alt={directorInfo.name}
                className="w-full aspect-[4/5] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Bottom Badge inside photo */}
              <div className="absolute bottom-5 inset-x-5 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-vexo-red">
                    {directorInfo.experienceYears || '8+ Years Excellence'}
                  </p>
                  <p className="text-sm font-bold text-white">Sony Cinema Rig Specialist</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-vexo-red/20 border border-vexo-red/40 flex items-center justify-center text-vexo-red">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Quotes, Bio & Call To Action */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE VISIONARY BEHIND THE LENS</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-2">
                {directorInfo.name}
              </h2>
              <p className="text-xs sm:text-sm font-mono font-bold text-vexo-red uppercase tracking-wider">
                {directorInfo.title}
              </p>
            </div>

            {/* Editorial Quote */}
            <div className="relative pl-6 border-l-2 border-vexo-red/80 py-1">
              <p
                className="text-lg sm:text-2xl text-zinc-100 font-serif italic leading-relaxed"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                &ldquo;{directorInfo.quote}&rdquo;
              </p>
            </div>

            {/* Bio */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              {directorInfo.bio}
            </p>

            {/* Quick CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Button
                onClick={scrollToBooking}
                className="w-full sm:w-auto px-7 py-3.5 bg-vexo-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Discovery Call</span>
              </Button>

              <button
                type="button"
                onClick={openWhatsApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-vexo-red text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default DirectorAboutSection;
