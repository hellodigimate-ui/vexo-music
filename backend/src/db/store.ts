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
  ReviewItem,
  SiteSettings,
  ActivityLog,
  DatabaseSchema,
  PreWeddingPageData,
} from './types.js';
import { mockServices } from '../data/services.js';
import { initialPreWeddingData } from '../data/preWedding.js';
import {
  initPostgresSync,
  syncHomepageToPostgres,
  syncSiteSettingsToPostgres,
  syncServiceToPostgres,
  deleteServiceFromPostgres,
  syncContactRequestToPostgres,
  deleteContactRequestFromPostgres,
  syncArtistToPostgres,
  deleteArtistFromPostgres,
  syncAlbumToPostgres,
  deleteAlbumFromPostgres,
  syncTrackToPostgres,
  deleteTrackFromPostgres,
  syncVideoToPostgres,
  deleteVideoFromPostgres,
  syncEventToPostgres,
  deleteEventFromPostgres,
  syncMediaToPostgres,
  deleteMediaFromPostgres,
  syncAdminUserToPostgres,
  deleteAdminUserFromPostgres,
  syncActivityLogToPostgres,
  syncPreWeddingToPostgres,
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
      description: 'Presenting "BHARTAR" by Vexo Entertainment Pvt. Ltd. Starring Mohit Arora & Shivya Arora, sung by R Beer & Rashmi Nishad, music by GR Music, directed by R Beer. Vibrant folk rhythms, traditional melodies, and electrifying beats — presenting “BHARTAR”',
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
      phone: '+91 72399 99966',
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

    // Reviews / Testimonials Section
    reviewsBadge: 'TESTIMONIALS & TRUST',
    reviewsHeading: 'VOICES OF EXCELLENCE',
    reviewsSubtitle: 'What artists, visionary couples, and industry partners say about producing with VEXO.',
    reviews: [
      {
        id: 'rev-1',
        clientName: 'Rashmi Nishad',
        roleOrProject: 'Lead Vocalist • "Satane Lage Ho"',
        rating: 5,
        reviewText: 'Working with VEXO Music on "Satane Lage Ho" was a transformative experience. Their studio engineering, arrangement sensibilities, and dedication to visual storytelling elevated our folk release to international chart standards.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        category: 'Music Production',
        verified: true,
        date: 'August 2026',
      },
      {
        id: 'rev-2',
        clientName: 'Aarav & Simran Rathore',
        roleOrProject: 'Royal Pre-Wedding Shoot • Jaipur Forts',
        rating: 5,
        reviewText: 'The cinematic pre-wedding film produced by VEXO looked like a Bollywood period epic. From synchronized drone choreography over Nahargarh Fort to the original background score they composed for us, it was beyond our wildest dreams.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        category: 'Wedding & Film',
        verified: true,
        date: 'September 2026',
      },
      {
        id: 'rev-3',
        clientName: 'Vikramaditya Sen',
        roleOrProject: 'Executive Producer • Desert Storm Festival',
        rating: 5,
        reviewText: 'VEXO handled live audio engineering, multi-camera 4K visual feeds, and headline artist management for our 15,000-attendee festival with surgical precision. The sound was pristine and unforgettable.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        category: 'Artist Management',
        verified: true,
        date: 'July 2026',
      },
      {
        id: 'rev-4',
        clientName: 'Kabir & Meera Singhania',
        roleOrProject: 'Destination Pre-Wedding • Udaipur Lakes',
        rating: 5,
        reviewText: 'Their signature package was worth every rupee. The team took care of luxury logistics, custom styling, multi-camera 4K drone reels, and delivered the finished cut in record time. Every guest was mesmerized.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        category: 'Wedding & Film',
        verified: true,
        date: 'June 2026',
      },
      {
        id: 'rev-5',
        clientName: 'R Beer',
        roleOrProject: 'Singer-Songwriter • "Bhartar"',
        rating: 5,
        reviewText: 'The creative freedom and sonic power VEXO brings is unmatched. The production on "Bhartar" hit millions of streams within weeks. Their mixing, mastering, and global DSP distribution network are best-in-class.',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
        category: 'Music Production',
        verified: true,
        date: 'August 2026',
      },
      {
        id: 'rev-6',
        clientName: 'Ananya Deshmukh',
        roleOrProject: 'Indie Artist • Debut EP Production',
        rating: 5,
        reviewText: 'As an independent musician, finding a team that respects your vision while providing world-class Dolby Atmos mastering and visualizer production is rare. VEXO is the definitive home for serious artists.',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        category: 'Music Production',
        verified: true,
        date: 'May 2026',
      },
    ],

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
    contactPhone: '+91 72399 99966',
    officeAddress: 'VEXO Creative Studios, Tone City, Jaipur, Rajasthan, India 302001',
    copyrightText: '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
    socialSpotify: 'https://spotify.com',
    socialYoutube: 'https://youtube.com/@vexomusicentertainment',
    socialInstagram: 'https://www.instagram.com/vexomusicentertainment',
    socialTwitter: 'https://x.com/vexomusicentertainment',
    socialAppleMusic: 'https://music.apple.com',
    socialFacebook: 'https://facebook.com',
    socialSoundcloud: 'https://soundcloud.com',
    maintenanceMode: false,

    // Footer Customization
    footerBio: 'A premier music entertainment powerhouse & record label specializing in original sound engineering, global music distribution, artist management, and cinematic audio-visual production based in Jaipur, India.',
    footerQuickLinksHeading: 'QUICK LINKS',
    footerQuickLinks: [
      { id: 'fn-1', label: 'Home', path: '/' },
      { id: 'fn-2', label: 'Music', path: '/music' },
      { id: 'fn-3', label: 'Artists', path: '/artists' },
      { id: 'fn-4', label: 'Services', path: '/services' },
      { id: 'fn-5', label: 'Events', path: '/events' },
      { id: 'fn-6', label: 'Videos', path: '/videos' },
      { id: 'fn-7', label: 'About', path: '/about' },
      { id: 'fn-8', label: 'Contact', path: '/contact' },
    ],
    footerServicesHeading: 'SERVICES',
    footerServicesLinks: [
      { id: 'fs-1', label: 'Music Production', path: '/services' },
      { id: 'fs-2', label: 'Audio & Video Production', path: '/services' },
      { id: 'fs-3', label: 'Artist Management', path: '/services' },
      { id: 'fs-4', label: 'Music Distribution', path: '/services' },
      { id: 'fs-5', label: 'Digital Marketing', path: '/services' },
      { id: 'fs-6', label: 'Brand Collaborations', path: '/services' },
      { id: 'fs-7', label: 'Pre-Wedding Shoot', path: '/pre-wedding' },
    ],
    footerContactHeading: 'CONTACT US',
    footerStatusText: 'STUDIO ACTIVE • JAIPUR',
    footerStatusEnabled: true,
    footerBackToTopEnabled: true,
    footerAdminLinkEnabled: true,

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
    preWedding: initialPreWeddingData,
  };
}

