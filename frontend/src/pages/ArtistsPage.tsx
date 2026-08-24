import React, { useState, useEffect } from 'react';
import { PageSection } from '../components/ui/PageSection';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ArtistCard } from '../components/artists/ArtistCard';
import { artistsApi } from '../lib/api';
import { adminMockStore } from '../admin/services/adminMockStore';
import type { Artist } from '../types';
import { Search } from 'lucide-react';

function mapStoreArtistToPublic(a: any): Artist {
  return {
    id: a.id,
    name: a.name,
    role: a.role,
    avatarUrl: a.avatarUrl,
    coverUrl: a.coverUrl,
    bio: a.bio,
    monthlyListeners: a.monthlyListeners,
    followers: a.monthlyListeners,
    genres: Array.isArray(a.genres) ? a.genres : [],
    socialLinks: (a.socials || []).map((s: any) => ({
      platform: s.platform,
      url: s.url,
    })),
    isComingSoon: Boolean(a.isComingSoon),
  };
}

export const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>(() => {
    try {
      const raw = adminMockStore.getArtists().data || [];
      return raw.map(mapStoreArtistToPublic);
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    artistsApi.getArtists().then((res) => {
      if (isMounted && res.data) setArtists(res.data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArtists = artists.filter((artist) => {
    return (
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="pt-24 min-h-screen bg-vexo-bg">
      <PageSection variant="bg" padding="md">
        <SectionHeading
          badge="VEXO Roster"
          title="FEATURED ARTISTS & PRODUCERS"
          subtitle="Meet the visionary recording artists, sound composers, and multi-instrumentalists defining the VEXO sound."
        />

        {/* Search & Filter */}
        <div className="flex justify-end mb-10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-vexo-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search artists by name or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vexo-surface border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-vexo-muted outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </PageSection>
    </div>
  );
};

export default ArtistsPage;
