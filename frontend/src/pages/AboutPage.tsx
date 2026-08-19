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
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const statistics = [
    { label: 'Total Global Streams', value: '50M+', icon: <Radio className="w-5 h-5 text-vexo-red-bright" /> },
    { label: 'Produced Tracks', value: '150+', icon: <Sliders className="w-5 h-5 text-vexo-red-bright" /> },
    { label: 'Managed Artists', value: '45+', icon: <Users className="w-5 h-5 text-vexo-red-bright" /> },
    { label: 'Global Live Tours', value: '10+', icon: <Globe2 className="w-5 h-5 text-vexo-red-bright" /> },
    { label: 'Client Satisfaction', value: '99.8%', icon: <Award className="w-5 h-5 text-vexo-red-bright" /> },
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
    <div className="pt-24 min-h-screen bg-vexo-bg pb-20">
      {/* 1. WHO WE ARE */}
      <PageSection variant="bg" padding="md">
        <Container>
          <SectionHeading
            badge="Who We Are"
            title="ABOUT VEXO MUSIC ENTERTAINMENT"
            subtitle="Pioneering the sound of tomorrow through original music production, artist management, and digital distribution."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center my-8 sm:my-10">
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-vexo-red/20 rounded-full blur-3xl pointer-events-none" />

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-vexo-red/10 text-vexo-red-bright border border-vexo-red/30 mb-4">
                <Disc className="w-3.5 h-3.5" /> Flagship Studio Hub
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
                Redefining the Global <span className="text-gradient-red">Sonic Landscape</span>
              </h2>

              <p className="text-vexo-muted text-sm leading-relaxed mb-4">
                Founded in Jaipur, Rajasthan, VEXO Music Entertainment is a multi-faceted record label, music production powerhouse, and artist management agency.
              </p>

              <p className="text-vexo-muted text-sm leading-relaxed mb-8">
                We combine state-of-the-art recording technology with futuristic audio engineering to craft chart-topping releases, cinematic music videos, and unforgettable live tour experiences for artists worldwide.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-vexo-red shrink-0" />
                  <span>100% Original Audio Productions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-vexo-red shrink-0" />
                  <span>Global Streaming & Copyright Protection</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-square sm:aspect-video lg:aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80"
                alt="VEXO Studio Setup"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono text-white bg-vexo-red/80 mb-2">
                    <Zap className="w-3 h-3" /> State of the Art Facilities
                  </div>
                  <h4 className="text-xl font-bold text-white">VEXO Flagship Recording Studio</h4>
                  <p className="text-xs text-vexo-muted mt-1">Jaipur, Rajasthan, India</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* 2. OUR STORY & 3. OUR VISION */}
      <PageSection padding="md" className="border-t border-white/5">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Our Story Card */}
            <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-vexo-red/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-2.5 rounded-xl bg-vexo-red/10 border border-vexo-red/20 text-vexo-red-bright">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-vexo-red">Chapter 01</span>
                </div>

                <h3 className="text-2xl font-black text-white mb-4">OUR STORY</h3>
                <p className="text-xs text-vexo-muted leading-relaxed mb-4">
                  VEXO Music Entertainment started with a singular mission in Jaipur: to build an ecosystem where independent artists receive top-tier production quality without compromising their creative freedom.
                </p>
                <p className="text-xs text-vexo-muted leading-relaxed">
                  Over the past decade, we expanded from an intimate mixing room into a comprehensive music enterprise spanning recording studios, video production sets, event logistics, and global digital distribution.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-vexo-muted">
                <span>Est. 2018</span>
                <span className="text-vexo-red-bright font-bold">Jaipur ➔ Global</span>
              </div>
            </div>

            {/* Our Vision Card */}
            <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-vexo-red-bright/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-2.5 rounded-xl bg-vexo-red/10 border border-vexo-red/20 text-vexo-red-bright">
                    <Flame className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-vexo-red">Chapter 02</span>
                </div>

                <h3 className="text-2xl font-black text-white mb-4">OUR VISION</h3>
                <p className="text-xs text-vexo-muted leading-relaxed mb-4">
                  We envision a future where boundaries between sound, visual artistry, and digital media dissolve. By pairing cutting-edge spatial audio with cinematic 4K visuals, we empower creators to stand out in the global music industry.
                </p>
                <p className="text-xs text-vexo-muted leading-relaxed">
                  Our commitment is to cultivate raw musical talent, protect intellectual property, and connect audiences with transformative acoustic experiences.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-vexo-muted">
                <span>Spatial Audio & 4K</span>
                <span className="text-vexo-red-bright font-bold">Empowering Independent Talent</span>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* 4. WHAT WE DO */}
      <PageSection padding="md" className="border-t border-white/5">
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
                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-vexo-red/50 hover:shadow-[0_0_25px_rgba(224,0,0,0.25)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="p-3 rounded-xl bg-vexo-red/10 border border-vexo-red/20 text-vexo-red-bright w-fit mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-extrabold text-base text-white mb-2 group-hover:text-vexo-red-bright transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-vexo-muted leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col gap-1.5 text-[11px] text-neutral-300">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-vexo-red" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </PageSection>

      {/* 5. STATISTICS */}
      <PageSection padding="md" className="border-t border-white/5 bg-[#080808]">
        <Container>
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-vexo-red uppercase tracking-widest block mb-1">Impact & Numbers</span>
            <h3 className="text-3xl font-black text-white">VEXO BY THE NUMBERS</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {statistics.map((stat, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center hover:border-vexo-red/40 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-vexo-red/10 border border-vexo-red/20 mb-3">
                  {stat.icon}
                </div>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1 text-gradient-red">
                  {stat.value}
                </span>
                <span className="text-xs font-mono text-vexo-muted uppercase tracking-wider">
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
          <div className="relative glass-panel p-8 sm:p-12 rounded-3xl border border-vexo-red/30 shadow-[0_0_50px_rgba(224,0,0,0.2)] text-center overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vexo-red/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-vexo-red/20 text-vexo-red-bright border border-vexo-red/40 mb-4">
                Ready to Record?
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                BRING YOUR MUSICAL VISION TO LIFE WITH VEXO
              </h2>

              <p className="text-xs sm:text-sm text-vexo-muted mb-8 leading-relaxed">
                Whether you need top-tier stem mixing, full video production, or international distribution, our production team is ready.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/contact')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs py-4 px-8"
                >
                  START YOUR PROJECT
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/services')}
                  className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs py-4 px-8"
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