function safeMergeCollections<T extends { id: string; updatedAt?: string }>(
  entityName: string,
  localItems: T[] = [],
  remoteItems: T[] = []
): T[] {
  if (!remoteItems || remoteItems.length === 0) {
    return localItems;
  }
  if (!localItems || localItems.length === 0) {
    return remoteItems;
  }

  const mergedMap = new Map<string, T>();
  const remoteMap = new Map<string, T>(remoteItems.map((item) => [item.id, item]));

  // 1. Process all local records
  for (const local of localItems) {
    const remote = remoteMap.get(local.id);
    if (!remote) {
      // Exists in JSON but not in Supabase: DO NOT DELETE, preserve in local cache!
      console.log(`[Sync] Preserving local record in vexo_db.json: ${entityName} ID "${local.id}"`);
      mergedMap.set(local.id, local);
    } else {
      // Exists in both: compare and synchronize safely
      const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
      const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
      if (remoteTime >= localTime) {
        mergedMap.set(local.id, { ...local, ...remote });
      } else {
        mergedMap.set(local.id, { ...remote, ...local });
      }
    }
  }

  // 2. Add remote records that did not exist in JSON
  for (const remote of remoteItems) {
    if (!mergedMap.has(remote.id)) {
      console.log(`[Supabase -> vexo_db.json] New record found in Supabase: ${entityName} ID "${remote.id}", merging into local cache.`);
      mergedMap.set(remote.id, remote);
    }
  }

  return Array.from(mergedMap.values());
}

