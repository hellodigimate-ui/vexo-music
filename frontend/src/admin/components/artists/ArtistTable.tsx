import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';
import { TableScrollSlider } from '../TableScrollSlider';

export interface ArtistTableProps {
  artists: any[];
  onToggleFeatured: (artist: any) => void;
  onTogglePublished: (artist: any) => void;
  onDelete: (artist: any) => void;
}

export const ArtistTable: React.FC<ArtistTableProps> = ({
  artists,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full max-w-full min-w-0 bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
      <div
        ref={scrollRef}
        className="w-full max-w-full overflow-x-auto scrollbar-thin touch-pan-x overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <table className="w-full text-left border-collapse min-w-[840px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[200px]">Artist</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[150px]">Slug</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[200px]">Role & Bio</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[160px]">Genres</th>
              <th className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap min-w-[130px]">Monthly Listeners</th>
              <th className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap min-w-[100px]">Featured</th>
              <th className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap min-w-[110px]">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap min-w-[90px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
            {artists.map((artist) => {
              const isPublished = !artist.isComingSoon;
              const initials = getInitials(artist.name);

              return (
                <tr
                  key={artist.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors group"
                >
                  {/* 1. Artist Monogram & Name */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {artist.avatarUrl ? (
                        <img
                          src={artist.avatarUrl}
                          alt={artist.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-zinc-700/80 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gradient-to-br dark:from-neutral-900 dark:via-[#16161f] dark:to-black border border-slate-200 dark:border-red-500/30 flex items-center justify-center text-xs font-mono font-bold text-vexo-red shadow-xs shrink-0 group-hover:border-vexo-red transition-colors">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0 max-w-[160px] sm:max-w-[200px]">
                        <p className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-vexo-red transition-colors truncate">
                          {artist.name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate">ID: {artist.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Slug Badge */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                      /{artist.slug || artist.name?.toLowerCase().replace(/\s+/g, '-')}
                    </span>
                  </td>

                  {/* 3. Role & Bio */}
                  <td className="py-4 px-4 sm:px-6 min-w-[200px] max-w-xs">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs truncate">{artist.role}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-500 line-clamp-1 mt-0.5 font-normal">
                      {artist.bio || 'No bio documented.'}
                    </p>
                  </td>

                  {/* 4. Genres */}
                  <td className="py-4 px-4 sm:px-6 min-w-[160px]">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {(Array.isArray(artist.genres) ? artist.genres : (artist.genres || '').split(',')).map(
                        (g: string, i: number) => {
                          const tag = g.trim();
                          if (!tag) return null;
                          return (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/80 text-[10px] font-mono text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/40 whitespace-nowrap shrink-0"
                            >
                              {tag}
                            </span>
                          );
                        }
                      )}
                    </div>
                  </td>

                  {/* 5. Monthly Listeners */}
                  <td className="py-4 px-4 sm:px-6 text-right font-mono text-slate-800 dark:text-zinc-300 whitespace-nowrap">
                    {(Number(artist.monthlyListeners) || 0).toLocaleString()}
                  </td>

                  {/* 6. Featured Toggle */}
                  <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                    <button
                      onClick={() => onToggleFeatured(artist)}
                      title={artist.featured ? 'Remove from Featured' : 'Mark as Featured'}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                        artist.featured
                          ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                          : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${artist.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{artist.featured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* 7. Published Status Toggle */}
                  <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                    <button
                      onClick={() => onTogglePublished(artist)}
                      title={isPublished ? 'Unpublish Artist (Set to Coming Soon)' : 'Publish Artist'}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                        isPublished
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-indigo-500/15 text-slate-600 dark:text-indigo-400 border border-slate-200 dark:border-indigo-500/30'
                      }`}
                    >
                      {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isPublished ? 'Published' : 'Coming Soon'}</span>
                    </button>
                  </td>

                  {/* 8. Action Controls */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/artists/${artist.id}/edit`)}
                        title="Edit Artist"
                        className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800/60 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-transparent transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDelete(artist)}
                        title="Delete Artist"
                        className="p-2 rounded-lg bg-slate-100 dark:bg-red-950/30 hover:bg-red-50 dark:hover:bg-red-900/50 text-slate-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-200 border border-slate-200 dark:border-red-900/30 transition-colors cursor-pointer"
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
      <TableScrollSlider scrollRef={scrollRef} />
    </div>
  );
};

export default ArtistTable;
