import React from 'react';
import { cn } from '../../lib/utils';
import type { SocialLink } from '../../types';
import { Music, Disc, Radio, Globe } from 'lucide-react';

export interface SocialLinksProps {
  links?: SocialLink[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'glass' | 'solid';
  className?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  links = [
    { platform: 'spotify', url: '#' },
    { platform: 'youtube', url: '#' },
    { platform: 'instagram', url: '#' },
    { platform: 'twitter', url: '#' },
    { platform: 'apple', url: '#' },
  ],
  size = 'md',
  variant = 'glass',
  className,
}) => {
  const renderIcon = (platform: string) => {
    switch (platform) {
      case 'spotify':
        return <Music className="w-full h-full text-green-400" />;
      case 'youtube':
        return (
          <svg className="w-full h-full fill-current text-red-500" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-full h-full fill-none stroke-current stroke-2 text-pink-500" viewBox="0 0 24 24">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-full h-full fill-current text-sky-400" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'apple':
        return <Radio className="w-full h-full text-red-400" />;
      case 'soundcloud':
        return <Disc className="w-full h-full text-orange-500" />;
      default:
        return <Globe className="w-full h-full" />;
    }
  };

  const labelMap: Record<string, string> = {
    spotify: 'Spotify',
    youtube: 'YouTube',
    instagram: 'Instagram',
    twitter: 'Twitter / X',
    apple: 'Apple Music',
    soundcloud: 'SoundCloud',
  };

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
  };

  const variantClasses = {
    ghost:
      'bg-transparent text-vexo-muted hover:text-vexo-red-bright hover:bg-white/5',
    glass:
      'bg-white/5 backdrop-blur-md text-vexo-muted border border-white/10 hover:border-vexo-red/50 hover:text-white hover:bg-vexo-red/15 hover:shadow-[0_0_15px_rgba(224,0,0,0.3)]',
    solid:
      'bg-neutral-900 text-vexo-white hover:bg-vexo-red hover:text-white',
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={labelMap[link.platform] || link.platform}
          className={cn(
            'rounded-full inline-flex items-center justify-center transition-all duration-300',
            sizeClasses[size],
            variantClasses[variant]
          )}
        >
          {renderIcon(link.platform)}
          <span className="sr-only">{labelMap[link.platform]}</span>
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
