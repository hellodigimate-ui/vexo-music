import React, { useState } from 'react';
import type { Album, Track } from '../../types';
import { Play, Music2, X, Disc3, Clock, Headphones, ListMusic } from 'lucide-react';
import { cn, formatTime } from '../../lib/utils';
import { albumsApi } from '../../lib/api';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export interface AlbumCardProps {
  album: Album;
  className?: string;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, className }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [activePlayTrack, setActivePlayTrack] = useState<Track | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  // Extract YouTube ID if available
  const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const defaultYoutubeId =
    getYoutubeId(album.youtubeUrl) ||
    (album.id === 'alb-1' || album.title?.toLowerCase().includes('satane') ? 'HcEcM5AtEZ8' : null);

  const fetchTracks = async () => {
    try {
      setIsLoadingTracks(true);
      const res = await albumsApi.getTracks();
      if (res.data) {
        const filtered = res.data.filter((t: any) => t.album === album.id || t.albumId === album.id);
        if (filtered.length > 0) {
          setAlbumTracks(filtered);
        } else {
          setAlbumTracks([
            {
              id: `${album.id}-trk-1`,
              title: album.title,
              artist: album.artist,
              album: album.id,
              coverUrl: album.coverUrl,
              duration: 210,
              genre: album.genre,
              audioUrl: (album as any).audioUrl || album.youtubeUrl || '',
              plays: 1250,
              likes: 95,
              isPopular: true,
            },
          ]);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const handleOpenAlbum = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchTracks();
    setIsOpenModal(true);
  };

  const handlePlayTrack = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePlayTrack(track);
  };

  const currentYoutubeId =
    getYoutubeId(activePlayTrack?.audioUrl || (activePlayTrack as any)?.youtubeUrl) ||
    defaultYoutubeId;

  return (
    <>
      <div
        className={cn(
          'group relative bg-vexo-card border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-vexo-red/50 hover:shadow-[0_0_35px_rgba(224,0,0,0.35)] flex flex-col cursor-pointer',
          className
        )}
        onClick={handleOpenAlbum}
      >
        {/* Artwork Container */}
        <div className="relative aspect-square overflow-hidden bg-neutral-900">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Hover Dark Backdrop & Glass Blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
            {/* Centered Play / View Tracks Button */}
            <button
              onClick={handleOpenAlbum}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-vexo-red to-vexo-red-bright text-white flex items-center justify-center shadow-[0_0_25px_rgba(224,0,0,0.7)] transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 hover:scale-110 cursor-pointer"
              aria-label={`View ${album.title} tracklist`}
            >
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </button>
          </div>

          {/* Top Floating Badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-vexo-muted border border-white/10">
            {album.year}
          </div>

          {/* Floating Social Platform Icons (Top Right) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
            {album.spotifyUrl && (
              <a
                href={album.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Listen on Spotify"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-black/70 border border-white/15 flex items-center justify-center text-green-400 hover:scale-110 hover:bg-green-500 hover:text-black transition-all"
              >
                <Music2 className="w-4 h-4" />
              </a>
            )}
            {album.youtubeUrl && (
              <a
                href={album.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Watch on YouTube"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-black/70 border border-white/15 flex items-center justify-center text-red-500 hover:scale-110 hover:bg-red-600 hover:text-white transition-all"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Album Info */}
        <div className="p-5 flex flex-col justify-between flex-1 bg-gradient-to-b from-vexo-card to-vexo-surface">
          <div>
            <h3 className="font-extrabold text-base text-white group-hover:text-vexo-red-bright transition-colors duration-300 line-clamp-1">
              {album.title}
            </h3>
            <p className="text-xs text-vexo-muted mt-1 font-medium line-clamp-1">
              {album.artist}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-vexo-muted">
            <span>{album.genre}</span>
            <span className="flex items-center gap-1 text-vexo-red-bright">
              <ListMusic className="w-3 h-3" />
              {album.trackCount || albumTracks.length || 1} Tracks
            </span>
          </div>
        </div>
      </div>

      {/* Album Detail & Database Tracks Modal */}
      {isOpenModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => {
            setIsOpenModal(false);
            setActivePlayTrack(null);
          }}
        >
          <div
            className="relative w-full max-w-3xl bg-[#0b0b10] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Dossier */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/10 shadow-xl shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-vexo-red-bright px-2.5 py-0.5 rounded-full bg-vexo-red/10 border border-vexo-red/20">
                      {album.genre}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">{album.year}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight mt-1">
                    {album.title}
                  </h3>
                  <p className="text-xs text-zinc-300 font-medium">By {album.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {album.spotifyUrl && (
                  <a
                    href={album.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    title="Spotify"
                  >
                    <Headphones className="w-4 h-4" />
                  </a>
                )}
                {album.youtubeUrl && (
                  <a
                    href={album.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-vexo-red-bright hover:bg-red-500/20 transition-colors"
                    title="YouTube"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setIsOpenModal(false);
                    setActivePlayTrack(null);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Player if playing */}
            {activePlayTrack && currentYoutubeId && (
              <div className="bg-black border-b border-white/10 p-4">
                <div className="relative aspect-video w-full max-h-64 rounded-xl overflow-hidden mx-auto">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${currentYoutubeId}?autoplay=1&rel=0`}
                    title={activePlayTrack.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between mt-3 px-2">
                  <div>
                    <p className="text-xs font-bold text-white uppercase">{activePlayTrack.title}</p>
                    <p className="text-[10px] text-zinc-400">{activePlayTrack.artist}</p>
                  </div>
                  <button
                    onClick={() => setActivePlayTrack(null)}
                    className="text-xs font-mono text-zinc-400 hover:text-white"
                  >
                    Close Player
                  </button>
                </div>
              </div>
            )}

            {/* TRACKS LIST SECTION */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between pb-2 border-b border-white/10">
                <span className="flex items-center gap-2">
                  <Disc3 className="w-3.5 h-3.5 text-vexo-red-bright" />
                  TRACKLIST ({albumTracks.length > 0 ? albumTracks.length : 1})
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">SELECT A TRACK TO STREAM</span>
              </h4>

              {isLoadingTracks ? (
                <div className="p-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
                  Loading album tracks...
                </div>
              ) : albumTracks.length === 0 ? (
                /* Fallback single track for album */
                <div
                  onClick={(e) =>
                    handlePlayTrack(
                      {
                        id: 'trk-1',
                        title: album.title,
                        artist: album.artist,
                        album: album.id,
                        coverUrl: album.coverUrl,
                        duration: 234,
                        genre: album.genre,
                        plays: 120000,
                        likes: 9600,
                        isPopular: true,
                      },
                      e
                    )
                  }
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-vexo-red/40 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-zinc-900 flex items-center justify-center font-mono font-bold text-xs text-zinc-400 group-hover:text-vexo-red-bright">
                      01
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-vexo-red-bright transition-colors truncate">
                        {album.title} (Official Track)
                      </p>
                      <p className="text-xs text-zinc-400">{album.artist}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-full bg-vexo-red/20 text-vexo-red-bright group-hover:bg-vexo-red group-hover:text-white transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ) : (
                /* Database Tracks */
                <div className="divide-y divide-white/5 rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                  {albumTracks.map((trk, idx) => {
                    const formattedNumber = String(idx + 1).padStart(2, '0');
                    return (
                      <div
                        key={trk.id}
                        onClick={(e) => handlePlayTrack(trk, e)}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center font-mono font-bold text-xs text-zinc-400 group-hover:text-vexo-red-bright transition-colors shrink-0">
                            {formattedNumber}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white group-hover:text-vexo-red-bright transition-colors truncate">
                              {trk.title}
                            </p>
                            <p className="text-xs text-zinc-400 font-sans truncate mt-0.5">
                              {trk.artist}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(trk.duration || 210)}</span>
                          </div>
                          <button
                            onClick={(e) => handlePlayTrack(trk, e)}
                            className="p-2 rounded-full bg-vexo-red/10 text-vexo-red-bright group-hover:bg-vexo-red group-hover:text-white transition-colors cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlbumCard;
