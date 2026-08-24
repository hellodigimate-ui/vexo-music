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

export interface VideoItem {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  youtubeUrl?: string;
  thumbnailUrl: string;
  duration: string;
  views?: number;
  publishedAt: string;
  category: string;
  featured?: boolean;
  published?: boolean;
  description?: string;
  tags?: string[] | string;
  order?: number;
}

interface VideoTableProps {
  videos: VideoItem[];
  onToggleFeatured: (video: VideoItem) => void;
  onTogglePublished: (video: VideoItem) => void;
  onDelete: (video: VideoItem) => void;
}

export const VideoTable: React.FC<VideoTableProps> = ({
  videos,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
}) => {
  return (
    <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#121218] border-b border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <tr>
              <th className="py-3.5 px-6">Video & YouTube ID</th>
              <th className="py-3.5 px-6">Artist</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Duration & Views</th>
              <th className="py-3.5 px-6">Featured</th>
              <th className="py-3.5 px-6">Published</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {videos.map((video) => {
              const isPublished = video.published !== false;
              const isFeatured = Boolean(video.featured);

              return (
                <tr key={video.id} className="hover:bg-zinc-900/40 transition-colors group">
                  {/* Thumbnail & YouTube Link */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-10 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 group/thumb">
                        <img
                          src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="min-w-0 max-w-[220px]">
                        <NavLink
                          to={`/admin/videos/${video.id}/edit`}
                          className="font-bold text-white text-xs hover:text-vexo-red-bright transition-colors truncate block"
                        >
                          {video.title}
                        </NavLink>
                        <a
                          href={`https://youtube.com/watch?v=${video.youtubeId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-zinc-500 hover:text-red-400 inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>yt: {video.youtubeId}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Artist */}
                  <td className="py-4 px-6 font-semibold text-zinc-200">
                    {video.artist}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                      {video.category}
                    </span>
                  </td>

                  {/* Duration & Views */}
                  <td className="py-4 px-6 font-mono text-zinc-300">
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{video.duration || '3:30'}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {video.views ? `${video.views.toLocaleString()} views` : '0 views'}
                    </div>
                  </td>

                  {/* Featured Button */}
                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(video)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isFeatured
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{isFeatured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* Published Button */}
                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => onTogglePublished(video)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isPublished
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {isPublished ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <NavLink
                        to={`/admin/videos/${video.id}/edit`}
                        title="Edit Video"
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </NavLink>
                      <button
                        type="button"
                        onClick={() => onDelete(video)}
                        title="Delete Video"
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-vexo-red-bright hover:bg-red-500/10 hover:border-red-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoTable;