class DatabaseStore {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;
  private syncPromise: Promise<boolean> | null = null;

  constructor() {
    ensureDataDirectory();
    this.data = this.load();
    this.syncPromise = initPostgresSync(this.data, (authoritativeData) => {
      this.hydrateFromPostgres(authoritativeData);
    }).catch((err) => {
      console.warn('[DatabaseStore] PostgreSQL init background error:', err?.message || err);
      return false;
    });
  }

  public async waitForSync(timeoutMs: number = 6000): Promise<boolean> {
    if (!this.syncPromise) return false;
    return Promise.race([
      this.syncPromise,
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
    ]);
  }

  public hydrateFromPostgres(pgData: Partial<DatabaseSchema>) {
    if (pgData.homepage) {
      const cur = this.data.homepage;
      const remote = pgData.homepage;
      this.data.homepage = {
        ...cur,
        ...remote,
        reviews: (remote.reviews && remote.reviews.length > 0) ? remote.reviews : (cur.reviews || []),
        selectedAlbumIds: (remote.selectedAlbumIds && remote.selectedAlbumIds.length > 0) ? remote.selectedAlbumIds : (cur.selectedAlbumIds || []),
        featuredArtistIds: (remote.featuredArtistIds && remote.featuredArtistIds.length > 0) ? remote.featuredArtistIds : (cur.featuredArtistIds || []),
        featuredEventIds: (remote.featuredEventIds && remote.featuredEventIds.length > 0) ? remote.featuredEventIds : (cur.featuredEventIds || []),
        featuredVideoIds: (remote.featuredVideoIds && remote.featuredVideoIds.length > 0) ? remote.featuredVideoIds : (cur.featuredVideoIds || []),
      };
    }
    if (pgData.siteSettings) {
      const cur = this.data.siteSettings;
      const remote = pgData.siteSettings;
      this.data.siteSettings = {
        ...cur,
        ...remote,
        footerQuickLinks: (remote.footerQuickLinks && remote.footerQuickLinks.length > 0) ? remote.footerQuickLinks : (cur.footerQuickLinks || []),
        footerServicesLinks: (remote.footerServicesLinks && remote.footerServicesLinks.length > 0) ? remote.footerServicesLinks : (cur.footerServicesLinks || []),
      };
    }
    if (pgData.preWedding) {
      const cur = this.data.preWedding;
      const remote = pgData.preWedding;
      this.data.preWedding = {
        ...cur,
        ...remote,
        studioInfo: { ...(cur?.studioInfo || {}), ...(remote.studioInfo || {}) },
        directorInfo: { ...(cur?.directorInfo || {}), ...(remote.directorInfo || {}) },
        heroStats: (remote.heroStats && remote.heroStats.length > 0) ? remote.heroStats : (cur?.heroStats || []),
        processSteps: (remote.processSteps && remote.processSteps.length > 0) ? remote.processSteps : (cur?.processSteps || []),
        videos: (remote.videos && remote.videos.length > 0) ? remote.videos : (cur?.videos || []),
        portfolioGallery: (remote.portfolioGallery && remote.portfolioGallery.length > 0) ? remote.portfolioGallery : (cur?.portfolioGallery || []),
        coverageTypes: (remote.coverageTypes && remote.coverageTypes.length > 0) ? remote.coverageTypes : (cur?.coverageTypes || []),
        coupleStories: (remote.coupleStories && remote.coupleStories.length > 0) ? remote.coupleStories : (cur?.coupleStories || []),
        packages: (remote.packages && remote.packages.length > 0) ? remote.packages : (cur?.packages || []),
        weddingPackages: (remote.weddingPackages && remote.weddingPackages.length > 0) ? remote.weddingPackages : (cur?.weddingPackages || []),
        customServices: (remote.customServices && remote.customServices.length > 0) ? remote.customServices : (cur?.customServices || []),
        addOns: (remote.addOns && remote.addOns.length > 0) ? remote.addOns : (cur?.addOns || []),
        whyUsPillars: (remote.whyUsPillars && remote.whyUsPillars.length > 0) ? remote.whyUsPillars : (cur?.whyUsPillars || []),
        weddingDayStories: (remote.weddingDayStories && Object.keys(remote.weddingDayStories).length > 0) ? remote.weddingDayStories : (cur?.weddingDayStories || {} as any),
      };
    }

    if (pgData.services) {
      this.data.services = safeMergeCollections('Service', this.data.services, pgData.services);
    }
    if (pgData.contactRequests) {
      this.data.contactRequests = safeMergeCollections('ContactRequest', this.data.contactRequests, pgData.contactRequests);
    }
    if (pgData.artists) {
      this.data.artists = safeMergeCollections('Artist', this.data.artists, pgData.artists);
    }
    if (pgData.artistSocials) {
      this.data.artistSocials = safeMergeCollections('ArtistSocial', this.data.artistSocials, pgData.artistSocials);
    }
    if (pgData.albums) {
      this.data.albums = safeMergeCollections('Album', this.data.albums, pgData.albums);
    }
    if (pgData.tracks) {
      this.data.tracks = safeMergeCollections('Track', this.data.tracks, pgData.tracks);
    }
    if (pgData.events) {
      this.data.events = safeMergeCollections('Event', this.data.events, pgData.events);
    }
    if (pgData.eventArtists) {
      this.data.eventArtists = safeMergeCollections('EventArtist', this.data.eventArtists, pgData.eventArtists);
    }
    if (pgData.videos) {
      this.data.videos = safeMergeCollections('Video', this.data.videos, pgData.videos);
    }
    if (pgData.media) {
      this.data.media = safeMergeCollections('Media', this.data.media, pgData.media);
    }
    if (pgData.adminUsers) {
      this.data.adminUsers = safeMergeCollections('AdminUser', this.data.adminUsers, pgData.adminUsers);
    }
    if (pgData.activityLogs) {
      this.data.activityLogs = safeMergeCollections('ActivityLog', this.data.activityLogs, pgData.activityLogs);
    }

    this.persistSync(this.data);
    console.log('[DatabaseStore] ✅ vexo_db.json cache successfully synchronized with Supabase PostgreSQL.');
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
            reviews: parsed.homepage.reviews && parsed.homepage.reviews.length > 0 ? parsed.homepage.reviews : initial.homepage.reviews,
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
          siteSettings: parsed.siteSettings ? { ...initial.siteSettings, ...parsed.siteSettings } : initial.siteSettings,
          activityLogs: parsed.activityLogs || initial.activityLogs,
          preWedding: parsed.preWedding || initial.preWedding,
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
    this.persistSync(this.data);
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
      create: async (item: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const user: AdminUser = {
          ...item,
          id: generateId('adm'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.adminUsers.push(user);
        await syncAdminUserToPostgres(user);
        this.persist();
        return user;
      },
      update: async (id: string, updates: Partial<AdminUser>) => {
        const index = this.data.adminUsers.findIndex((u) => u.id === id);
        if (index === -1) return null;
        this.data.adminUsers[index] = {
          ...this.data.adminUsers[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncAdminUserToPostgres(this.data.adminUsers[index]);
        this.persist();
        return this.data.adminUsers[index];
      },
      delete: async (id: string) => {
        const index = this.data.adminUsers.findIndex((u) => u.id === id);
        if (index === -1) return false;
        this.data.adminUsers.splice(index, 1);
        await deleteAdminUserFromPostgres(id);
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
      create: async (item: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>, socials?: Array<{ platform: string; url: string }>) => {
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

        const createdArtist = this.artists.findById(id);
        if (createdArtist) {
          await syncArtistToPostgres(createdArtist, createdArtist.socials);
        }
        this.persist();
        return createdArtist;
      },
      update: async (id: string, updates: Partial<Artist>, socials?: Array<{ platform: string; url: string }>) => {
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

        const updatedArtist = this.artists.findById(id);
        if (updatedArtist) {
          await syncArtistToPostgres(updatedArtist, updatedArtist.socials);
        }
        this.persist();
        return updatedArtist;
      },
      delete: async (id: string) => {
        const index = this.data.artists.findIndex((a) => a.id === id);
        if (index === -1) return false;
        this.data.artists.splice(index, 1);
        this.data.artistSocials = this.data.artistSocials.filter((s) => s.artistId !== id);
        this.data.eventArtists = this.data.eventArtists.filter((ea) => ea.artistId !== id);
        await deleteArtistFromPostgres(id);
        this.persist();
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
      create: async (item: Omit<Album, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const album: Album = {
          ...item,
          id: generateId('alb'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.albums.push(album);
        await syncAlbumToPostgres(album);
        this.persist();
        return album;
      },
      update: async (id: string, updates: Partial<Album>) => {
        const index = this.data.albums.findIndex((a) => a.id === id);
        if (index === -1) return null;
        this.data.albums[index] = {
          ...this.data.albums[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        const updated = this.albums.findById(id);
        if (updated) {
          await syncAlbumToPostgres(updated);
        }
        this.persist();
        return updated;
      },
      delete: async (id: string) => {
        const index = this.data.albums.findIndex((a) => a.id === id);
        if (index === -1) return false;
        this.data.albums.splice(index, 1);
        this.data.tracks.forEach((t) => {
          if (t.albumId === id) t.albumId = null;
        });
        await deleteAlbumFromPostgres(id);
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
      create: async (item: Omit<Track, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const track: Track = {
          ...item,
          id: generateId('trk'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.tracks.push(track);
        await syncTrackToPostgres(track);
        // Update album trackCount
        if (track.albumId) {
          const album = this.data.albums.find((a) => a.id === track.albumId);
          if (album) {
            album.trackCount = this.data.tracks.filter((t) => t.albumId === album.id).length;
            await syncAlbumToPostgres(album);
          }
        }
        this.persist();
        return track;
      },
      update: async (id: string, updates: Partial<Track>) => {
        const index = this.data.tracks.findIndex((t) => t.id === id);
        if (index === -1) return null;
        this.data.tracks[index] = {
          ...this.data.tracks[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncTrackToPostgres(this.data.tracks[index]);
        this.persist();
        return this.data.tracks[index];
      },
      delete: async (id: string) => {
        const index = this.data.tracks.findIndex((t) => t.id === id);
        if (index === -1) return false;
        const albumId = this.data.tracks[index].albumId;
        this.data.tracks.splice(index, 1);
        await deleteTrackFromPostgres(id);
        if (albumId) {
          const album = this.data.albums.find((a) => a.id === albumId);
          if (album) {
            album.trackCount = this.data.tracks.filter((t) => t.albumId === album.id).length;
            await syncAlbumToPostgres(album);
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
      create: async (item: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>, artistIds?: string[]) => {
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

        const createdEvent = this.events.findById(id);
        if (createdEvent) {
          await syncEventToPostgres(createdEvent, createdEvent.eventArtists);
        }
        this.persist();
        return createdEvent;
      },
      update: async (id: string, updates: Partial<Event>, artistIds?: string[]) => {
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

        const updatedEvent = this.events.findById(id);
        if (updatedEvent) {
          await syncEventToPostgres(updatedEvent, updatedEvent.eventArtists);
        }
        this.persist();
        return updatedEvent;
      },
      delete: async (id: string) => {
        const index = this.data.events.findIndex((e) => e.id === id);
        if (index === -1) return false;
        this.data.events.splice(index, 1);
        this.data.eventArtists = this.data.eventArtists.filter((ea) => ea.eventId !== id);
        await deleteEventFromPostgres(id);
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
      create: async (item: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const video: Video = {
          ...item,
          id: generateId('vid'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.videos.push(video);
        await syncVideoToPostgres(video);
        this.persist();
        return video;
      },
      update: async (id: string, updates: Partial<Video>) => {
        const index = this.data.videos.findIndex((v) => v.id === id);
        if (index === -1) return null;
        this.data.videos[index] = {
          ...this.data.videos[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncVideoToPostgres(this.data.videos[index]);
        this.persist();
        return this.data.videos[index];
      },
      delete: async (id: string) => {
        const index = this.data.videos.findIndex((v) => v.id === id);
        if (index === -1) return false;
        this.data.videos.splice(index, 1);
        await deleteVideoFromPostgres(id);
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
      create: async (item: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const service: Service = {
          ...item,
          id: generateId('srv'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.services.push(service);
        await syncServiceToPostgres(service);
        this.persist();
        notifyServicesChanged();
        return service;
      },
      update: async (id: string, updates: Partial<Service>) => {
        const index = this.data.services.findIndex((s) => s.id === id);
        if (index === -1) return null;
        this.data.services[index] = {
          ...this.data.services[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncServiceToPostgres(this.data.services[index]);
        this.persist();
        notifyServicesChanged();
        return this.data.services[index];
      },
      reorder: async (serviceIds: string[]) => {
        if (Array.isArray(serviceIds)) {
          const promises: Promise<void>[] = [];
          serviceIds.forEach((id, idx) => {
            const s = this.data.services.find((item) => item.id === id);
            if (s) {
              s.order = idx + 1;
              s.updatedAt = new Date().toISOString();
              promises.push(syncServiceToPostgres(s));
            }
          });
          await Promise.all(promises);
          this.persist();
          notifyServicesChanged();
        }
        return this.services.findMany();
      },
      delete: async (id: string) => {
        const index = this.data.services.findIndex((s) => s.id === id);
        if (index === -1) return false;
        this.data.services.splice(index, 1);
        await deleteServiceFromPostgres(id);
        this.persist();
        notifyServicesChanged();
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
      create: async (item: Omit<Media, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const media: Media = {
          ...item,
          id: generateId('med'),
          createdAt: now,
          updatedAt: now,
        };
        this.data.media.push(media);
        await syncMediaToPostgres(media);
        this.persist();
        return media;
      },
      update: async (id: string, updates: Partial<Media>) => {
        const index = this.data.media.findIndex((m) => m.id === id);
        if (index === -1) return null;
        this.data.media[index] = {
          ...this.data.media[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncMediaToPostgres(this.data.media[index]);
        this.persist();
        return this.data.media[index];
      },
      delete: async (id: string) => {
        const index = this.data.media.findIndex((m) => m.id === id);
        if (index === -1) return false;
        this.data.media.splice(index, 1);
        await deleteMediaFromPostgres(id);
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
      create: async (item: Omit<ContactRequest, 'id' | 'referenceId' | 'status' | 'createdAt' | 'updatedAt'>) => {
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
        // 1. Temporarily place in in-memory store
        this.data.contactRequests.unshift(contact);

        try {
          // 2. Persist to Supabase PostgreSQL (throws if fails)
          await syncContactRequestToPostgres(contact);

          // 3. Persist local file backup/cache only after Supabase succeeded
          this.persist();
          return contact;
        } catch (err: any) {
          // Rollback in-memory state if Supabase persistence failed
          this.data.contactRequests = this.data.contactRequests.filter((c) => c.id !== contact.id);
          console.error(`[DatabaseStore] Contact request persistence failed, rolled back in-memory cache: ${err.message}`);
          throw err;
        }
      },
      update: async (id: string, updates: Partial<ContactRequest>) => {
        const index = this.data.contactRequests.findIndex((c) => c.id === id);
        if (index === -1) return null;
        const previousState = { ...this.data.contactRequests[index] };
        this.data.contactRequests[index] = {
          ...this.data.contactRequests[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        try {
          await syncContactRequestToPostgres(this.data.contactRequests[index]);
          this.persist();
          return this.data.contactRequests[index];
        } catch (err: any) {
          this.data.contactRequests[index] = previousState;
          console.error(`[DatabaseStore] Contact request update failed, rolled back in-memory cache: ${err.message}`);
          throw err;
        }
      },
      delete: async (id: string) => {
        const index = this.data.contactRequests.findIndex((c) => c.id === id);
        if (index === -1) return false;
        const removed = this.data.contactRequests.splice(index, 1)[0];
        try {
          await deleteContactRequestFromPostgres(id);
          this.persist();
          return true;
        } catch (err: any) {
          this.data.contactRequests.splice(index, 0, removed);
          console.error(`[DatabaseStore] Contact request deletion failed, rolled back in-memory cache: ${err.message}`);
          throw err;
        }
      },
    };
  }

  // --- Homepage ---
  public get homepage() {
    return {
      get: () => this.data.homepage,
      update: async (updates: Partial<Homepage>) => {
        this.data.homepage = {
          ...this.data.homepage,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncHomepageToPostgres(this.data.homepage);
        this.persist();
        return this.data.homepage;
      },
    };
  }

  // --- Site Settings ---
  public get siteSettings() {
    return {
      get: () => this.data.siteSettings,
      update: async (updates: Partial<SiteSettings>) => {
        this.data.siteSettings = {
          ...this.data.siteSettings,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncSiteSettingsToPostgres(this.data.siteSettings);
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
        syncActivityLogToPostgres(log).catch(() => {});
        this.persist();
        return log;
      },
    };
  }

  // --- Pre-Wedding Studio ---
  public get preWedding() {
    return {
      get: () => {
        if (!this.data.preWedding) {
          this.data.preWedding = initialPreWeddingData;
          this.persist();
        }
        return this.data.preWedding;
      },
      update: async (updates: Partial<PreWeddingPageData>) => {
        const current = this.preWedding.get();
        this.data.preWedding = {
          ...current,
          ...updates,
          studioInfo: {
            ...current.studioInfo,
            ...(updates.studioInfo || {}),
          },
          directorInfo: {
            ...(current.directorInfo || {}),
            ...(updates.directorInfo || {}),
          },
          heroStats: updates.heroStats || current.heroStats || [],
          processSteps: updates.processSteps || current.processSteps || [],
          videos: updates.videos || current.videos || [],
          portfolioGallery: updates.portfolioGallery || current.portfolioGallery || [],
          coverageTypes: updates.coverageTypes || current.coverageTypes || [],
          coupleStories: updates.coupleStories || current.coupleStories || [],
          packages: updates.packages || current.packages || [],
          weddingPackages: updates.weddingPackages || current.weddingPackages || [],
          weddingDayStories: updates.weddingDayStories !== undefined ? updates.weddingDayStories : current.weddingDayStories,
          customServices: updates.customServices || current.customServices || [],
          addOns: updates.addOns || current.addOns || [],
          whyUsPillars: updates.whyUsPillars || current.whyUsPillars || [],
          updatedAt: new Date().toISOString(),
        };
        await syncPreWeddingToPostgres(this.data.preWedding);
        this.persist();
        return this.data.preWedding;
      },
    };
  }
}

// Global Singleton Database Instance
export const db = new DatabaseStore();

type ServicesChangeListener = () => void;
const servicesChangeListeners: ServicesChangeListener[] = [];

export function onServicesChange(listener: ServicesChangeListener): () => void {
  servicesChangeListeners.push(listener);
  return () => {
    const idx = servicesChangeListeners.indexOf(listener);
    if (idx !== -1) {
      servicesChangeListeners.splice(idx, 1);
    }
  };
}

export function notifyServicesChanged(): void {
  servicesChangeListeners.forEach((fn) => {
    try {
      fn();
    } catch { }
  });
}

