import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { VexoLogo } from '../ui/VexoLogo';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';
import { adminMockStore } from '../../admin/services/adminMockStore';

export const Footer: React.FC = () => {
  const [settings, setSettings] = React.useState({
    siteName: 'VEXO Music Entertainment',
    siteDescription: 'About VEXO: A premier music entertainment hub & record label specializing in original sound production, music distribution, artist management, and immersive video production based in Jaipur, India.',
    contactEmail: 'Contact@vexomusic.in',
    contactPhone: '+91 72399-99966',
    officeAddress: 'SKY CROWN, Office No. 205, Chordiya City, Kamla Nehru Nagar, Ajmer Road, Jaipur, Pin Code- 302021',
    copyrightText: '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
    socialInstagram: 'https://www.instagram.com/vexomusicentertainment',
    socialYoutube: 'https://youtube.com',
    socialSpotify: 'https://spotify.com',
    socialTwitter: 'https://x.com/vexomusicentertainment',
  });

  React.useEffect(() => {
    try {
      const data = adminMockStore.getSiteSettings().data;
      if (data) {
        setSettings({
          siteName: data.siteName || 'VEXO Music Entertainment',
          siteDescription: data.siteDescription || 'About VEXO: A premier music entertainment hub & record label specializing in original sound production, music distribution, artist management, and immersive video production based in Jaipur, India.',
          contactEmail: data.contactEmail || 'Contact@vexomusic.in',
          contactPhone: data.contactPhone || '+91 72399-99966',
          officeAddress: data.officeAddress || 'SKY CROWN, Office No. 205, Chordiya City, Kamla Nehru Nagar, Ajmer Road, Jaipur, Pin Code- 302021',
          copyrightText: data.copyrightText || '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
          socialInstagram: data.socialInstagram || 'https://www.instagram.com/vexomusicentertainment',
          socialYoutube: data.socialYoutube || 'https://youtube.com',
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

  return (
    <footer className="bg-vexo-surface border-t border-white/10 text-vexo-white relative overflow-hidden">
      {/* Red Ambient Background Glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-vexo-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-vexo-red-bright/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Content */}
      <Container className="py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand & About VEXO */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 flex flex-col gap-5">
            <Link
              to="/"
              className="flex items-center group focus:outline-none hover:scale-105 transition-transform duration-300 w-fit"
            >
              <VexoLogo size="lg" />
            </Link>

            <p className="text-vexo-muted text-sm leading-relaxed max-w-md">
              {settings.siteDescription}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {/* Instagram */}
              <a
                href={settings.socialInstagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-vexo-muted hover:text-pink-400 hover:border-pink-400/50 hover:bg-pink-400/10 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={settings.socialYoutube}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-vexo-muted hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Spotify */}
              <a
                href={settings.socialSpotify}
                target="_blank"
                rel="noopener noreferrer"
                title="Spotify"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-vexo-muted hover:text-emerald-400 hover:border-emerald-400/50 hover:bg-emerald-400/10 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </a>

              {/* Twitter */}
              <a
                href={settings.socialTwitter}
                target="_blank"
                rel="noopener noreferrer"
                title="X / Twitter"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-vexo-muted hover:text-sky-400 hover:border-sky-400/50 hover:bg-sky-400/10 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-base text-white border-l-2 border-vexo-red pl-3 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-vexo-muted">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="hover:text-vexo-red-bright hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-base text-white border-l-2 border-vexo-red pl-3 uppercase tracking-wider text-xs">
              Services
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-vexo-muted">
              {servicesList.map((service, idx) => (
                <li key={idx}>
                  <Link
                    to={service.path}
                    className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-base text-white border-l-2 border-vexo-red pl-3 uppercase tracking-wider text-xs">
              Contact Us
            </h4>
            <div className="flex flex-col gap-3 text-sm text-vexo-muted">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-vexo-red shrink-0 mt-1" />
                <span>{settings.officeAddress}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-vexo-red shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-white transition-colors">
                  {settings.contactPhone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-vexo-red shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white transition-colors">
                  {settings.contactEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6 bg-[#050505] relative z-10">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-vexo-muted">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} <span className="text-white font-semibold">VEXO Music Entertainment</span>. All rights reserved.</span>
            <span>&bull;</span>
            <Link to="/admin" className="hover:text-vexo-red transition-colors text-[11px] font-mono">
              Admin Portal
            </Link>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-vexo-muted hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-full border border-white/10 transition-all duration-300"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
