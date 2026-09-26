import React, { useState, useEffect, useMemo } from 'react';
import { PageSection } from '../components/ui/PageSection';
import { SectionHeading } from '../components/ui/SectionHeading';
import { AlbumCard } from '../components/music/AlbumCard';
import { TrackCard } from '../components/music/TrackCard';
import { albumsApi } from '../lib/api';
import type { Album, Track } from '../types';
import { Search, Play, X, Music2, Disc3, Layers } from 'lucide-react';
import { formatTime, getMediaUrl, isTrackRepresentedInAlbums } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';

export const MusicPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCatalogTab, setActiveCatalogTab] = useState<'all' | 'albums' | 'tracks'>('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrackVideo, setActiveTrackVideo] = useState<{ title: string; artist: string; id: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([albumsApi.getAlbums(), albumsApi.getTracks()])
      .then(([albumRes, trackRes]) => {
        if (!isMounted) return;
        if (albumRes.data) setAlbums(albumRes.data);
        if (trackRes.data) setTracks(trackRes.data);
      })
      .catch((err) => {
        console.warn('Error loading music list:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>();
    albums.forEach((a) => {
      if (a.genre) {
        a.genre.split('/').forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    tracks.forEach((t) => {
      if (t.genre) {
        t.genre.split('/').forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return ['All', ...Array.from(set)];
  }, [albums, tracks]);

  const filteredAlbums = albums.filter((album) => {
    const genreStr = (album.genre || '').toLowerCase();
    const matchesGenre = selectedGenre === 'All' || genreStr.includes(selectedGenre.toLowerCase());
    const titleStr = (album.title || '').toLowerCase();
    const artistStr = (album.artist || (album as any).artistName || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || titleStr.includes(query) || artistStr.includes(query);
    return matchesGenre && matchesSearch;
  });

  const filteredTracks = tracks.filter((track) => {
    const genreStr = (track.genre || '').toLowerCase();
    const matchesGenre = selectedGenre === 'All' || genreStr.includes(selectedGenre.toLowerCase());
    const titleStr = (track.title || '').toLowerCase();
    const artistStr = (track.artist || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || titleStr.includes(query) || artistStr.includes(query);
    return matchesGenre && matchesSearch;
  });

  // Standalone tracks that aren't already represented as albums
  const standaloneFilteredTracks = filteredTracks.filter((t) => {
    return !isTrackRepresentedInAlbums(t, filteredAlbums);
  });

  const handlePlayTrack = (track: Track) => {
    const url = (track as any).youtubeUrl || track.audioUrl || '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const ytId = match
      ? match[1]
      : (track.title.toLowerCase().includes('bhartar') || track.id.includes('bhartar')
        ? 'PsmXAUKjR5Y'
        : (track.title.toLowerCase().includes('satane') || track.id === 'trk-1'
          ? 'HcEcM5AtEZ8'
          : 'PsmXAUKjR5Y'));

    setActiveTrackVideo({
      title: track.title,
      artist: track.artist,
      id: ytId,
    });
  };

  return (
    <div className="pt-24 min-h-screen bg-vexo-bg w-full max-w-full overflow-x-hidden">
      {/* Header Banner Section */}
      <PageSection variant="bg" padding="md">
        <SectionHeading
          badge="VEXO Discography"
          title="MUSIC CATALOG"
          subtitle="Explore official albums, singles, EPs, and original soundscapes from VEXO Music Entertainment."
        />

        {/* Release Type Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCatalogTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeCatalogTab === 'all'
                ? 'bg-vexo-red text-white shadow-lg shadow-vexo-red/30'
                : 'bg-white/5 text-vexo-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Releases ({filteredAlbums.length + standaloneFilteredTracks.length})
          </button>

          <button
            onClick={() => setActiveCatalogTab('albums')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeCatalogTab === 'albums'
                ? 'bg-vexo-red text-white shadow-lg shadow-vexo-red/30'
                : 'bg-white/5 text-vexo-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            Albums & EPs ({filteredAlbums.length})
          </button>

          <button
            onClick={() => setActiveCatalogTab('tracks')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeCatalogTab === 'tracks'
                ? 'bg-vexo-red text-white shadow-lg shadow-vexo-red/30'
                : 'bg-white/5 text-vexo-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            Tracks & Singles ({filteredTracks.length})
          </button>
        </div>

        {/* Genre Pills & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Genre Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-white/5 text-vexo-muted hover:text-white hover:bg-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-vexo-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search albums or tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vexo-surface border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-vexo-muted outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>
        </div>

        {/* Releases Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden p-3 border border-white/10 flex flex-col gap-3">
                <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                <div className="space-y-2 px-1 pb-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (activeCatalogTab === 'all' && filteredAlbums.length === 0 && standaloneFilteredTracks.length === 0) ||
            (activeCatalogTab === 'albums' && filteredAlbums.length === 0) ||
            (activeCatalogTab === 'tracks' && filteredTracks.length === 0) ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center border border-dashed border-white/10 rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
              <Music2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-wider">No Releases Found</p>
            <p className="text-xs text-zinc-400 max-w-sm">
              {searchQuery
                ? `No releases match "${searchQuery}".`
                : 'No releases available for this selection.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl">
            {activeCatalogTab === 'all' ? (
              <>
                {filteredAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
                {standaloneFilteredTracks.map((track) => (
                  <TrackCard key={track.id} track={track} onPlay={handlePlayTrack} />
                ))}
              </>
            ) : activeCatalogTab === 'albums' ? (
              filteredAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))
            ) : (
              filteredTracks.map((track) => (
                <TrackCard key={track.id} track={track} onPlay={handlePlayTrack} />
              ))
            )}
          </div>
        )}
      </PageSection>

      {/* Featured Tracks List */}
      <PageSection variant="surface" padding="lg">
        <SectionHeading
          badge="Popular Tracks"
          title="STREAMING TOP CHARTS"
          subtitle="Top played tracks and original productions across streaming platforms."
        />

        <div className="flex flex-col gap-3 max-w-7xl mx-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 border border-white/10"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1 max-w-xs">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-12 hidden md:block" />
                  <Skeleton className="w-9 h-9 rounded-full" />
                </div>
              </div>
            ))
          ) : tracks.map((track, idx) => {
            const trackCover =
              getMediaUrl(track.coverUrl) ||
              (track.title.toLowerCase().includes('bhartar')
                ? 'https://img.youtube.com/vi/PsmXAUKjR5Y/hqdefault.jpg'
                : (track.title.toLowerCase().includes('satane')
                  ? 'https://img.youtube.com/vi/HcEcM5AtEZ8/hqdefault.jpg'
                  : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'));

            return (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                className="glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 border border-white/10 hover:border-vexo-red/40 transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <span className="text-sm font-mono font-bold text-vexo-muted w-5 shrink-0 group-hover:text-vexo-red-bright">
                    0{idx + 1}
                  </span>

                  <img
                    src={trackCover}
                    alt={track.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://img.youtube.com/vi/PsmXAUKjR5Y/hqdefault.jpg';
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform bg-neutral-900 border border-white/10"
                  />

                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-white group-hover:text-vexo-red-bright transition-colors truncate">
                      {track.title}
                    </h4>
                    <p className="text-xs text-vexo-muted truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                  <span className="hidden md:inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-white/5 text-vexo-muted border border-white/10">
                    {track.genre || 'Single'}
                  </span>

                  <span className="text-xs font-mono text-vexo-muted">
                    {formatTime(track.duration)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                    className="p-2.5 rounded-full bg-vexo-red/10 text-vexo-red-bright hover:bg-vexo-red hover:text-white transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </PageSection>

      {/* Track Player Modal */}
      {activeTrackVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveTrackVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/50">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{activeTrackVideo.title}</h4>
                <p className="text-xs text-vexo-muted">{activeTrackVideo.artist}</p>
              </div>
              <button
                onClick={() => setActiveTrackVideo(null)}
                className="p-1 rounded-full hover:bg-white/10 text-vexo-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${activeTrackVideo.id}?autoplay=1&rel=0`}
                title={activeTrackVideo.title}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPage;
