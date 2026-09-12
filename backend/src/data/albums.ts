import type { Album, Track } from '../types/index.js';

export const mockAlbums: Album[] = [
  {
    id: 'alb-2',
    title: 'Satane Lage Ho',
    artist: 'Rashmi Nishad & Sonu Charan Bhatt',
    coverUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
    releaseDate: '2026-08-04',
    year: 2026,
    genre: 'Rajasthani Traditional / Modern Folk',
    trackCount: 1,
    spotifyUrl: 'https://spotify.com',
    youtubeUrl: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02',
    appleMusicUrl: 'https://apple.com',
  },
  {
    id: 'alb-bhartar',
    title: 'Bhartar',
    artist: 'R Beer & Rashmi Nishad',
    coverUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
    releaseDate: '2026-08-24',
    year: 2026,
    genre: 'Rajasthani Traditional / Beat Song',
    trackCount: 1,
    spotifyUrl: 'https://spotify.com',
    youtubeUrl: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6',
    appleMusicUrl: 'https://apple.com',
  },
];

export const mockTracks: Track[] = [
  {
    id: 'trk-1',
    title: 'Satane Lage Ho (Official Single)',
    artist: 'Rashmi Nishad & Sonu Charan Bhatt',
    albumId: 'alb-2',
    duration: 254,
    coverUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
    genre: 'Rajasthani Folk / Contemporary',
    spotifyUrl: 'https://spotify.com',
    youtubeUrl: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02',
  },
  {
    id: 'trk-bhartar',
    title: 'Bhartar (Official Single)',
    artist: 'R Beer & Rashmi Nishad',
    albumId: 'alb-bhartar',
    duration: 236,
    coverUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
    genre: 'Rajasthani Traditional / Beat Song',
    spotifyUrl: 'https://spotify.com',
    youtubeUrl: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6',
  },
];
