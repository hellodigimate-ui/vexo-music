import React, { useState, useEffect } from 'react';
import type { Track } from '../../types';
import { Play, Clock } from 'lucide-react';
import { cn, formatTime, getMediaUrl } from '../../lib/utils';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export interface TrackCardProps {
  track: Track;
  className?: string;
  onPlay?: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, className, onPlay }) => {
  const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const ytId =
    getYoutubeId((track as any).youtubeUrl || track.audioUrl) ||
    (track.title?.toLowerCase().includes('bhartar') || track.id?.includes('bhartar')
      ? 'PsmXAUKjR5Y'
      : (track.title?.toLowerCase().includes('satane') || track.id === 'trk-1'
        ? 'HcEcM5AtEZ8'
        : null));

  const fallbackCover = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : (track.title?.toLowerCase().includes('satane')
      ? 'https://img.youtube.com/vi/HcEcM5AtEZ8/hqdefault.jpg'
      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80');

  const [coverSrc, setCoverSrc] = useState(
    getMediaUrl(track.coverUrl) || fallbackCover
  );

  useEffect(() => {
    setCoverSrc(getMediaUrl(track.coverUrl) || fallbackCover);
  }, [track.coverUrl, fallbackCover]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(track);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative bg-vexo-card border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-vexo-red/50 hover:shadow-[0_0_35px_rgba(224,0,0,0.35)] flex flex-col cursor-pointer w-full',
        className
      )}
    >
      {/* Artwork Container - 16:10 aspect ratio ensures widescreen YouTube thumbnails fit properly without aggressive cropping, and reduces image height */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
        <img
          src={coverSrc}
          alt={track.title}
          onError={() => {
            if (coverSrc !== fallbackCover) {
              setCoverSrc(fallbackCover);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover Dark Backdrop & Glass Blur */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <button
            onClick={handleCardClick}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-vexo-red to-vexo-red-bright text-white flex items-center justify-center shadow-[0_0_25px_rgba(224,0,0,0.7)] transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 hover:scale-110 cursor-pointer"
            aria-label={`Play ${track.title}`}
          >
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </button>
        </div>

        {/* Top Floating Badge */}
        <div className="absolute top-2.5 left-2.5 bg-vexo-red/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white border border-white/20 uppercase tracking-wider">
          Single
        </div>

        {/* YouTube / Media Indicator (Top Right) */}
        {((track as any).youtubeUrl || ytId) && (
          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md w-7 h-7 rounded-full flex items-center justify-center text-red-500 border border-white/10">
            <YoutubeIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-gradient-to-b from-vexo-card to-vexo-surface border-t border-slate-100 dark:border-white/5">
        <div>
          <h3 className="font-extrabold text-base text-slate-950 dark:text-white group-hover:text-vexo-red-bright transition-colors duration-300 line-clamp-1">
            {track.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-vexo-muted mt-1 font-medium line-clamp-1">
            {track.artist}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-slate-500 dark:text-vexo-muted">
          <span className="truncate max-w-[120px]">{track.genre || 'Single'}</span>
          <span className="flex items-center gap-1 text-vexo-red-bright shrink-0">
            <Clock className="w-3 h-3" />
            {formatTime(track.duration || 210)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
