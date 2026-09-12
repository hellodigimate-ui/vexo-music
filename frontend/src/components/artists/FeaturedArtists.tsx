import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageSection } from '../ui/PageSection';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { ArtistCard } from './ArtistCard';
import { artistsApi, homepageApi } from '../../lib/api';
import type { Artist } from '../../types';
import { Users } from 'lucide-react';

export const FeaturedArtists: React.FC = () => {
  const navigate = useNavigate();
  const [headingInfo, setHeadingInfo] = useState({
    title: 'FEATURED ARTISTS',
    subtitle: 'Discover the visionary producers, vocalists, and composers driving our sonic movement.',
  });

  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([homepageApi.getHomepage(), artistsApi.getArtists()]).then(([homeRes, artRes]) => {
      if (!isMounted) return;

      const homeData = homeRes.data;
      const allArtists: Artist[] = artRes.data || [];

      if (homeData) {
        setHeadingInfo({
          title: homeData.artistsHeading || 'FEATURED ARTISTS',
          subtitle:
            homeData.artistsSubtitle ||
            'Discover the visionary producers, vocalists, and composers driving our sonic movement.',
        });

        const selectedIds = homeData.featuredArtistIds;
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
          const orderedArtists: Artist[] = [];
          selectedIds.forEach((id: string) => {
            const found = allArtists.find((a: Artist) => a.id === id);
            if (found) orderedArtists.push(found);
          });
          allArtists.forEach((a: Artist) => {
            if (!orderedArtists.find((oa: Artist) => oa.id === a.id)) {
              orderedArtists.push(a);
            }
          });
          setArtists(orderedArtists.slice(0, 4));
        } else {
          setArtists(allArtists.slice(0, 4));
        }
      } else {
        setArtists(allArtists.slice(0, 4));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageSection id="artists" variant="surface" padding="lg">
      <SectionHeading
        badge="VEXO Roster"
        title={headingInfo.title}
        subtitle={headingInfo.subtitle}
        action={
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/artists')}
            leftIcon={<Users className="w-4 h-4 text-vexo-red-bright" />}
            className="font-extrabold text-xs uppercase tracking-wider hover:text-white"
          >
            VIEW ROSTER
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </PageSection>
  );
};

export default FeaturedArtists;
