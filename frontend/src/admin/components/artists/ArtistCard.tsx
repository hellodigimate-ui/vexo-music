import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';

export interface AdminArtistCardProps {
  artist: any;
  onToggleFeatured: (artist: any) => void;
  onTogglePublished: (artist: any) => void;
  onDelete: (artist: any) => void;
}

export const AdminArtistCard: React.FC<AdminArtistCardProps> = ({
  artist,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
}) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    if (!name) return 'VXO';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  const isPublished = !artist.isComingSoon;
  const initials = getInitials(artist.name);

  return (
    <div className="bg-[#0e0e13] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all duration-300 group">
      {/* Top Row: Monogram + Name + Quick Toggles */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar or Monogram Emblem */}
          <div className="flex items-center gap-3">
            {artist.avatarUrl ? (
              <img
                src={artist.avatarUrl}
                alt={artist.name}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700/80 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-900 via-[#16161f] to-black border border-red-500/30 flex items-center justify-center text-sm font-mono font-bold text-vexo-red-bright shadow-inner shrink-0 group-hover:border-vexo-red transition-colors">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm group-hover:text-vexo-red-bright transition-colors truncate">
                {artist.name}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium truncate">{artist.role}</p>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {artist.featured && (
              <span className="p-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30" title="Featured Artist">
                <Star className="w-3 h-3 fill-amber-400" />
              </span>
            )}
          </div>
        </div>

        {/* Slug & Listeners */}
        <div className="flex items-center justify-between text-[11px] font-mono pt-1">
          <span className="text-zinc-500 truncate max-w-[150px]">/{artist.slug || artist.name?.toLowerCase().replace(/\s+/g, '-')}</span>
          <span className="text-zinc-300 font-bold">
            {(Number(artist.monthlyListeners) || 0).toLocaleString()} <span className="text-zinc-500 font-normal">listeners</span>
          </span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(artist.genres) ? artist.genres : (artist.genres || '').split(',')).slice(0, 3).map(
            (g: string, i: number) => {
              const tag = g.trim();
              if (!tag) return null;
              return (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-zinc-800/80 text-[10px] font-mono text-zinc-300 border border-zinc-700/40"
                >
                  {tag}
                </span>
              );
            }
          )}
        </div>
      </div>

      {/* Bottom Row: Quick Status Toggles & Actions */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Featured Toggle */}
          <button
            onClick={() => onToggleFeatured(artist)}
            title={artist.featured ? 'Remove from Featured' : 'Mark as Featured'}
            className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              artist.featured
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-zinc-900 text-zinc-600 hover:text-zinc-300 border border-zinc-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${artist.featured ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Published Toggle */}
          <button
            onClick={() => onTogglePublished(artist)}
            title={isPublished ? 'Unpublish' : 'Publish'}
            className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              isPublished
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
            }`}
          >
            {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/admin/artists/${artist.id}/edit`)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(artist)}
            className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-900/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminArtistCard;
