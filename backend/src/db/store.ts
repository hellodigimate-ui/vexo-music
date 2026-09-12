import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword, generateId } from '../lib/crypto.js';
import type {
  AdminUser,
  Artist,
  ArtistSocial,
  Album,
  Track,
  Event,
  EventArtist,
  Video,
  Service,
  Media,
  ContactRequest,
  Homepage,
  SiteSettings,
  ActivityLog,
  DatabaseSchema,
} from './types.js';
import { mockServices } from '../data/services.js';
import {
  initPostgresSync,
  syncServiceToPostgres,
  deleteServiceFromPostgres,
  syncContactRequestToPostgres,
  deleteContactRequestFromPostgres,
  syncArtistToPostgres,
  deleteArtistFromPostgres,
} from './postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'vexo_db.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  const now = new Date().toISOString();

  const defaultAdmin: AdminUser = {
    id: 'admin-super-1',
    email: process.env.ADMIN_EMAIL || 'admin@vexomusic.com',
    passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'admin'),
    name: 'VEXO Executive Admin',
    role: 'SUPER_ADMIN',
    isActive: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const defaultEditor: AdminUser = {
    id: 'admin-editor-1',
    email: 'editor@vexomusic.com',
    passwordHash: hashPassword('editor'),
    name: 'VEXO Content Editor',
    role: 'EDITOR',
    isActive: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const initialArtists: Artist[] = [
    {
      id: 'art-1',
      name: 'Cipher',
      slug: 'cipher',
      role: 'Electronic Producer & DJ',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: 'Pioneering heavy cyber-synth aesthetics and multi-genre bass architectures for stadium festivals worldwide.',
      monthlyListeners: 420500,
      genres: ['Synthwave', 'Cyberpunk', 'Bass'],
      featured: true,
      isComingSoon: false,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'art-2',
      name: 'Rashmi Nishad',
      slug: 'rashmi-nishad',
      role: 'Vocalist & Performing Artist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      coverUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
      bio: 'Lead vocalist of the hit official release "Satane Lage Ho". Blending soul-stirring vocal melodies with contemporary Indian production.',
      monthlyListeners: 185200,
      genres: ['Traditional Folk', 'Contemporary Indian', 'Sufi'],
      featured: true,
      isComingSoon: false,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'art-3',
      name: 'Sonu Charan Bhatt',
      slug: 'sonu-charan-bhatt',
      role: 'Singer & Folk Vocalist',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      coverUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
      bio: 'Co-lead artist on "Satane Lage Ho", celebrated for evocative lyrical styling and energetic stage presence.',
      monthlyListeners: 142000,
      genres: ['Rajasthani Folk', 'Regional Commercial', 'Fusion'],
      featured: true,
      isComingSoon: false,
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'art-rbeer',
      name: 'R Beer',
      slug: 'r-beer',
      role: 'Singer, Lyricist & Music Director',
      avatarUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
      coverUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
      bio: 'Multi-talented artist, singer, and lyricist behind the chartbuster release "Bhartar", collaborating with Rashmi Nishad and VEXO Music Entertainment.',
      monthlyListeners: 165000,
      genres: ['Rajasthani Folk', 'Contemporary Beat', 'Folk Pop'],
      featured: true,
      isComingSoon: false,
      order: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'art-5',
      name: 'Aria Thorne',
      slug: 'aria-thorne',
      role: 'Vocalist & Songwriter',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      bio: 'Ambient soul enchantress weaving haunting vocal harmonies through intricate analog soundbeds.',
      monthlyListeners: 620000,
      genres: ['Ambient Soul', 'Indie Electronic'],
      featured: false,
      isComingSoon: false,
      order: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'art-6',
      name: 'EchoPulse',
      slug: 'echopulse',
      role: 'Sound Architect & Mixing Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      bio: 'Master of low frequencies and psychoacoustic spatial design.',
      monthlyListeners: 290100,
      genres: ['Dark Electro', 'Experimental Bass'],
      featured: false,
      isComingSoon: false,
      order: 6,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialSocials: ArtistSocial[] = [
    { id: 'soc-1', artistId: 'art-1', platform: 'spotify', url: 'https://spotify.com', order: 1, createdAt: now, updatedAt: now },
    { id: 'soc-2', artistId: 'art-1', platform: 'instagram', url: 'https://instagram.com', order: 2, createdAt: now, updatedAt: now },
    { id: 'soc-3', artistId: 'art-1', platform: 'youtube', url: 'https://youtube.com', order: 3, createdAt: now, updatedAt: now },
    { id: 'soc-4', artistId: 'art-2', platform: 'youtube', url: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02', order: 1, createdAt: now, updatedAt: now },
    { id: 'soc-5', artistId: 'art-2', platform: 'instagram', url: 'https://instagram.com', order: 2, createdAt: now, updatedAt: now },
    { id: 'soc-6', artistId: 'art-3', platform: 'youtube', url: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02', order: 1, createdAt: now, updatedAt: now },
    { id: 'soc-7', artistId: 'art-3', platform: 'instagram', url: 'https://instagram.com', order: 2, createdAt: now, updatedAt: now },
    { id: 'soc-rbeer-yt', artistId: 'art-rbeer', platform: 'youtube', url: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6', order: 1, createdAt: now, updatedAt: now },
    { id: 'soc-10', artistId: 'art-5', platform: 'spotify', url: 'https://spotify.com', order: 1, createdAt: now, updatedAt: now },
    { id: 'soc-11', artistId: 'art-5', platform: 'instagram', url: 'https://instagram.com', order: 2, createdAt: now, updatedAt: now },
    { id: 'soc-12', artistId: 'art-6', platform: 'spotify', url: 'https://spotify.com', order: 1, createdAt: now, updatedAt: now },
    { id: 'soc-13', artistId: 'art-6', platform: 'soundcloud', url: 'https://soundcloud.com', order: 2, createdAt: now, updatedAt: now },
  ];

  const initialAlbums: Album[] = [
    {
      id: 'alb-2',
      title: 'Satane Lage Ho',
      slug: 'satane-lage-ho',
      artistName: 'Rashmi Nishad & Sonu Charan Bhatt',
      artistId: 'art-2',
      coverUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
      releaseDate: '2026-08-04',
      year: 2026,
      genre: 'Rajasthani Traditional / Modern Folk',
      trackCount: 1,
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02',
      appleMusicUrl: 'https://apple.com',
      featured: true,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'alb-bhartar',
      title: 'Bhartar',
      slug: 'bhartar',
      artistName: 'R Beer & Rashmi Nishad',
      artistId: 'art-rbeer',
      coverUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
      releaseDate: '2026-08-24',
      year: 2026,
      genre: 'Rajasthani Traditional / Beat Song',
      trackCount: 1,
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6',
      appleMusicUrl: 'https://apple.com',
      featured: true,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'alb-1',
      title: 'Neon Odyssey',
      slug: 'neon-odyssey',
      artistName: 'Cipher',
      artistId: 'art-1',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      releaseDate: '2026-03-15',
      year: 2026,
      genre: 'Synthwave / Cyberpunk',
      trackCount: 10,
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      appleMusicUrl: 'https://apple.com',
      featured: true,
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'alb-3',
      title: 'Sub Zero Bass',
      slug: 'sub-zero-bass',
      artistName: 'EchoPulse',
      artistId: 'art-6',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      releaseDate: '2026-01-20',
      year: 2026,
      genre: 'Electronic / Bass',
      trackCount: 8,
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      appleMusicUrl: 'https://apple.com',
      featured: false,
      order: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'alb-4',
      title: 'Nocturne Echoes',
      slug: 'nocturne-echoes',
      artistName: 'Aria Thorne',
      artistId: 'art-5',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      releaseDate: '2025-11-10',
      year: 2025,
      genre: 'Ambient Soul',
      trackCount: 12,
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      appleMusicUrl: 'https://apple.com',
      featured: false,
      order: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'alb-5',
      title: 'Hyperdrive VIP',
      slug: 'hyperdrive-vip',
      artistName: 'Cipher',
      artistId: 'art-1',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      releaseDate: '2025-09-01',
      year: 2025,
      genre: 'Future Bass',
      trackCount: 6,
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      appleMusicUrl: 'https://apple.com',
      featured: false,
      order: 6,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'alb-6',
      title: 'Analog Horizons',
      slug: 'analog-horizons',
      artistName: 'VEXO Sound Collective',
      artistId: null,
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      releaseDate: '2025-06-18',
      year: 2025,
      genre: 'Electronic / Downtempo',
      trackCount: 14,
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      appleMusicUrl: 'https://apple.com',
      featured: false,
      order: 7,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialTracks: Track[] = [
    {
      id: 'trk-1',
      title: 'Satane Lage Ho (Official Single)',
      artistName: 'Rashmi Nishad & Sonu Charan Bhatt',
      artistId: 'art-2',
      albumId: 'alb-2',
      duration: 254,
      coverUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
      genre: 'Rajasthani Folk / Contemporary',
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02',
      plays: 185000,
      isPopular: true,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'trk-bhartar',
      title: 'Bhartar (Official Single)',
      artistName: 'R Beer & Rashmi Nishad',
      artistId: 'art-rbeer',
      albumId: 'alb-bhartar',
      duration: 236,
      coverUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
      genre: 'Rajasthani Traditional / Beat Song',
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6',
      plays: 215000,
      isPopular: true,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'trk-2',
      title: 'Midnight Grid Runner',
      artistName: 'Cipher',
      artistId: 'art-1',
      albumId: 'alb-1',
      duration: 218,
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      genre: 'Synthwave',
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      plays: 420000,
      isPopular: true,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'trk-3',
      title: 'Frequency Lockdown',
      artistName: 'EchoPulse',
      artistId: 'art-6',
      albumId: 'alb-3',
      duration: 195,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      genre: 'Electronic / Bass',
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      plays: 290000,
      isPopular: false,
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'trk-4',
      title: 'Starlight Dissolve',
      artistName: 'Aria Thorne',
      artistId: 'art-5',
      albumId: 'alb-4',
      duration: 242,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      genre: 'Ambient Soul',
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      plays: 620000,
      isPopular: true,
      order: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'trk-5',
      title: 'Neon Skyline (Club Mix)',
      artistName: 'Cipher',
      artistId: 'art-1',
      albumId: 'alb-5',
      duration: 210,
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      genre: 'Future Bass',
      spotifyUrl: 'https://spotify.com',
      youtubeUrl: 'https://youtube.com',
      plays: 95000,
      isPopular: false,
      order: 5,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialEvents: Event[] = [
    {
      id: 'e-1',
      title: 'Neon Odyssey: World Tour 2026',
      slug: 'neon-odyssey-world-tour-2026',
      mainArtist: 'Cipher & Special Guests',
      date: 'OCT 24, 2026',
      time: '20:00 EST',
      venue: 'Madison Square Garden',
      location: 'New York, USA',
      city: 'New York',
      country: 'USA',
      ticketUrl: 'https://ticketmaster.com',
      price: '$85.00 - $250.00',
      status: 'upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      description: 'The definitive audio-visual cyberpunk experience featuring custom laser arrays and full Dolby Atmos live sound.',
      featured: true,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'e-2',
      title: 'Sub Zero Nights: Tokyo Live',
      slug: 'sub-zero-nights-tokyo-live',
      mainArtist: 'EchoPulse',
      date: 'NOV 12, 2026',
      time: '21:00 JST',
      venue: 'Tokyo Dome',
      location: 'Tokyo, Japan',
      city: 'Tokyo',
      country: 'Japan',
      ticketUrl: 'https://ticketmaster.com',
      price: '¥9,500 - ¥22,000',
      status: 'live',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      description: 'Massive bass transducers and spatial live performance recorded for the upcoming concert film.',
      featured: true,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'e-3',
      title: 'VEXO Sonic Homecoming',
      slug: 'vexo-sonic-homecoming',
      mainArtist: 'Rashmi Nishad, Sonu Charan Bhatt & Full Roster',
      date: 'DEC 05, 2026',
      time: '19:00 IST',
      venue: 'SMS Stadium Arena',
      location: 'Jaipur, Rajasthan, India',
      city: 'Jaipur',
      country: 'India',
      ticketUrl: 'https://insider.in',
      price: '₹999 - ₹4,999',
      status: 'upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      description: 'A grand celebration of Rajasthani folk fusion and flagship VEXO artists live in Jaipur.',
      featured: true,
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'e-4',
      title: 'Aria Thorne: The Nocturne Recital',
      slug: 'aria-thorne-the-nocturne-recital',
      mainArtist: 'Aria Thorne',
      date: 'JAN 15, 2027',
      time: '19:30 GMT',
      venue: 'The O2 Arena',
      location: 'London, UK',
      city: 'London',
      country: 'UK',
      ticketUrl: 'https://ticketmaster.com',
      price: '£65.00 - £180.00',
      status: 'sold-out',
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
      description: 'An intimate 360-degree acoustic and analog ambient soundstage experience.',
      featured: false,
      order: 4,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialEventArtists: EventArtist[] = [
    { id: 'ea-1', eventId: 'e-1', artistId: 'art-1', role: 'Headliner', order: 1, createdAt: now, updatedAt: now },
    { id: 'ea-2', eventId: 'e-2', artistId: 'art-6', role: 'Headliner', order: 1, createdAt: now, updatedAt: now },
    { id: 'ea-3', eventId: 'e-3', artistId: 'art-2', role: 'Headliner', order: 1, createdAt: now, updatedAt: now },
    { id: 'ea-4', eventId: 'e-3', artistId: 'art-3', role: 'Co-Headliner', order: 2, createdAt: now, updatedAt: now },
    { id: 'ea-5', eventId: 'e-4', artistId: 'art-5', role: 'Solo Recital', order: 1, createdAt: now, updatedAt: now },
  ];

  const initialVideos: Video[] = [
    {
      id: 'vid-1',
      title: 'Satane Lage Ho (Official Music Video)',
      artist: 'Rashmi Nishad & Sonu Charan Bhatt',
      youtubeId: 'HcEcM5AtEZ8',
      thumbnailUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
      duration: '4:14',
      views: 835,
      publishedAt: '4 Aug 2026',
      category: 'Official Music Videos',
      featured: true,
      description: 'Presenting the Official Song of "Satane Lage Ho" by Vexo Entertainment Pvt. Ltd. Enjoy the Song and don\'t forget to Like, Comment, Share & Subscribe for more amazing music.',
      tags: ['#RashmiNishad', '#SonuCharanBhatt', '#SataneLageHo', '#VexoEntertainment'],
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'vid-bhartar',
      title: 'BHARTAR | R Beer & Rashmi Nishad | Mohit Arora & Shivya Arora | New Rajasthani Song 2026',
      artist: 'R Beer & Rashmi Nishad',
      youtubeId: 'PsmXAUKjR5Y',
      thumbnailUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
      duration: '2:22',
      views: 553,
      publishedAt: '24 Aug 2026',
      category: 'Official Music Videos',
      featured: true,
      description: 'Presenting "BHARTAR" by Vexo Entertainment Pvt. Ltd. Starring Mohit Arora & Shivya Arora, sung by R Beer & Rashmi Nishad, music by GR Music, directed by R Beer. राजस्थानी रंग, देसी अंदाज़ और धमाकेदार बीट्स के साथ पेश है – “BHARTAR”',
      tags: ['#RajasthaniMusic', '#RashmiNishad', '#NewRajasthaniSong', '#Bhartar', '#VexoMusic', '#RBeer'],
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'vid-2',
      title: 'Neon Odyssey (4K Cyber Visualizer)',
      artist: 'Cipher',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      duration: '3:38',
      views: 124000,
      publishedAt: '15 Mar 2026',
      category: 'Visualizers',
      featured: false,
      description: 'Official 4K reactive audio visualizer for Neon Odyssey by Cipher.',
      tags: ['#Synthwave', '#Cyberpunk', '#Cipher'],
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'vid-3',
      title: 'Sub Zero Live in Tokyo (Concert Film)',
      artist: 'EchoPulse',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      duration: '6:22',
      views: 89000,
      publishedAt: '20 Jan 2026',
      category: 'Live Performances',
      featured: false,
      description: 'Live performance of Sub Zero bass anthem recorded live in Tokyo Dome.',
      tags: ['#EchoPulse', '#LiveInTokyo', '#BassMusic'],
      order: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'vid-4',
      title: 'Behind The Board: VEXO Studio Sessions',
      artist: 'VEXO Engineering Team',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      duration: '8:45',
      views: 45000,
      publishedAt: '10 Feb 2026',
      category: 'Behind The Scenes',
      featured: false,
      description: 'A deep-dive look into analog synthesizer tracking and SSL mixing at VEXO Jaipur.',
      tags: ['#StudioTour', '#DolbyAtmos', '#AudioEngineering'],
      order: 5,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialServices: Service[] = mockServices.map((s, idx) => ({
    id: s.id,
    number: s.number || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`),
    title: s.title,
    slug: s.slug || undefined,
    category: s.category || 'Production',
    shortDesc: s.shortDesc,
    fullDesc: s.fullDesc,
    imageUrl: s.imageUrl,
    icon: (s as any).icon || 'Music',
    features: s.features || [],
    ctaText: s.ctaText || 'INITIATE PROJECT',
    pricingRange: s.pricingRange || null,
    specifications: s.specs || (s as any).specifications || [],
    equipmentList: (s as any).equipmentList || [],
    plans: s.plans || [],
    specs: s.specs || [],
    processSteps: s.processSteps || [],
    deliverables: s.deliverables || [],
    faqs: s.faqs || [],
    order: s.order || idx + 1,
    isActive: s.isActive !== undefined ? s.isActive : true,
    createdAt: now,
    updatedAt: now,
  }));

  const initialMedia: Media[] = [
    {
      id: 'med-1',
      filename: 'satane-lage-ho-thumb.jpg',
      originalName: 'Satane Lage Ho Cover.jpg',
      mimeType: 'image/jpeg',
      size: 452000,
      url: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
      category: 'image',
      altText: 'Official cover art for Satane Lage Ho',
      uploadedBy: 'admin-super-1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-bhartar',
      filename: 'bhartar-banner.jpg',
      originalName: 'Bhartar Cover Art.jpg',
      mimeType: 'image/jpeg',
      size: 485000,
      url: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
      category: 'image',
      altText: 'Official 4K cover banner for Bhartar',
      uploadedBy: 'admin-super-1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-2',
      filename: 'studio-mixing-board.jpg',
      originalName: 'Studio SSL Console.jpg',
      mimeType: 'image/jpeg',
      size: 890000,
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      category: 'image',
      altText: 'VEXO Studio SSL 4000 Console',
      uploadedBy: 'admin-super-1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-3',
      filename: 'neon-horizon-audio-preview.mp3',
      originalName: 'Neon Horizon Master Preview.mp3',
      mimeType: 'audio/mpeg',
      size: 3450000,
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=electronic-future-beats-117997.mp3',
      category: 'audio',
      altText: 'Electronic Future Beats Audio Master',
      uploadedBy: 'admin-super-1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-4',
      filename: 'cipher-live-concert-film.mp4',
      originalName: 'Cipher Live Concert 4K Teaser.mp4',
      mimeType: 'video/mp4',
      size: 14500000,
      url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      category: 'video',
      altText: 'Cipher Live in Tokyo Concert Teaser',
      uploadedBy: 'admin-super-1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-5',
      filename: 'aria-thorne-portrait.jpg',
      originalName: 'Aria Thorne Editorial Press.jpg',
      mimeType: 'image/jpeg',
      size: 670000,
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      category: 'image',
      altText: 'Aria Thorne Press Portrait',
      uploadedBy: 'admin-super-1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-6',
      filename: 'deep-frequency-preview.mp3',
      originalName: 'Deep Frequency Club Mix.mp3',
      mimeType: 'audio/mpeg',
      size: 4200000,
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tech-house-preview.mp3',
      category: 'audio',
      altText: 'Tech House Club Mix Preview',
      uploadedBy: 'admin-super-1',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialContacts: ContactRequest[] = [
    {
      id: 'cnt-1',
      referenceId: 'VXO-2026-8942',
      name: 'Aarav Sharma',
      email: 'aarav@soundlab.in',
      phone: '+91 98290 12345',
      company: 'SoundLab Studio',
      service: 'MUSIC PRODUCTION',
      message: 'Looking to produce a 5-track commercial EP blending traditional instruments with modern electronic soundscapes.',
      status: 'NEW',
      notes: 'Initial inquiry received via website contact form.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialHomepage: Homepage = {
    id: 'homepage-singleton',
    // Hero Section
    heroTagline: 'Pioneering Original Soundscapes & Entertainment',
    heroHeadline: 'SONIC ARCHITECTURE FOR THE NEXT ERA',
    heroSubtitle: 'VEXO Music Entertainment is a global record label, high-end audio-visual production powerhouse, and artist development agency.',
    heroBgImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80',
    heroBgMedia: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80',
    featuredVideoId: 'PsmXAUKjR5Y',
    heroCtaText: 'EXPLORE RELEASES',
    heroCtaUrl: '/music',
    heroSecondaryCtaText: 'STUDIO SERVICES',
    heroSecondaryCtaUrl: '/services',

    // Latest Releases Section
    releasesHeading: 'LATEST RELEASES',
    releasesSubtitle: 'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
    selectedAlbumIds: ['alb-2', 'alb-bhartar', 'alb-1', 'alb-3'],
    releasesLimit: 4,

    // Featured Artists Section
    artistsHeading: 'FEATURED ARTISTS',
    artistsSubtitle: 'Discover the visionary producers, vocalists, and composers driving our sonic movement.',
    featuredArtistIds: ['art-2', 'art-rbeer', 'art-3', 'art-1'],

    // Featured Events Section
    eventsHeading: 'FEATURED EVENTS & TOUR',
    eventsSubtitle: 'Experience the raw energy of VEXO live across premier concert halls and festival stadiums globally.',
    featuredEventIds: ['evt-1', 'evt-2', 'evt-3', 'evt-4'],

    // Featured Videos Section
    videosHeading: 'OFFICIAL VIDEO PRODUCTIONS',
    videosSubtitle: 'Watch high-definition 4K music videos, studio recordings, live stadium performances, and visualizers.',
    featuredVideoIds: ['vid-1', 'vid-bhartar', 'vid-2', 'vid-3'],

    // Statistics Section
    statsArtistsCount: '10+',
    statsReleasesCount: '50+',
    statsProjectsCount: '100+',
    statsTotalStreams: '1.2M+',
    statsGlobalReach: '45+ Countries',

    // About Section
    aboutBadge: 'ABOUT VEXO',
    aboutHeading: 'VEXO MUSIC ENTERTAINMENT PVT. LTD.',
    aboutDescription: 'Pioneering original soundscapes, artist management, and digital distribution for the next generation. VEXO Music Entertainment Pvt. Ltd. is a premier music agency and record label headquartered in Jaipur, Rajasthan. We specialize in producing chart-topping commercial tracks, high-concept audio visualizers, and empowering recording artists with global digital distribution.',
    aboutImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',

    // Final CTA Section
    finalCtaBadge: 'READY TO COLLABORATE?',
    finalCtaHeading: "LET'S CREATE SOMETHING ICONIC.",
    finalCtaDescription: 'Ready to bring your sonic or visual project to life? Collaborate with our team of elite sound engineers, music directors, and producers.',
    finalCtaButtonLabel: 'START A PROJECT',
    finalCtaButtonUrl: '/contact',
    finalCtaSecondaryLabel: 'CONTACT VEXO',
    finalCtaSecondaryUrl: '/contact',

    marqueeText: 'LATEST RELEASE: "BHARTAR" BY R BEER & RASHMI NISHAD — STREAMING NOW ON ALL MAJOR DSPS',
    updatedAt: now,
  };

  const initialSiteSettings: SiteSettings = {
    id: 'site-settings-singleton',
    siteName: 'VEXO Music Entertainment Pvt. Ltd.',
    siteDescription: 'Premier record label, studio production house, and artist management company.',
    logoUrl: '/logo.svg',
    faviconUrl: '/favicon.ico',
    contactEmail: 'contact@vexomusic.com',
    contactPhone: '+91 98290 00000',
    officeAddress: 'VEXO Creative Studios, Tone City, Jaipur, Rajasthan, India 302001',
    copyrightText: '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
    socialSpotify: 'https://spotify.com',
    socialYoutube: 'https://youtube.com',
    socialInstagram: 'https://instagram.com',
    socialTwitter: 'https://twitter.com',
    maintenanceMode: false,
    updatedAt: now,
  };

  const initialActivityLogs: ActivityLog[] = [
    {
      id: 'log-1',
      adminUserId: 'admin-super-1',
      adminUserName: 'VEXO Executive Admin',
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'System',
      entityId: 'database',
      details: { message: 'Database successfully initialized with 14 models.' },
      ipAddress: '127.0.0.1',
      userAgent: 'System Seed',
      createdAt: now,
    },
  ];

  return {
    adminUsers: [defaultAdmin, defaultEditor],
    artists: initialArtists,
    artistSocials: initialSocials,
    albums: initialAlbums,
    tracks: initialTracks,
    events: initialEvents,
    eventArtists: initialEventArtists,
    videos: initialVideos,
    services: initialServices,
    media: initialMedia,
    contactRequests: initialContacts,
    homepage: initialHomepage,
    siteSettings: initialSiteSettings,
    activityLogs: initialActivityLogs,
  };
}

class DatabaseStore {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    ensureDataDirectory();
    this.data = this.load();
    initPostgresSync(
      this.data.services,
      this.data.contactRequests,
      this.data.artists,
      this.data.artistSocials
    ).catch(() => {});
  }

  private load(): DatabaseSchema {
    const initial = getInitialDatabase();
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all 14 models exist in parsed data
        const loadedServices = (parsed.services && parsed.services.length > 0)
          ? parsed.services.map((s: any, idx: number) => {
              const fallback = initial.services.find(
                (is) => is.id === s.id || is.slug === s.slug || is.title?.toLowerCase() === s.title?.toLowerCase()
              );
              return {
                ...s,
                icon: s.icon || fallback?.icon || 'Music',
                order: typeof s.order === 'number' ? s.order : idx + 1,
                slug: s.slug || fallback?.slug || (s.title ? s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : `service-${idx + 1}`),
                isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
                plans: (Array.isArray(s.plans) && s.plans.length > 0) ? s.plans : (fallback?.plans || []),
                specs: (Array.isArray(s.specs) && s.specs.length > 0) ? s.specs : (s.specifications || fallback?.specs || []),
                processSteps: (Array.isArray(s.processSteps) && s.processSteps.length > 0) ? s.processSteps : (fallback?.processSteps || []),
                deliverables: (Array.isArray(s.deliverables) && s.deliverables.length > 0) ? s.deliverables : (fallback?.deliverables || []),
                faqs: (Array.isArray(s.faqs) && s.faqs.length > 0) ? s.faqs : (fallback?.faqs || []),
              };
            })
          : initial.services;

        const loadedArtists = Array.isArray(parsed.artists)
          ? parsed.artists.filter((a: any) => a.id !== 'art-4' && a.name !== 'Artist Coming Soon')
          : initial.artists;
        loadedArtists.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));

        const loadedAlbums = Array.isArray(parsed.albums) ? parsed.albums : initial.albums;
        loadedAlbums.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));

        const loadedTracks = Array.isArray(parsed.tracks) ? parsed.tracks : initial.tracks;
        loadedTracks.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));

        const loadedVideos = [...(parsed.videos || [])];
        initial.videos.forEach((vid) => {
          if (!loadedVideos.some((v: any) => v.id === vid.id || v.youtubeId === vid.youtubeId)) {
            loadedVideos.push(vid);
          }
        });
        loadedVideos.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));

        const loadedSocials = (parsed.artistSocials || []).filter((s: any) => s.artistId !== 'art-4');
        initial.artistSocials.forEach((soc) => {
          if (!loadedSocials.some((s: any) => s.id === soc.id)) {
            loadedSocials.push(soc);
          }
        });

        const loadedHomepage = parsed.homepage
          ? {
              ...initial.homepage,
              ...parsed.homepage,
              featuredVideoId: parsed.homepage.featuredVideoId === 'HcEcM5AtEZ8' ? 'PsmXAUKjR5Y' : (parsed.homepage.featuredVideoId || 'PsmXAUKjR5Y'),
              selectedAlbumIds: ['alb-2', 'alb-bhartar', 'alb-1', 'alb-3'],
              featuredVideoIds: ['vid-1', 'vid-bhartar', 'vid-2', 'vid-3'],
              marqueeText: initial.homepage.marqueeText,
            }
          : initial.homepage;

        const merged: DatabaseSchema = {
          adminUsers: parsed.adminUsers || initial.adminUsers,
          artists: loadedArtists,
          artistSocials: loadedSocials,
          albums: loadedAlbums,
          tracks: loadedTracks,
          events: parsed.events || initial.events,
          eventArtists: parsed.eventArtists || initial.eventArtists,
          videos: loadedVideos,
          services: loadedServices,
          media: parsed.media || initial.media,
          contactRequests: parsed.contactRequests || initial.contactRequests,
          homepage: loadedHomepage,
          siteSettings: parsed.siteSettings || initial.siteSettings,
          activityLogs: parsed.activityLogs || initial.activityLogs,
        };

        this.persistSync(merged);
        return merged;
      }
    } catch (err) {
      console.error('[DatabaseStore] Failed to load DB file, initializing fresh state:', err);
    }

    this.persistSync(initial);
    return initial;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      ensureDataDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DatabaseStore] Failed to write DB file:', err);
    }
  }

  public persist() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
      this.saveTimeout = null;
    }, 50);
  }

  public get snapshot(): DatabaseSchema {
    return this.data;
  }

  public reload(): DatabaseSchema {
    this.data = this.load();
    return this.data;
  }

  // --- Admin User ---
  public get adminUsers() {
    return {
      findMany: () => this.data.adminUsers,
      findById: (id: string) => this.data.adminUsers.find((u) => u.id === id) || null,
      findByEmail: (email: string) =>
        this.data.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
      create: (item: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const user: AdminUser = {
          ...item,
          id: generateId('adm'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.adminUsers.push(user);
        this.persist();
        return user;
      },
      update: (id: string, updates: Partial<AdminUser>) => {
        const index = this.data.adminUsers.findIndex((u) => u.id === id);
        if (index === -1) return null;
        this.data.adminUsers[index] = {
          ...this.data.adminUsers[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        return this.data.adminUsers[index];
      },
      delete: (id: string) => {
        const index = this.data.adminUsers.findIndex((u) => u.id === id);
        if (index === -1) return false;
        this.data.adminUsers.splice(index, 1);
        this.persist();
        return true;
      },
    };
  }

  // --- Artists ---
  public get artists() {
    return {
      findMany: () => {
        return this.data.artists.map((artist) => ({
          ...artist,
          socials: this.data.artistSocials.filter((s) => s.artistId === artist.id),
        }));
      },
      findById: (id: string) => {
        const artist = this.data.artists.find((a) => a.id === id);
        if (!artist) return null;
        return {
          ...artist,
          socials: this.data.artistSocials.filter((s) => s.artistId === artist.id),
        };
      },
      findBySlug: (slug: string) => {
        const artist = this.data.artists.find((a) => a.slug === slug);
        if (!artist) return null;
        return {
          ...artist,
          socials: this.data.artistSocials.filter((s) => s.artistId === artist.id),
        };
      },
      create: (item: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>, socials?: Array<{ platform: string; url: string }>) => {
        const now = new Date().toISOString();
        const id = generateId('art');
        const artist: Artist = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
        };
        this.data.artists.push(artist);

        if (socials && socials.length > 0) {
          socials.forEach((s, idx) => {
            this.data.artistSocials.push({
              id: generateId('soc'),
              artistId: id,
              platform: s.platform,
              url: s.url,
              order: idx + 1,
              createdAt: now,
              updatedAt: now,
            });
          });
        }

        this.persist();
        const createdArtist = this.artists.findById(id);
        if (createdArtist) {
          syncArtistToPostgres(createdArtist, createdArtist.socials).catch(() => {});
        }
        return createdArtist;
      },
      update: (id: string, updates: Partial<Artist>, socials?: Array<{ platform: string; url: string }>) => {
        const index = this.data.artists.findIndex((a) => a.id === id);
        if (index === -1) return null;
        const now = new Date().toISOString();

        this.data.artists[index] = {
          ...this.data.artists[index],
          ...updates,
          updatedAt: now,
        };

        if (socials !== undefined) {
          // Remove old socials
          this.data.artistSocials = this.data.artistSocials.filter((s) => s.artistId !== id);
          // Insert new
          socials.forEach((s, idx) => {
            this.data.artistSocials.push({
              id: generateId('soc'),
              artistId: id,
              platform: s.platform,
              url: s.url,
              order: idx + 1,
              createdAt: now,
              updatedAt: now,
            });
          });
        }

        this.persist();
        const updatedArtist = this.artists.findById(id);
        if (updatedArtist) {
          syncArtistToPostgres(updatedArtist, updatedArtist.socials).catch(() => {});
        }
        return updatedArtist;
      },
      delete: (id: string) => {
        const index = this.data.artists.findIndex((a) => a.id === id);
        if (index === -1) return false;
        this.data.artists.splice(index, 1);
        this.data.artistSocials = this.data.artistSocials.filter((s) => s.artistId !== id);
        this.data.eventArtists = this.data.eventArtists.filter((ea) => ea.artistId !== id);
        this.persist();
        deleteArtistFromPostgres(id).catch(() => {});
        return true;
      },
    };
  }

  // --- Artist Socials ---
  public get artistSocials() {
    return {
      findByArtistId: (artistId: string) => this.data.artistSocials.filter((s) => s.artistId === artistId),
    };
  }

  // --- Albums ---
  public get albums() {
    return {
      findMany: () => {
        return this.data.albums
          .slice()
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
          .map((album) => ({
            ...album,
            tracks: this.data.tracks.filter((t) => t.albumId === album.id),
          }));
      },
      findById: (id: string) => {
        const album = this.data.albums.find((a) => a.id === id);
        if (!album) return null;
        return {
          ...album,
          tracks: this.data.tracks.filter((t) => t.albumId === album.id),
        };
      },
      create: (item: Omit<Album, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const album: Album = {
          ...item,
          id: generateId('alb'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.albums.push(album);
        this.persist();
        return album;
      },
      update: (id: string, updates: Partial<Album>) => {
        const index = this.data.albums.findIndex((a) => a.id === id);
        if (index === -1) return null;
        this.data.albums[index] = {
          ...this.data.albums[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        return this.albums.findById(id);
      },
      delete: (id: string) => {
        const index = this.data.albums.findIndex((a) => a.id === id);
        if (index === -1) return false;
        this.data.albums.splice(index, 1);
        this.data.tracks.forEach((t) => {
          if (t.albumId === id) t.albumId = null;
        });
        this.persist();
        return true;
      },
    };
  }

  // --- Tracks ---
  public get tracks() {
    return {
      findMany: () => this.data.tracks.slice().sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
      findById: (id: string) => this.data.tracks.find((t) => t.id === id) || null,
      findByAlbumId: (albumId: string) => this.data.tracks.filter((t) => t.albumId === albumId),
      findByArtistId: (artistId: string) => this.data.tracks.filter((t) => t.artistId === artistId),
      create: (item: Omit<Track, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const track: Track = {
          ...item,
          id: generateId('trk'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.tracks.push(track);
        // Update album trackCount
        if (track.albumId) {
          const album = this.data.albums.find((a) => a.id === track.albumId);
          if (album) {
            album.trackCount = this.data.tracks.filter((t) => t.albumId === album.id).length;
          }
        }
        this.persist();
        return track;
      },
      update: (id: string, updates: Partial<Track>) => {
        const index = this.data.tracks.findIndex((t) => t.id === id);
        if (index === -1) return null;
        this.data.tracks[index] = {
          ...this.data.tracks[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        return this.data.tracks[index];
      },
      delete: (id: string) => {
        const index = this.data.tracks.findIndex((t) => t.id === id);
        if (index === -1) return false;
        const albumId = this.data.tracks[index].albumId;
        this.data.tracks.splice(index, 1);
        if (albumId) {
          const album = this.data.albums.find((a) => a.id === albumId);
          if (album) {
            album.trackCount = this.data.tracks.filter((t) => t.albumId === album.id).length;
          }
        }
        this.persist();
        return true;
      },
    };
  }

  // --- Events ---
  public get events() {
    return {
      findMany: () => {
        return this.data.events.map((event) => ({
          ...event,
          eventArtists: this.data.eventArtists
            .filter((ea) => ea.eventId === event.id)
            .map((ea) => ({
              ...ea,
              artist: this.data.artists.find((a) => a.id === ea.artistId),
            })),
        }));
      },
      findById: (id: string) => {
        const event = this.data.events.find((e) => e.id === id);
        if (!event) return null;
        return {
          ...event,
          eventArtists: this.data.eventArtists
            .filter((ea) => ea.eventId === event.id)
            .map((ea) => ({
              ...ea,
              artist: this.data.artists.find((a) => a.id === ea.artistId),
            })),
        };
      },
      create: (item: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>, artistIds?: string[]) => {
        const now = new Date().toISOString();
        const id = generateId('e');
        const event: Event = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
        };
        this.data.events.push(event);

        if (artistIds && artistIds.length > 0) {
          artistIds.forEach((artId, idx) => {
            this.data.eventArtists.push({
              id: generateId('ea'),
              eventId: id,
              artistId: artId,
              role: idx === 0 ? 'Headliner' : 'Supporting',
              order: idx + 1,
              createdAt: now,
              updatedAt: now,
            });
          });
        }

        this.persist();
        return this.events.findById(id);
      },
      update: (id: string, updates: Partial<Event>, artistIds?: string[]) => {
        const index = this.data.events.findIndex((e) => e.id === id);
        if (index === -1) return null;
        const now = new Date().toISOString();

        this.data.events[index] = {
          ...this.data.events[index],
          ...updates,
          updatedAt: now,
        };

        if (artistIds !== undefined) {
          this.data.eventArtists = this.data.eventArtists.filter((ea) => ea.eventId !== id);
          artistIds.forEach((artId, idx) => {
            this.data.eventArtists.push({
              id: generateId('ea'),
              eventId: id,
              artistId: artId,
              role: idx === 0 ? 'Headliner' : 'Supporting',
              order: idx + 1,
              createdAt: now,
              updatedAt: now,
            });
          });
        }

        this.persist();
        return this.events.findById(id);
      },
      delete: (id: string) => {
        const index = this.data.events.findIndex((e) => e.id === id);
        if (index === -1) return false;
        this.data.events.splice(index, 1);
        this.data.eventArtists = this.data.eventArtists.filter((ea) => ea.eventId !== id);
        this.persist();
        return true;
      },
    };
  }

  // --- Videos ---
  public get videos() {
    return {
      findMany: () => this.data.videos,
      findById: (id: string) => this.data.videos.find((v) => v.id === id) || null,
      create: (item: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const video: Video = {
          ...item,
          id: generateId('vid'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.videos.push(video);
        this.persist();
        return video;
      },
      update: (id: string, updates: Partial<Video>) => {
        const index = this.data.videos.findIndex((v) => v.id === id);
        if (index === -1) return null;
        this.data.videos[index] = {
          ...this.data.videos[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        return this.data.videos[index];
      },
      delete: (id: string) => {
        const index = this.data.videos.findIndex((v) => v.id === id);
        if (index === -1) return false;
        this.data.videos.splice(index, 1);
        this.persist();
        return true;
      },
    };
  }

  // --- Services ---
  public get services() {
    return {
      findMany: () => [...this.data.services].sort((a, b) => (a.order || 0) - (b.order || 0)),
      findById: (id: string) => this.data.services.find((s) => s.id === id) || null,
      findBySlug: (slug: string) => this.data.services.find((s) => s.slug === slug || s.id === slug) || null,
      create: (item: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const service: Service = {
          ...item,
          id: generateId('srv'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.services.push(service);
        this.persist();
        syncServiceToPostgres(service).catch(() => {});
        return service;
      },
      update: (id: string, updates: Partial<Service>) => {
        const index = this.data.services.findIndex((s) => s.id === id);
        if (index === -1) return null;
        this.data.services[index] = {
          ...this.data.services[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        syncServiceToPostgres(this.data.services[index]).catch(() => {});
        return this.data.services[index];
      },
      reorder: (serviceIds: string[]) => {
        if (Array.isArray(serviceIds)) {
          serviceIds.forEach((id, idx) => {
            const s = this.data.services.find((item) => item.id === id);
            if (s) {
              s.order = idx + 1;
              s.updatedAt = new Date().toISOString();
              syncServiceToPostgres(s).catch(() => {});
            }
          });
          this.persist();
        }
        return this.services.findMany();
      },
      delete: (id: string) => {
        const index = this.data.services.findIndex((s) => s.id === id);
        if (index === -1) return false;
        this.data.services.splice(index, 1);
        this.persist();
        deleteServiceFromPostgres(id).catch(() => {});
        return true;
      },
    };
  }

  // --- Media ---
  public get media() {
    return {
      findMany: (filter?: { category?: string; search?: string }) => {
        let list = this.data.media;
        if (filter?.category && filter.category.toLowerCase() !== 'all') {
          const cat = filter.category.toLowerCase().trim();
          list = list.filter((m) => m.category.toLowerCase() === cat);
        }
        if (filter?.search) {
          const q = filter.search.toLowerCase().trim();
          list = list.filter(
            (m) =>
              m.filename.toLowerCase().includes(q) ||
              m.originalName.toLowerCase().includes(q) ||
              (m.altText && m.altText.toLowerCase().includes(q))
          );
        }
        return list;
      },
      findById: (id: string) => this.data.media.find((m) => m.id === id) || null,
      create: (item: Omit<Media, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const media: Media = {
          ...item,
          id: generateId('med'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.media.push(media);
        this.persist();
        return media;
      },
      update: (id: string, updates: Partial<Media>) => {
        const index = this.data.media.findIndex((m) => m.id === id);
        if (index === -1) return null;
        this.data.media[index] = {
          ...this.data.media[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        return this.data.media[index];
      },
      delete: (id: string) => {
        const index = this.data.media.findIndex((m) => m.id === id);
        if (index === -1) return false;
        this.data.media.splice(index, 1);
        this.persist();
        return true;
      },
    };
  }

  // --- Contact Requests ---
  public get contactRequests() {
    return {
      findMany: () => this.data.contactRequests,
      findById: (id: string) => this.data.contactRequests.find((c) => c.id === id) || null,
      findByReferenceId: (refId: string) => this.data.contactRequests.find((c) => c.referenceId === refId) || null,
      create: (item: Omit<ContactRequest, 'id' | 'referenceId' | 'status' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const randomRef = `VXO-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const contact: ContactRequest = {
          ...item,
          id: generateId('cnt'),
          referenceId: randomRef,
          status: 'NEW',
          notes: null,
          createdAt: now,
          updatedAt: now,
        };
        this.data.contactRequests.unshift(contact);
        this.persist();
        syncContactRequestToPostgres(contact).catch(() => {});
        return contact;
      },
      update: (id: string, updates: Partial<ContactRequest>) => {
        const index = this.data.contactRequests.findIndex((c) => c.id === id);
        if (index === -1) return null;
        this.data.contactRequests[index] = {
          ...this.data.contactRequests[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        syncContactRequestToPostgres(this.data.contactRequests[index]).catch(() => {});
        return this.data.contactRequests[index];
      },
      delete: (id: string) => {
        const index = this.data.contactRequests.findIndex((c) => c.id === id);
        if (index === -1) return false;
        this.data.contactRequests.splice(index, 1);
        this.persist();
        deleteContactRequestFromPostgres(id).catch(() => {});
        return true;
      },
    };
  }

  // --- Homepage ---
  public get homepage() {
    return {
      get: () => this.data.homepage,
      update: (updates: Partial<Homepage>) => {
        this.data.homepage = {
          ...this.data.homepage,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        return this.data.homepage;
      },
    };
  }

  // --- Site Settings ---
  public get siteSettings() {
    return {
      get: () => this.data.siteSettings,
      update: (updates: Partial<SiteSettings>) => {
        this.data.siteSettings = {
          ...this.data.siteSettings,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.persist();
        return this.data.siteSettings;
      },
    };
  }

  // --- Activity Log ---
  public get activityLogs() {
    return {
      findMany: (limit = 50) => this.data.activityLogs.slice(0, limit),
      log: (entry: Omit<ActivityLog, 'id' | 'createdAt'>) => {
        const log: ActivityLog = {
          ...entry,
          id: generateId('log'),
          createdAt: new Date().toISOString(),
        };
        this.data.activityLogs.unshift(log);
        if (this.data.activityLogs.length > 200) {
          this.data.activityLogs = this.data.activityLogs.slice(0, 200);
        }
        this.persist();
        return log;
      },
    };
  }
}

// Global Singleton Database Instance
export const db = new DatabaseStore();
