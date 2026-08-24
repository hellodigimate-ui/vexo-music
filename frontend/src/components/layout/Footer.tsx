import React from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Container } from '../ui/Container';
import { VexoLogo } from '../ui/VexoLogo';
import { MapPin, Phone, Mail, ArrowUp, ChevronRight } from 'lucide-react';
import { adminMockStore } from '../../admin/services/adminMockStore';

export const Footer: React.FC = () => {
  const [settings, setSettings] = React.useState({
    siteName: 'VEXO Music Entertainment',
    siteDescription:
      'A premier music entertainment powerhouse & record label specializing in original sound engineering, global music distribution, artist management, and cinematic audio-visual production based in Jaipur, India.',
    contactEmail: 'Contact@vexomusic.in',
    contactPhone: '+91 72399-99966',
    officeAddress: 'SKY CROWN, Office No. 205, Chordiya City, Kamla Nehru Nagar, Ajmer Road, Jaipur, Rajasthan 302021',
    copyrightText: '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
    socialInstagram: 'https://www.instagram.com/vexomusicentertainment',
    socialYoutube: 'https://youtube.com/@vexomusicentertainment',
    socialSpotify: 'https://spotify.com',
    socialTwitter: 'https://x.com/vexomusicentertainment',
  });

  React.useEffect(() => {
    try {
      const data = adminMockStore.getSiteSettings().data;
      if (data) {
        setSettings({
          siteName: data.siteName || 'VEXO Music Entertainment',
          siteDescription:
            data.siteDescription ||
            'A premier music entertainment powerhouse & record label specializing in original sound engineering, global music distribution, artist management, and cinematic audio-visual production based in Jaipur, India.',
          contactEmail: data.contactEmail || 'Contact@vexomusic.in',
          contactPhone: data.contactPhone || '+91 72399-99966',
          officeAddress:
            data.officeAddress ||
            'SKY CROWN, Office No. 205, Chordiya City, Kamla Nehru Nagar, Ajmer Road, Jaipur, Rajasthan 302021',
          copyrightText: data.copyrightText || '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
          socialInstagram: data.socialInstagram || 'https://www.instagram.com/vexomusicentertainment',
          socialYoutube: data.socialYoutube || 'https://youtube.com/@vexomusicentertainment',
          socialSpotify: data.socialSpotify || 'https://spotify.com',
          socialTwitter: data.socialTwitter || 'https://x.com/vexomusicentertainment',
        });
      }
    } catch (_) {}
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Music', path: '/music' },
    { label: 'Artists', path: '/artists' },
    { label: 'Services', path: '/services' },
    { label: 'Events', path: '/events' },
    { label: 'Videos', path: '/videos' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const servicesList = [
    { label: 'Music Production', path: '/services' },
    { label: 'Audio & Video Production', path: '/services' },
    { label: 'Artist Management', path: '/services' },
    { label: 'Music Distribution', path: '/services' },
    { label: 'Digital Marketing', path: '/services' },
    { label: 'Brand Collaborations', path: '/services' },
    { label: 'Pre-Wedding Shoot', path: '/services' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <footer className="bg-slate-50 dark:bg-[#060608] border-t border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 relative overflow-hidden transition-colors duration-300">
      {/* Minimalist Ambient Red Lighting Haze */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-vexo-red/5 dark:bg-vexo-red/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-vexo-red/3 dark:bg-vexo-red/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Footer Grid */}
      <Container className="py-14 lg:py-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12"
        >
          {/* Column 1: Brand & Bio (Span 4) */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-5">
            <Link
              to="/"
              className="flex items-center group focus:outline-none hover:opacity-90 transition-opacity duration-200 w-fit"
            >
              <VexoLogo size="lg" />
            </Link>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400 max-w-sm">
              {settings.siteDescription}
            </p>

            {/* Social Links with Tactile Bordered Buttons & Brand Themes */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={settings.socialInstagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram"
                className="apple-control-btn apple-social-insta"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a
                href={settings.socialYoutube}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                aria-label="YouTube"
                className="apple-control-btn apple-social-yt"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              <a
                href={settings.socialSpotify}
                target="_blank"
                rel="noopener noreferrer"
                title="Spotify"
                aria-label="Spotify"
                className="apple-control-btn apple-social-spotify"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </a>

              <a
                href={settings.socialTwitter}
                target="_blank"
                rel="noopener noreferrer"
                title="X / Twitter"
                aria-label="X (Twitter)"
                className="apple-control-btn apple-social-x"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Column 2: Quick Navigation Links (Span 2) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-900 dark:text-white border-l-2 border-vexo-red pl-2.5 flex items-center gap-1.5">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-200 py-0.5"
                  >
                    <ChevronRight className="w-3 h-3 text-vexo-red opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Services (Span 3) */}
          <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-900 dark:text-white border-l-2 border-vexo-red pl-2.5 flex items-center gap-1.5">
              Services
            </h4>
            <ul className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400">
              {servicesList.map((service, idx) => (
                <li key={idx}>
                  <Link
                    to={service.path}
                    className="group inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-200 py-0.5"
                  >
                    <ChevronRight className="w-3 h-3 text-vexo-red opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {service.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Studio Contact (Span 3) */}
          <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-900 dark:text-white border-l-2 border-vexo-red pl-2.5 flex items-center gap-1.5">
              Contact Us
            </h4>
            <div className="flex flex-col gap-3.5 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-start gap-2.5 group">
                <MapPin className="w-4 h-4 text-vexo-red shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                <span className="leading-relaxed">{settings.officeAddress}</span>
              </div>

              <div className="flex items-center gap-2.5 group">
                <Phone className="w-4 h-4 text-vexo-red shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors font-mono"
                >
                  {settings.contactPhone}
                </a>
              </div>

              <div className="flex items-center gap-2.5 group">
                <Mail className="w-4 h-4 text-vexo-red shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors font-mono"
                >
                  {settings.contactEmail}
                </a>
              </div>

              {/* Minimalist Live Status Badge */}
              <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>STUDIO ACTIVE • JAIPUR</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Minimalist Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-white/10 py-5 bg-slate-100 dark:bg-[#030305] relative z-10 transition-colors duration-300">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              © {new Date().getFullYear()}{' '}
              <span className="text-slate-900 dark:text-white font-bold">VEXO Music Entertainment</span>. All rights reserved.
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="group flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/10 hover:border-vexo-red/50 bg-white dark:bg-white/5 hover:bg-vexo-red/10 transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <span className="text-[11px] font-medium">Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 text-vexo-red" />
          </button>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
