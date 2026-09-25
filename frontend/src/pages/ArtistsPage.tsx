import React, { useState, useEffect } from 'react';
import { PageSection } from '../components/ui/PageSection';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ArtistCard } from '../components/artists/ArtistCard';
import { artistsApi } from '../lib/api';
import type { Artist } from '../types';
import { Search, Users, Loader2 } from 'lucide-react';

export const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    artistsApi
      .getArtists()
      .then((res) => {
        if (isMounted) {
          if (res.data) setArtists(res.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setArtists([]);
          setIsLoading(false);
        }
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
    <div className="pt-24 min-h-screen bg-vexo-bg w-full max-w-full overflow-x-hidden">
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

        {/* Artists Grid or Loading / Empty States */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-vexo-red-bright" />
            <p className="text-xs font-mono tracking-wider uppercase">Loading Artists...</p>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-center border border-dashed border-white/10 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-wider">No Artists Found</p>
            <p className="text-xs text-zinc-400 max-w-sm">
              {searchQuery
                ? `No artists match your search query "${searchQuery}".`
                : 'No artists have been added to the roster yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </PageSection>
    </div>
  );
};

export default ArtistsPage;
