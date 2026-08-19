// TypeScript types matching the 14 Prisma database models

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistSocial {
  id: string;
  artistId: string;
  platform: 'spotify' | 'youtube' | 'instagram' | 'twitter' | 'apple-music' | 'soundcloud' | string;
  url: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  role: string;
  avatarUrl: string;
  coverUrl?: string | null;
  bio?: string | null;
  monthlyListeners: number;
  genres: string[]; // parsed as array
  featured: boolean;
  isComingSoon: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  socials?: ArtistSocial[];
}

export interface Album {
  id: string;
  title: string;
  slug?: string | null;
  artistName: string;
  artistId?: string | null;
  coverUrl: string;
  releaseDate: string;
  year: number;
  genre: string;
  trackCount: number;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  appleMusicUrl?: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  tracks?: Track[];
}

export interface Track {
  id: string;
  title: string;
  artistName: string;
  artistId?: string | null;
  albumId?: string | null;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string | null;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  genre: string;
  plays: number;
  isPopular: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventArtist {
  id: string;
  eventId: string;
  artistId: string;
  role?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  artist?: Artist;
}

export interface Event {
  id: string;
  title: string;
  slug?: string | null;
  mainArtist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  city?: string | null;
  country?: string | null;
  ticketUrl?: string | null;
  price: string;
  status: 'upcoming' | 'live' | 'sold-out' | 'past';
  imageUrl: string;
  description?: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  eventArtists?: EventArtist[];
}

export interface Video {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  publishedAt: string;
  category: string;
  featured: boolean;
  description?: string | null;
  tags?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  number?: string;
  title: string;
  slug?: string | null;
  category?: string;
  shortDesc: string;
  fullDesc: string;
  imageUrl: string;
  icon?: string;
  features: string[];
  ctaText?: string | null;
  pricingRange?: string | null;
  specifications?: string[];
  equipmentList?: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path?: string | null;
  altText?: string | null;
  category: 'image' | 'audio' | 'video' | 'document';
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'RESOLVED' | 'ARCHIVED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Homepage {
  id: string;
  // Hero Section
  heroTagline?: string | null;
  heroHeadline?: string | null;
  heroSubtitle?: string | null;
  heroBgImage?: string | null;
  heroBgMedia?: string | null;
  featuredVideoId?: string | null;
  heroCtaText?: string | null;
  heroCtaUrl?: string | null;
  heroSecondaryCtaText?: string | null;
  heroSecondaryCtaUrl?: string | null;

  // Latest Releases Section
  releasesHeading?: string | null;
  releasesSubtitle?: string | null;
  selectedAlbumIds?: string[] | string | null;
  releasesLimit?: number | null;

  // Featured Artists Section
  artistsHeading?: string | null;
  artistsSubtitle?: string | null;
  featuredArtistIds?: string[] | string | null;

  // Featured Events Section
  eventsHeading?: string | null;
  eventsSubtitle?: string | null;
  featuredEventIds?: string[] | string | null;

  // Featured Videos Section
  videosHeading?: string | null;
  videosSubtitle?: string | null;
  featuredVideoIds?: string[] | string | null;

  // Statistics Section
  statsArtistsCount?: string | number | null;
  statsReleasesCount?: string | number | null;
  statsProjectsCount?: string | number | null;
  statsTotalStreams?: string | null;
  statsGlobalReach?: string | null;

  // About Section
  aboutBadge?: string | null;
  aboutHeading?: string | null;
  aboutDescription?: string | null;
  aboutImage?: string | null;

  // Final CTA Section
  finalCtaBadge?: string | null;
  finalCtaHeading?: string | null;
  finalCtaDescription?: string | null;
  finalCtaButtonLabel?: string | null;
  finalCtaButtonUrl?: string | null;
  finalCtaSecondaryLabel?: string | null;
  finalCtaSecondaryUrl?: string | null;

  marqueeText?: string | null;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  officeAddress?: string | null;
  copyrightText?: string | null;
  socialSpotify?: string | null;
  socialYoutube?: string | null;
  socialInstagram?: string | null;
  socialTwitter?: string | null;
  maintenanceMode: boolean;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  adminUserId?: string | null;
  adminUserName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface DatabaseSchema {
  adminUsers: AdminUser[];
  artists: Artist[];
  artistSocials: ArtistSocial[];
  albums: Album[];
  tracks: Track[];
  events: Event[];
  eventArtists: EventArtist[];
  videos: Video[];
  services: Service[];
  media: Media[];
  contactRequests: ContactRequest[];
  homepage: Homepage;
  siteSettings: SiteSettings;
  activityLogs: ActivityLog[];
}
