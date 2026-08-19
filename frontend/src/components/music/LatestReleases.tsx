import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageSection } from '../ui/PageSection';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { AlbumCard } from './AlbumCard';
import { albumsApi, homepageApi } from '../../lib/api';
import { adminMockStore } from '../../admin/services/adminMockStore';
import type { Album } from '../../types';
import { ArrowRight } from 'lucide-react';

function mapStoreAlbumToPublic(a: any): Album {
  return {
    id: a.id,
    title: a.title,
    artist: a.artistName,
    year: a.year || (a.releaseDate ? new Date(a.releaseDate).getFullYear() : 2026),
    coverUrl: a.coverUrl,
    genre: a.genre || 'Electronic',
    spotifyUrl: a.spotifyUrl || '',
    youtubeUrl: a.youtubeUrl || '',
    trackCount: a.trackCount || a.tracks?.length || 1,
  };
}

export const LatestReleases: React.FC = () => {
  const navigate = useNavigate();
  const [headingInfo, setHeadingInfo] = useState(() => {
    const d = adminMockStore.getHomepage().data || {};
    return {
      title: d.releasesHeading || 'LATEST RELEASES',
      subtitle: d.releasesSubtitle || 'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
    };
  });

  const [albums, setAlbums] = useState<Album[]>(() => {
    try {
      const homeData = adminMockStore.getHomepage().data;
      const rawAlbums = adminMockStore.getAlbums().data || [];
      const allAlbums = rawAlbums.map(mapStoreAlbumToPublic);
      const selectedIds = homeData?.selectedAlbumIds;
      const limit = Number(homeData?.releasesLimit) || 4;

      if (Array.isArray(selectedIds) && selectedIds.length > 0) {
        const ordered: Album[] = [];
        selectedIds.forEach((id: string) => {
          const found = allAlbums.find((a) => a.id === id);
          if (found) ordered.push(found);
        });
        allAlbums.forEach((a) => {
          if (!ordered.find((oa) => oa.id === a.id)) {
            ordered.push(a);
          }
        });
        return ordered.slice(0, limit);
      }
      return allAlbums.slice(0, limit);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([homepageApi.getHomepage(), albumsApi.getAlbums()]).then(([homeRes, albRes]) => {
      if (!isMounted) return;

      const homeData = homeRes.data;
      const allAlbums = albRes.data || [];

      if (homeData) {
        setHeadingInfo({
          title: homeData.releasesHeading || 'LATEST RELEASES',
          subtitle:
            homeData.releasesSubtitle ||
            'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
        });

        // Filter and reorder by selectedAlbumIds if provided
        const selectedIds = homeData.selectedAlbumIds;
        const limit = Number(homeData.releasesLimit) || 4;

        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
          const orderedAlbums: Album[] = [];
          selectedIds.forEach((id) => {
            const found = allAlbums.find((a) => a.id === id);
            if (found) orderedAlbums.push(found);
          });
          // If some selected not found, fill with remaining
          allAlbums.forEach((a) => {
            if (!orderedAlbums.find((oa) => oa.id === a.id)) {
              orderedAlbums.push(a);
            }
          });
          setAlbums(orderedAlbums.slice(0, limit));
        } else {
          setAlbums(allAlbums.slice(0, limit));
        }
      } else {
        setAlbums(allAlbums.slice(0, 4));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </PageSection>
  );
};

export default LatestReleases;
