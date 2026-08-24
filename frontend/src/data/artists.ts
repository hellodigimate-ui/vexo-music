import type { Artist } from '../types';

export const mockFeaturedArtists: Artist[] = [
  {
    id: 'art-1',
    name: 'Rashmi Nishad',
    role: 'Lead Vocalist & Performing Artist',
    avatarUrl: '',
    genres: ['Traditional Folk', 'Contemporary Indian'],
    isComingSoon: false,
    followers: 245000,
    monthlyListeners: 245000,
  },
  {
    id: 'art-2',
    name: 'Sonu Charan Bhatt',
    role: 'Singer & Classical Folk Vocalist',
    avatarUrl: '',
    genres: ['Rajasthani Folk', 'Regional Commercial'],
    isComingSoon: false,
    followers: 198000,
    monthlyListeners: 198000,
  },
  {
    id: 'art-3',
    name: 'Cipher',
    role: 'Electronic Producer & DJ',
    avatarUrl: '',
    genres: ['Synthwave', 'Cyberpunk', 'Bass'],
    isComingSoon: false,
    followers: 125000,
    monthlyListeners: 420500,
  },
];
