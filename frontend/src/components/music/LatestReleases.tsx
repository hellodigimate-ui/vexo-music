import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageSection } from '../ui/PageSection';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { AlbumCard } from './AlbumCard';
import { TrackCard } from './TrackCard';
import { albumsApi, homepageApi } from '../../lib/api';
import type { Album, Track } from '../../types';
import { ArrowRight, Disc3, Music2, Layers, X } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { isTrackRepresentedInAlbums } from '../../lib/utils';

export const LatestReleases: React.FC = () => {
  const navigate = useNavigate();
  const [headingInfo, setHeadingInfo] = useState({
    title: 'LATEST RELEASES',
    subtitle: 'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
  });

  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'albums' | 'tracks'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTrackVideo, setActiveTrackVideo] = useState<{ title: string; artist: string; id: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      homepageApi.getHomepage(),
      albumsApi.getAlbums(),
      albumsApi.getTracks(),
    ])
      .then(([homeRes, albRes, trkRes]) => {
        if (!isMounted) return;

        const homeData = homeRes.data;
        const allAlbums: Album[] = albRes.data || [];
        const allTracks: Track[] = trkRes.data || [];

        setTracks(allTracks);

        if (homeData) {
          setHeadingInfo({
            title: homeData.releasesHeading || 'LATEST RELEASES',
            subtitle:
              homeData.releasesSubtitle ||
              'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
          });

          // Filter and reorder by selectedAlbumIds if provided
          const selectedIds = homeData.selectedAlbumIds;
          const limit = Number(homeData.releasesLimit) || 8;

          if (Array.isArray(selectedIds) && selectedIds.length > 0) {
            const orderedAlbums: Album[] = [];
            selectedIds.forEach((id: string) => {
              const found = allAlbums.find((a: Album) => a.id === id);
              if (found) orderedAlbums.push(found);
            });
            // If some selected not found, fill with remaining
            allAlbums.forEach((a: Album) => {
              if (!orderedAlbums.find((oa: Album) => oa.id === a.id)) {
                orderedAlbums.push(a);
              }
            });
            setAlbums(orderedAlbums.slice(0, limit));
          } else {
            setAlbums(allAlbums.slice(0, limit));
          }
        } else {
          setAlbums(allAlbums.slice(0, 8));
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Standalone tracks that aren't already displayed as full albums
  const standaloneTracks = tracks.filter((t) => {
    return !isTrackRepresentedInAlbums(t, albums);
  });

  return (
    <PageSection id="music" variant="bg" padding="lg">
      <SectionHeading
        badge="Fresh Audio Drops"
        title={headingInfo.title}
        subtitle={headingInfo.subtitle}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/music')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-extrabold text-xs uppercase tracking-wider border-vexo-red/40 hover:border-vexo-red"
          >
            VIEW ALL MUSIC
          </Button>
        }
      />

      {/* Release Category Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-vexo-red text-white shadow-lg shadow-vexo-red/30'
              : 'bg-white/5 text-vexo-muted hover:text-white hover:bg-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          All Releases ({albums.length + standaloneTracks.length})
        </button>

        <button
          onClick={() => setActiveTab('albums')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeTab === 'albums'
              ? 'bg-vexo-red text-white shadow-lg shadow-vexo-red/30'
              : 'bg-white/5 text-vexo-muted hover:text-white hover:bg-white/10'
          }`}
        >
          <Disc3 className="w-3.5 h-3.5" />
          Albums & EPs ({albums.length})
        </button>

        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeTab === 'tracks'
              ? 'bg-vexo-red text-white shadow-lg shadow-vexo-red/30'
              : 'bg-white/5 text-vexo-muted hover:text-white hover:bg-white/10'
          }`}
        >
          <Music2 className="w-3.5 h-3.5" />
          Tracks & Singles ({tracks.length})
        </button>
      </div>

      {/* Grid of Releases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))
        ) : activeTab === 'all' ? (
          <>
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
            {standaloneTracks.map((track) => (
              <TrackCard key={track.id} track={track} onPlay={handlePlayTrack} />
            ))}
          </>
        ) : activeTab === 'albums' ? (
          albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))
        ) : (
          tracks.map((track) => (
            <TrackCard key={track.id} track={track} onPlay={handlePlayTrack} />
          ))
        )}
      </div>

      {/* YouTube Video Player Modal */}
      {activeTrackVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveTrackVideo(null)}
        >
          <div
            className="cinematic-dark relative w-full max-w-4xl bg-neutral-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#0A0A0A]">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">{activeTrackVideo.title}</h3>
                <p className="text-xs text-vexo-muted font-medium">{activeTrackVideo.artist} • VEXO Music Entertainment</p>
              </div>
              <button
                onClick={() => setActiveTrackVideo(null)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-vexo-muted hover:text-white hover:bg-vexo-red transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* YouTube Responsive Embed Iframe */}
            <div className="relative aspect-video w-full bg-black">
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
    </PageSection>
  );
};

export default LatestReleases;
