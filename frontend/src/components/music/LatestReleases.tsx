import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageSection } from '../ui/PageSection';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { AlbumCard } from './AlbumCard';
import { albumsApi, homepageApi } from '../../lib/api';
import type { Album } from '../../types';
import { ArrowRight } from 'lucide-react';

export const LatestReleases: React.FC = () => {
  const navigate = useNavigate();
  const [headingInfo, setHeadingInfo] = useState({
    title: 'LATEST RELEASES',
    subtitle: 'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
  });

  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([homepageApi.getHomepage(), albumsApi.getAlbums()]).then(([homeRes, albRes]) => {
      if (!isMounted) return;

      const homeData = homeRes.data;
      const allAlbums: Album[] = albRes.data || [];

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
