import React from 'react';
import { PageSection } from '../components/ui/PageSection';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Disc,
  Globe2,
  Award,
  Users,
  Radio,
  Sliders,
  ArrowRight,
  TrendingUp,
  Flame,
  Zap,
  MapPin,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const statistics = [
    { label: 'Total Global Streams', value: '50M+', icon: <Radio className="w-5 h-5 text-vexo-red" /> },
    { label: 'Produced Tracks', value: '150+', icon: <Sliders className="w-5 h-5 text-vexo-red" /> },
    { label: 'Managed Artists', value: '45+', icon: <Users className="w-5 h-5 text-vexo-red" /> },
    { label: 'Global Live Tours', value: '10+', icon: <Globe2 className="w-5 h-5 text-vexo-red" /> },
    { label: 'Client Satisfaction', value: '99.8%', icon: <Award className="w-5 h-5 text-vexo-red" /> },
  ];

  const whatWeDoItems = [
    {
      title: 'Original Music Production',
      desc: 'Stem mixing, Dolby Atmos mastering, multi-genre beat crafting, and full-album executive production.',
      icon: <Sliders className="w-6 h-6 text-vexo-red" />,
      features: ['Analog SSL Console', 'Acoustic Soundproofing', 'Custom Sound Design'],
    },
    {
      title: 'Audio & 4K Video Production',
      desc: 'Cinematic music videos, 4K visualizers, pre-wedding shoots, and live multi-cam stage coverage.',
      icon: <Radio className="w-6 h-6 text-vexo-red" />,
      features: ['Color Grading', 'Drone Aerial Footage', 'VFX & Visual Sync'],
    },
    {
      title: 'Artist Management & Booking',
      desc: '360° artist development, tour routing, venue booking, and brand sponsorship curation.',
      icon: <Users className="w-6 h-6 text-vexo-red" />,
      features: ['Career Strategy', 'Tour Logistics', 'Brand Endorsements'],
    },
    {
      title: 'Global Music Distribution',
      desc: 'Direct-to-platform publishing on Spotify, Apple Music, YouTube Music, Amazon, and 150+ digital stores.',
      icon: <Globe2 className="w-6 h-6 text-vexo-red" />,
      features: ['ISRC Code Generation', 'Royalty Accounting', 'Playlist Pitching'],
    },
  ];

  return (
    <div className="pt-20 min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white pb-20 transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      {/* 1. WHO WE ARE */}
      <PageSection variant="bg" padding="md">
        <Container>
          <SectionHeading
            badge="Who We Are"
            title="ABOUT VEXO MUSIC ENTERTAINMENT"
            subtitle="Pioneering the sound of tomorrow through original music production, artist management, and digital distribution."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center my-8 sm:my-10">
            {/* Left Flagship Studio Card */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-red-50 dark:bg-vexo-red/10 text-vexo-red border border-red-200 dark:border-vexo-red/30">
                    <Disc className="w-3.5 h-3.5" /> Flagship Studio Hub
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white mb-6 leading-tight tracking-tight">
                  Redefining the Global <span className="text-vexo-red">Sonic Landscape</span>
                </h2>

                <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed mb-5 font-normal">
                  Founded in Jaipur, Rajasthan, VEXO Music Entertainment is a multi-faceted record label, music production powerhouse, and artist management agency dedicated to sonic excellence.
                </p>

                <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed mb-8 font-normal">
                  We combine state-of-the-art recording technology with futuristic audio engineering to craft chart-topping releases, cinematic music videos, and unforgettable live tour experiences for artists worldwide.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                <div className="flex items-center gap-2.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-vexo-red shrink-0" />
                  <span>100% Original Audio Productions</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold">
                  <Disc className="w-4 h-4 text-vexo-red shrink-0" />
                  <span>Global Streaming & Copyright Protection</span>
                </div>
              </div>
            </div>

            {/* Right Studio Image Frame */}
            <div className="relative aspect-square sm:aspect-video lg:aspect-square rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80"
                alt="VEXO Studio Setup"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-6 sm:p-8 pointer-events-none">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono text-white bg-vexo-red mb-2.5 font-bold shadow-md">
                    <Zap className="w-3.5 h-3.5 text-white" /> State of the Art Facilities
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">VEXO Entertainment Pvt Limited</h4>
                  <p className="text-xs sm:text-sm text-zinc-200 mt-1 font-mono drop-shadow-sm flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-4 h-4 text-vexo-red shrink-0 mt-0.5" />
                    <span>SKY CROWN, Office No. 205, Chordiya City, Kamla Nehru Nagar, Ajmer Road, Jaipur, Pin Code- 302021, Rajasthan, India</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* 2. OUR STORY & 3. OUR VISION */}
      <PageSection padding="md" className="border-t border-slate-200 dark:border-white/10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Our Story Card */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="p-2.5 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-100 dark:border-vexo-red/20 text-vexo-red">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-vexo-red font-bold">Chapter 01</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-5">
                  OUR STORY
                </h3>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed mb-5 font-normal">
                  VEXO Music Entertainment started with a singular mission in Jaipur: to build an ecosystem where independent artists receive top-tier production quality without compromising their creative freedom.
                </p>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Over the past decade, we expanded from an intimate mixing room into a comprehensive music enterprise spanning recording studios, video production sets, event logistics, and global digital distribution.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400 font-medium">
                <span>Est. 2018</span>
                <span className="text-vexo-red font-bold">Jaipur ➔ Global</span>
              </div>
            </div>

            {/* Our Vision Card */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="p-2.5 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-100 dark:border-vexo-red/20 text-vexo-red">
                    <Flame className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-vexo-red font-bold">Chapter 02</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-5">
                  OUR VISION
                </h3>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed mb-5 font-normal">
                  We envision a future where boundaries between sound, visual artistry, and digital media dissolve. By pairing cutting-edge spatial audio with cinematic 4K visuals, we empower creators to stand out in the global music industry.
                </p>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Our commitment is to cultivate raw musical talent, protect intellectual property, and connect audiences with transformative acoustic experiences.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400 font-medium">
                <span>Spatial Audio & 4K</span>
                <span className="text-vexo-red font-bold">Empowering Independent Talent</span>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* 4. WHAT WE DO */}
      <PageSection padding="md" className="border-t border-slate-200 dark:border-white/10">
        <Container>
          <SectionHeading
            badge="Full Suite Services"
            title="WHAT WE DO"
            subtitle="From initial songwriting and studio tracking to 4K music videos and global DSP distribution."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {whatWeDoItems.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl hover:border-vexo-red/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-100 dark:border-vexo-red/20 text-vexo-red w-fit mb-4 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-2 group-hover:text-vexo-red transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mb-6 font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2 text-xs text-slate-700 dark:text-zinc-300">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-vexo-red shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </PageSection>

      {/* 5. STATISTICS */}
      <PageSection padding="md" className="border-t border-slate-200 dark:border-white/10">
        <Container>
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-vexo-red uppercase tracking-widest block mb-1 font-bold">Impact & Numbers</span>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white">VEXO BY THE NUMBERS</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {statistics.map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl text-center flex flex-col items-center justify-center hover:border-vexo-red/40 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-100 dark:border-vexo-red/20 mb-3">
                  {stat.icon}
                </div>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight mb-1 font-mono">
                  {stat.value}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </PageSection>

      {/* 6. CALL TO ACTION (CTA) */}
      <PageSection padding="md">
        <Container>
          <div className="relative p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl text-center overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-vexo-red/20 text-vexo-red border border-red-200 dark:border-vexo-red/40 mb-4">
                Ready to Record?
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white leading-tight mb-4">
                BRING YOUR MUSICAL VISION TO LIFE WITH VEXO
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mb-8 leading-relaxed font-normal">
                Whether you need top-tier stem mixing, full video production, or international distribution, our production team is ready.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/contact')}
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                  className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs py-4 px-8 bg-vexo-red text-white hover:bg-red-700 shadow-sm rounded-xl"
                >
                  START YOUR PROJECT
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/services')}
                  className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs py-4 px-8 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl"
                >
                  EXPLORE SERVICES
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>
    </div>
  );
};

export default AboutPage;
