import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';

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
    <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              <th className="py-3.5 px-6">Artist</th>
              <th className="py-3.5 px-6">Slug</th>
              <th className="py-3.5 px-6">Role & Bio</th>
              <th className="py-3.5 px-6">Genres</th>
              <th className="py-3.5 px-6 text-right">Monthly Listeners</th>
              <th className="py-3.5 px-6 text-center">Featured</th>
              <th className="py-3.5 px-6 text-center">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-xs">
            {artists.map((artist) => {
              const isPublished = !artist.isComingSoon;
              const initials = getInitials(artist.name);

              return (
                <tr
                  key={artist.id}
                  className="hover:bg-zinc-900/50 transition-colors group"
                >
                  {/* 1. Artist Monogram & Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {artist.avatarUrl ? (
                        <img
                          src={artist.avatarUrl}
                          alt={artist.name}
                          className="w-10 h-10 rounded-xl object-cover border border-zinc-700/80 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 via-[#16161f] to-black border border-red-500/30 flex items-center justify-center text-xs font-mono font-bold text-vexo-red-bright shadow-inner shrink-0 group-hover:border-vexo-red transition-colors">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs group-hover:text-vexo-red-bright transition-colors truncate">
                          {artist.name}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500">ID: {artist.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Slug Badge */}
                  <td className="py-4 px-6">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                      /{artist.slug || artist.name?.toLowerCase().replace(/\s+/g, '-')}
                    </span>
                  </td>

                  {/* 3. Role & Bio */}
                  <td className="py-4 px-6 max-w-xs">
                    <p className="font-semibold text-zinc-200 text-xs truncate">{artist.role}</p>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 font-normal">
                      {artist.bio || 'No bio documented.'}
                    </p>
                  </td>

                  {/* 4. Genres */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(Array.isArray(artist.genres) ? artist.genres : (artist.genres || '').split(',')).map(
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
                  </td>

                  {/* 5. Monthly Listeners */}
                  <td className="py-4 px-6 text-right font-mono text-zinc-300">
                    {(Number(artist.monthlyListeners) || 0).toLocaleString()}
                  </td>

                  {/* 6. Featured Toggle */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onToggleFeatured(artist)}
                      title={artist.featured ? 'Remove from Featured' : 'Mark as Featured'}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                        artist.featured
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${artist.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{artist.featured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* 7. Published Status Toggle */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onTogglePublished(artist)}
                      title={isPublished ? 'Unpublish Artist (Set to Coming Soon)' : 'Publish Artist'}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                        isPublished
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25'
                      }`}
                    >
                      {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isPublished ? 'Published' : 'Coming Soon'}</span>
                    </button>
                  </td>

                  {/* 8. Action Controls */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/artists/${artist.id}/edit`)}
                        title="Edit Artist"
                        className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDelete(artist)}
                        title="Delete Artist"
                        className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-900/30 transition-colors cursor-pointer"
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

export default ArtistTable;
