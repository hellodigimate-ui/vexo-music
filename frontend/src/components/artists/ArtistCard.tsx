import React from 'react';
import type { Artist } from '../../types';
import { cn, formatNumber } from '../../lib/utils';
import { SocialLinks } from '../ui/SocialLinks';
import { Music, Disc3, Mic2, Radio } from 'lucide-react';

export interface ArtistCardProps {
  artist: Artist;
  className?: string;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, className }) => {
  // Extract clean initials from artist name (e.g., "Rashmi Nishad" -> "RN", "Sonu Charan Bhatt" -> "SCB")
  const getInitials = (name: string) => {
    if (!name) return 'VXO';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.map((w) => w[0]).join('').slice(0, 3).toUpperCase();
  };

  const initials = getInitials(artist.name);

  // Determine icon based on role/genre
  const getArtistIcon = () => {
    const text = (artist.role + ' ' + (artist.genres || []).join(' ')).toLowerCase();
    if (text.includes('vocal') || text.includes('sing')) return <Mic2 className="w-5 h-5 text-vexo-red-bright" />;
    if (text.includes('producer') || text.includes('synth')) return <Disc3 className="w-5 h-5 text-vexo-red-bright animate-spin-slow" />;
    if (text.includes('folk') || text.includes('traditional')) return <Music className="w-5 h-5 text-vexo-red-bright" />;
    return <Radio className="w-5 h-5 text-vexo-red-bright" />;
  };

  return (
    <div
      className={cn(
        'cinematic-dark group relative bg-gradient-to-b from-[#15151e] via-[#0c0c11] to-[#050507] border border-white/10 rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-500 hover:border-vexo-red/60 hover:shadow-[0_0_40px_rgba(224,0,0,0.4)] flex flex-col justify-between p-6 select-none',
        className
      )}
    >
      {/* Background Decorative Music Elements & Radial Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Ambient Red Glows */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-vexo-red/15 rounded-full blur-[80px] group-hover:bg-vexo-red/25 transition-all duration-500" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-red-950/20 rounded-full blur-[80px]" />

        {/* Giant Monogram Watermark in Background */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-8xl sm:text-9xl font-black font-mono text-white/[0.03] group-hover:text-vexo-red/[0.08] transition-colors duration-500 select-none pointer-events-none tracking-tighter">
          {initials}
        </div>

        {/* Concentric Vinyl Grooves Pattern */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/[0.04] group-hover:border-vexo-red/10 transition-colors duration-500" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/[0.03] group-hover:border-vexo-red/10 transition-colors duration-500" />
      </div>

      {/* Optional Background Cover Artwork */}
      {artist.coverUrl && (
        <img
          src={artist.coverUrl}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-700 pointer-events-none"
        />
      )}

      {/* 1. TOP HEADER: Status Pill & Music Symbol */}
      <div className="relative z-10 flex items-center justify-between">
        {artist.isComingSoon || artist.name === 'Artist Coming Soon' ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-vexo-red/20 text-vexo-red-bright border border-vexo-red/40 shadow-[0_0_12px_rgba(224,0,0,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-vexo-red-bright animate-ping" />
            <span>Coming Soon</span>
          </div>
        ) : artist.monthlyListeners ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium text-neutral-300 bg-white/5 backdrop-blur-md border border-white/10 group-hover:border-vexo-red/30 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-vexo-red-bright shadow-[0_0_8px_#FF1111]" />
            <span>{formatNumber(artist.monthlyListeners)} Listeners</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium text-neutral-400 bg-white/5 border border-white/10">
            <Music className="w-3 h-3 text-vexo-red-bright" />
            <span>VEXO Roster</span>
          </div>
        )}

        {/* Small Audio Icon Pill */}
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-vexo-red/40 group-hover:bg-vexo-red/10 transition-all duration-300">
          {getArtistIcon()}
        </div>
      </div>

      {/* 2. CENTER: Glowing Avatar / Monogram Emblem Visual */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-4">
        <div className="relative mb-3">
          {/* Outer Pulsing Ring & Avatar Frame */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-white/15 flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] group-hover:border-vexo-red/60 group-hover:shadow-[0_0_35px_rgba(224,0,0,0.4)] group-hover:scale-105 transition-all duration-500 rotate-[-2deg] group-hover:rotate-0 overflow-hidden relative">
            {artist.avatarUrl ? (
              <img
                src={artist.avatarUrl}
                alt={artist.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white group-hover:text-vexo-red-bright transition-colors">
                  {initials}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500 mt-1">
                  ARTIST
                </span>
              </>
            )}
          </div>

          {/* Glowing Red Corner Spark */}
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-vexo-red shadow-[0_0_10px_#FF1111] opacity-75 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 3. BOTTOM INFO: Genre Pills, Bold Name, Role, and Social Links */}
      <div className="relative z-10 flex flex-col">
        {/* Genre Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {(artist.genres || []).slice(0, 2).map((genre, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider bg-vexo-red/15 text-vexo-red-bright border border-vexo-red/25 backdrop-blur-sm"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Artist Name */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-vexo-red-bright transition-colors duration-300 line-clamp-1 leading-snug">
          {artist.name}
        </h3>

        {/* Role Subtitle */}
        <p className="text-xs text-neutral-400 font-medium mt-0.5 line-clamp-1">
          {artist.role}
        </p>

        {/* Social Icons Bar on Hover */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {artist.socialLinks && artist.socialLinks.length > 0 ? (
            <SocialLinks links={artist.socialLinks} size="sm" variant="glass" />
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
              <span>OFFICIAL VEXO ARTIST</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
