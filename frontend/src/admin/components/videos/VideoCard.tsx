import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Play,
  Star,
  Check,
  Clock,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import type { VideoItem } from './VideoTable';

interface VideoCardProps {
  video: VideoItem;
  onToggleFeatured: (video: VideoItem) => void;
  onTogglePublished: (video: VideoItem) => void;
  onDelete: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
}) => {
  const isPublished = video.published !== false;
  const isFeatured = Boolean(video.featured);

  return (
    <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs dark:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col group">
      {/* Video Poster with Play Overlay */}
      <div className="relative aspect-video bg-slate-100 dark:bg-zinc-950 overflow-hidden">
        <img
          src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-vexo-red/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(224,0,0,0.6)] transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md">
            {video.category}
          </span>
          {isFeatured && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/80 text-white border border-amber-400 backdrop-blur-md">
              Featured Hero
            </span>
          )}
        </div>

        {/* Duration Overlay */}
        <div className="absolute bottom-2 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span>{video.duration || '3:30'}</span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <NavLink
            to={`/admin/videos/${video.id}/edit`}
            className="font-bold text-sm text-slate-900 dark:text-white hover:text-vexo-red-bright transition-colors line-clamp-1 block"
          >
            {video.title}
          </NavLink>

          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium truncate">{video.artist}</p>

          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-500 dark:text-zinc-500">
            <span>{video.views ? `${video.views.toLocaleString()} views` : '0 views'}</span>
            <a
              href={`https://youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-vexo-red flex items-center gap-1"
            >
              <span>yt: {video.youtubeId}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          {/* Quick Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleFeatured(video)}
              title={isFeatured ? 'Set Standard' : 'Set Featured'}
              className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center transition-all cursor-pointer ${
                isFeatured
                  ? 'bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-500 border border-slate-200 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onTogglePublished(video)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}
            >
              {isPublished ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              <span>{isPublished ? 'Live' : 'Draft'}</span>
            </button>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to={`/admin/videos/${video.id}/edit`}
              title="Edit Video"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </NavLink>
            <button
              type="button"
              onClick={() => onDelete(video)}
              title="Delete Video"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-vexo-red-bright dark:hover:bg-red-500/10 transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
