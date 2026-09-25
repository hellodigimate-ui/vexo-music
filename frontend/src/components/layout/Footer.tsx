import React from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Container } from '../ui/Container';
import { VexoLogo } from '../ui/VexoLogo';
import { MapPin, Phone, Mail, ArrowUp, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../admin/services/adminApiClient';
import { Skeleton } from '../ui/Skeleton';

interface FooterLinkItem {
  id?: string;
  label: string;
  path: string;
  isExternal?: boolean;
}

const DEFAULT_NAV_LINKS: FooterLinkItem[] = [
  { id: 'fn-1', label: 'Home', path: '/' },
  { id: 'fn-2', label: 'Music', path: '/music' },
  { id: 'fn-3', label: 'Artists', path: '/artists' },
  { id: 'fn-4', label: 'Services', path: '/services' },
  { id: 'fn-5', label: 'Pre-Wedding', path: '/pre-wedding' },
  { id: 'fn-6', label: 'Wedding', path: '/wedding' },
  { id: 'fn-7', label: 'Events', path: '/events' },
  { id: 'fn-8', label: 'Videos', path: '/videos' },
  { id: 'fn-9', label: 'About', path: '/about' },
  { id: 'fn-10', label: 'Contact', path: '/contact' },
];

const DEFAULT_SERVICES_LIST: FooterLinkItem[] = [
  { id: 'fs-1', label: 'Music Production', path: '/services' },
  { id: 'fs-2', label: 'Audio & Video Production', path: '/services' },
  { id: 'fs-3', label: 'Artist Management', path: '/services' },
  { id: 'fs-4', label: 'Music Distribution', path: '/services' },
  { id: 'fs-5', label: 'Digital Marketing', path: '/services' },
  { id: 'fs-6', label: 'Brand Collaborations', path: '/services' },
  { id: 'fs-7', label: 'Pre-Wedding Shoot', path: '/pre-wedding' },
  { id: 'fs-8', label: 'Wedding Cinematography', path: '/wedding' },
];

export const Footer: React.FC = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [settings, setSettings] = React.useState({
    siteName: 'VEXO Music Entertainment',
    siteDescription: '',
    footerBio: '',
    contactEmail: '',
    contactPhone: '',
    officeAddress: '',
    copyrightText: '',
    socialInstagram: 'https://www.instagram.com/vexomusicentertainment',
    socialFacebook: 'https://facebook.com',
    socialYoutube: 'https://youtube.com/@vexomusicentertainment',
    socialSpotify: 'https://spotify.com',
    socialTwitter: 'https://x.com/vexomusicentertainment',
    socialAppleMusic: 'https://music.apple.com',
    socialSoundcloud: '',
    footerQuickLinksHeading: 'QUICK LINKS',
    footerQuickLinks: DEFAULT_NAV_LINKS,
    footerServicesHeading: 'SERVICES',
    footerServicesLinks: DEFAULT_SERVICES_LIST,
    footerContactHeading: 'CONTACT US',
    footerStatusText: 'STUDIO ACTIVE • JAIPUR',
    footerStatusEnabled: true,
    footerBackToTopEnabled: true,
    footerAdminLinkEnabled: true,
  });

  React.useEffect(() => {
    // Fetch live site settings from the backend API so admin panel changes
    // are immediately reflected on the public website.
    fetch(`${API_BASE_URL}/site-settings`)
      .then((res) => res.json())
      .then(({ data }) => {
        if (!data) return;
        const rawPhone = data.contactPhone || '+91 72399 99966';
        const cleanPhone = rawPhone.includes('98290') ? '+91 72399 99966' : rawPhone;
        setSettings((prev) => ({
          ...prev,
          siteName: data.siteName || prev.siteName,
          siteDescription: data.siteDescription ?? prev.siteDescription,
          footerBio: data.footerBio ?? data.siteDescription ?? prev.footerBio,
          contactEmail: data.contactEmail || prev.contactEmail,
          contactPhone: cleanPhone,
          officeAddress: data.officeAddress || prev.officeAddress,
          copyrightText: data.copyrightText || prev.copyrightText,
          socialInstagram: data.socialInstagram || prev.socialInstagram,
          socialFacebook: data.socialFacebook || prev.socialFacebook,
          socialYoutube: data.socialYoutube || prev.socialYoutube,
          socialSpotify: data.socialSpotify || prev.socialSpotify,
          socialTwitter: data.socialTwitter || prev.socialTwitter,
          socialAppleMusic: data.socialAppleMusic || prev.socialAppleMusic,
          socialSoundcloud: data.socialSoundcloud || '',
          footerQuickLinksHeading: data.footerQuickLinksHeading || prev.footerQuickLinksHeading,
          footerQuickLinks: Array.isArray(data.footerQuickLinks)
            ? data.footerQuickLinks
            : prev.footerQuickLinks,
          footerServicesHeading: data.footerServicesHeading || prev.footerServicesHeading,
          footerServicesLinks: Array.isArray(data.footerServicesLinks)
            ? data.footerServicesLinks
            : prev.footerServicesLinks,
          footerContactHeading: data.footerContactHeading || prev.footerContactHeading,
          footerStatusText: data.footerStatusText || prev.footerStatusText,
          footerStatusEnabled:
            data.footerStatusEnabled !== undefined ? data.footerStatusEnabled : prev.footerStatusEnabled,
          footerBackToTopEnabled:
            data.footerBackToTopEnabled !== undefined ? data.footerBackToTopEnabled : prev.footerBackToTopEnabled,
          footerAdminLinkEnabled:
            data.footerAdminLinkEnabled !== undefined ? data.footerAdminLinkEnabled : prev.footerAdminLinkEnabled,
        }));
        setIsLoaded(true);
      })
      .catch(() => {
        // Fallback on network error
        setSettings((prev) => ({
          ...prev,
          siteDescription: 'A premier music entertainment powerhouse & record label specializing in original sound engineering, global music distribution, artist management, and cinematic audio-visual production based in Jaipur, India.',
          contactEmail: 'Contact@vexomusic.in',
          contactPhone: '+91 72399 99966',
          officeAddress: 'SKY CROWN, Office No. 205, Chordiya City, Kamla Nehru Nagar, Ajmer Road, Jaipur, Pin Code- 302021, Rajasthan, India',
        }));
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = settings.footerQuickLinks && settings.footerQuickLinks.length > 0 ? settings.footerQuickLinks : DEFAULT_NAV_LINKS;
  const servicesList = settings.footerServicesLinks && settings.footerServicesLinks.length > 0 ? settings.footerServicesLinks : DEFAULT_SERVICES_LIST;

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
    <footer className="w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-[#060608] border-t border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 relative transition-colors duration-300">
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

            {!isLoaded ? (
              <div className="space-y-2 max-w-sm py-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400 max-w-sm">
                {settings.footerBio || settings.siteDescription}
              </p>
            )}

            {/* Social Links with Tactile Bordered Buttons & Brand Themes */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {settings.socialInstagram && (
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
              )}

              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook"
                  aria-label="Facebook"
                  className="apple-control-btn apple-social-fb"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.5-.14-2.75-.14-2.8 0-4.75 1.7-4.75 4.9v2.6H7v4h3.25V22h3.75v-8.5z" />
                  </svg>
                </a>
              )}

              {settings.socialYoutube && (
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
              )}

              {settings.socialSpotify && (
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
              )}

              {settings.socialTwitter && (
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
              )}

              {settings.socialAppleMusic && (
                <a
                  href={settings.socialAppleMusic}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Apple Music"
                  aria-label="Apple Music"
                  className="apple-control-btn hover:bg-[#fa2d48]/10 hover:text-[#fa2d48]"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.03.62-2.67 1.37-.56.65-.98 1.7-0.85 2.72 1.03.08 2.05-.53 2.6-1.24z" />
                  </svg>
                </a>
              )}
            </div>
          </motion.div>

          {/* Column 2: Quick Navigation Links (Span 2) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-900 dark:text-white border-l-2 border-vexo-red pl-2.5 flex items-center gap-1.5">
              {settings.footerQuickLinksHeading || 'Quick Links'}
            </h4>
            <ul className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400">
              {navLinks.map((link, idx) => {
                const isExt = link.isExternal || link.path.startsWith('http');
                return (
                  <li key={link.id || idx}>
                    {isExt ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-200 py-0.5"
                      >
                        <ChevronRight className="w-3 h-3 text-vexo-red opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                          {link.label}
                        </span>
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="group inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-200 py-0.5"
                      >
                        <ChevronRight className="w-3 h-3 text-vexo-red opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                          {link.label}
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Column 3: Services (Span 3) */}
          <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-900 dark:text-white border-l-2 border-vexo-red pl-2.5 flex items-center gap-1.5">
              {settings.footerServicesHeading || 'Services'}
            </h4>
            <ul className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400">
              {servicesList.map((service, idx) => {
                const isExt = service.isExternal || service.path.startsWith('http');
                return (
                  <li key={service.id || idx}>
                    {isExt ? (
                      <a
                        href={service.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-200 py-0.5"
                      >
                        <ChevronRight className="w-3 h-3 text-vexo-red opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                          {service.label}
                        </span>
                      </a>
                    ) : (
                      <Link
                        to={service.path}
                        className="group inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-200 py-0.5"
                      >
                        <ChevronRight className="w-3 h-3 text-vexo-red opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                          {service.label}
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Column 4: Studio Contact (Span 3) */}
          <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-900 dark:text-white border-l-2 border-vexo-red pl-2.5 flex items-center gap-1.5">
              {settings.footerContactHeading || 'Contact Us'}
            </h4>
            <div className="flex flex-col gap-3.5 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-start gap-2.5 group">
                <MapPin className="w-4 h-4 text-vexo-red shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                {!isLoaded ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <span className="leading-relaxed">{settings.officeAddress}</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 group">
                <Phone className="w-4 h-4 text-vexo-red shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {!isLoaded ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors font-mono"
                  >
                    {settings.contactPhone}
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2.5 group">
                <Mail className="w-4 h-4 text-vexo-red shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {!isLoaded ? (
                  <Skeleton className="h-4 w-36" />
                ) : (
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors font-mono"
                  >
                    {settings.contactEmail}
                  </a>
                )}
              </div>

              {/* Minimalist Live Status Badge */}
              {settings.footerStatusEnabled !== false && (
                <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{settings.footerStatusText || 'STUDIO ACTIVE • JAIPUR'}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Minimalist Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-white/10 py-5 bg-slate-100 dark:bg-[#030305] relative z-10 transition-colors duration-300">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              {settings.copyrightText || `© ${new Date().getFullYear()} VEXO Music Entertainment. All rights reserved.`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {settings.footerAdminLinkEnabled !== false && (
              <Link
                to="/admin"
                className="text-[11px] font-mono text-slate-400 hover:text-vexo-red dark:text-zinc-500 dark:hover:text-vexo-red transition-colors flex items-center gap-1.5"
                title="VEXO Studio Admin & CMS Panel"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-vexo-red" />
                <span>Admin CMS</span>
              </Link>
            )}

            {settings.footerBackToTopEnabled !== false && (
              <button
                type="button"
                onClick={scrollToTop}
                className="group flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/10 hover:border-vexo-red/50 bg-white dark:bg-white/5 hover:bg-vexo-red/10 transition-all duration-200 cursor-pointer shadow-2xs"
              >
                <span className="text-[11px] font-medium">Back to Top</span>
                <ArrowUp className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 text-vexo-red" />
              </button>
            )}
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
