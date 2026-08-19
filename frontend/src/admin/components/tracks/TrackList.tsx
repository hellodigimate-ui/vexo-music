import React from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Music,
  Disc3,
  Check,
  Headphones,
} from 'lucide-react';
import { formatTime } from '../../../lib/utils';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export interface TrackItem {
  id: string;
  title: string;
  artistName: string;
  albumId?: string;
  duration: number;
  coverUrl?: string;
  audioUrl?: string;
  spotifyUrl?: string;
  spotifyTrackId?: string;
  youtubeUrl?: string;
  genre?: string;
  order: number;
  published?: boolean;
  isPopular?: boolean;
}

interface TrackListProps {
  tracks: TrackItem[];
  albumTitle?: string;
  onAddTrack: () => void;
  onEditTrack: (track: TrackItem) => void;
  onDeleteTrack: (track: TrackItem) => void;
  onTogglePublish: (track: TrackItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isLoading?: boolean;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  albumTitle,
  onAddTrack,
  onEditTrack,
  onDeleteTrack,
  onTogglePublish,
  onMoveUp,
  onMoveDown,
  isLoading = false,
}) => {
  // Sort tracks by order
  const sortedTracks = [...tracks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-4">
      {/* Track List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              TRACKS
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {sortedTracks.length} {sortedTracks.length === 1 ? 'Track' : 'Tracks'}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              {albumTitle ? `Official tracklist for ${albumTitle}` : 'Manage track order, audio URLs, and visibility'}
            </p>
          </div>
        </div>

        <button
          onClick={onAddTrack}
          className="px-4 py-2 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(224,0,0,0.35)] transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Track</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 font-mono text-xs animate-pulse">
          Loading tracklist...
        </div>
      ) : sortedTracks.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Disc3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">No tracks added yet</p>
            <p className="text-xs text-zinc-500 mt-1">
              Add the first song to start populating this album's tracklist.
            </p>
          </div>
          <button
            onClick={onAddTrack}
            className="px-5 py-2.5 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(224,0,0,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Track</span>
          </button>
        </div>
      ) : (
        /* Tracks List */
        <div className="divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800/80 bg-[#0c0c11] overflow-hidden">
          {sortedTracks.map((track, index) => {
            const isFirst = index === 0;
            const isLast = index === sortedTracks.length - 1;
            const formattedNumber = String(index + 1).padStart(2, '0');
            const isPublished = track.published !== false;

            return (
              <div
                key={track.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Left: Reorder arrows, Number & Title */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Reorder Arrows */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => onMoveUp(index)}
                      title="Move track up"
                      className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => onMoveDown(index)}
                      title="Move track down"
                      className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Track Number Badge */}
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-300 group-hover:text-vexo-red-bright group-hover:border-vexo-red/30 transition-colors shrink-0">
                    {formattedNumber}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white truncate group-hover:text-vexo-red-bright transition-colors">
                        {track.title}
                      </p>
                      {track.isPopular && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Single
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-sans truncate mt-0.5">
                      {track.artistName} {track.genre ? `• ${track.genre}` : ''}
                    </p>
                  </div>
                </div>

                {/* Middle: Links & Duration */}
                <div className="flex items-center gap-4 shrink-0 pl-11 sm:pl-0">
                  {/* Streaming Badges */}
                  <div className="flex items-center gap-1.5">
                    {track.spotifyUrl && (
                      <a
                        href={track.spotifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Spotify Link"
                        className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {track.youtubeUrl && (
                      <a
                        href={track.youtubeUrl.startsWith('http') ? track.youtubeUrl : `https://youtu.be/${track.youtubeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        title="YouTube Video"
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-vexo-red-bright hover:bg-red-500/20 transition-colors"
                      >
                        <YoutubeIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {track.audioUrl && (
                      <span
                        title="Direct Audio Stream Available"
                        className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400"
                      >
                        <Disc3 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 w-16">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{formatTime(track.duration || 210)}</span>
                  </div>

                  {/* Publish Status Toggle */}
                  <button
                    type="button"
                    onClick={() => onTogglePublish(track)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPublished
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700 hover:text-white'
                    }`}
                  >
                    {isPublished ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{isPublished ? 'Published' : 'Draft'}</span>
                  </button>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditTrack(track)}
                      title="Edit Track"
                      className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTrack(track)}
                      title="Delete Track"
                      className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-vexo-red-bright hover:bg-red-500/10 hover:border-red-500/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackList;
