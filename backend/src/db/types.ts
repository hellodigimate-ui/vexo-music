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
  plans?: any[];
  specs?: string[];
  processSteps?: any[];
  deliverables?: string[];
  faqs?: any[];
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
  status: 'NEW' | 'CONTACTED' | 'CLOSED' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  clientName: string;
  roleOrProject: string;
  rating: number; // 1 to 5
  reviewText: string;
  avatarUrl?: string | null;
  category?: string | null;
  verified?: boolean;
  date?: string | null;
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

  // Reviews / Testimonials Section
  reviewsHeading?: string | null;
  reviewsSubtitle?: string | null;
  reviewsBadge?: string | null;
  reviews?: ReviewItem[] | null;

  marqueeText?: string | null;
  updatedAt: string;
}

export interface FooterLink {
  id: string;
  label: string;
  path: string;
  isExternal?: boolean;
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
  socialAppleMusic?: string | null;
  socialFacebook?: string | null;
  socialSoundcloud?: string | null;
  maintenanceMode: boolean;

  // Footer Customization
  footerBio?: string | null;
  footerQuickLinksHeading?: string | null;
  footerQuickLinks?: FooterLink[] | null;
  footerServicesHeading?: string | null;
  footerServicesLinks?: FooterLink[] | null;
  footerContactHeading?: string | null;
  footerStatusText?: string | null;
  footerStatusEnabled?: boolean;
  footerBackToTopEnabled?: boolean;
  footerAdminLinkEnabled?: boolean;

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

export interface PreWeddingPackage {
  id: string;
  category?: 'PRE_WEDDING' | 'WEDDING';
  name: string;
  tagline: string;
  priceINR: number;
  priceDisplay: string;
  badge?: string;
  isPopular?: boolean;
  highlightText?: string;
  foodTravel?: string;
  ctaText?: string;
  whatsappMessage?: string;
  photography: {
    photographersCount: string;
    cameraSetup: string;
    details: string[];
  };
  cinematography: {
    cinematographersCount: string;
    cameraSetup: string;
    details: string[];
  };
  deliverables: string[];
  shoot: {
    days: string;
    locations: string;
  };
  bonus?: string[];
  platinumExperience?: string[];
}

export interface CustomServiceOption {
  id: string;
  name: string;
  icon: string;
  category: 'core' | 'coverage' | 'styling' | 'deliverable';
  startingPriceINR: number;
  unit: string;
  description: string;
}

export interface WhyUsPillar {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
}

export interface AddOnService {
  id: string;
  title: string;
  priceDisplay: string;
  priceINR: number;
  description: string;
  badge?: string;
}

export interface PreWeddingStudioInfo {
  name: string;
  tagline: string;
  headline: string;
  subHeadlineHindi: string;
  storyHook: string;
  signatureIntro: string;
  phone: string;
  displayPhone: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  location: string;
  whatsappNumber: string;
  experienceYears: string;
  heroBgImage?: string;
}

export interface PreWeddingHeroStat {
  number: string;
  title: string;
  description: string;
}

export interface PreWeddingDirectorInfo {
  name: string;
  title: string;
  quote: string;
  bio: string;
  image: string;
  experienceYears: string;
}

export interface PreWeddingProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface PreWeddingVideoItem {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  location: string;
  couple: string;
  tag?: string;
}

export interface PreWeddingGalleryItem {
  id: string;
  title: string;
  category: 'Weddings' | 'Pre-Wedding' | 'Portraits' | string;
  imageUrl: string;
  location: string;
  couple: string;
}

export interface PreWeddingCoverageType {
  id: string;
  title: string;
  description: string;
  tag: string;
  linkText?: string;
}

export interface PreWeddingCoupleStory {
  id: string;
  title: string;
  couple: string;
  location: string;
  imageUrl: string;
  quote: string;
}

export interface WeddingDayStoryItem {
  id: string;
  category: 'Candid Moments' | 'Wedding Rituals' | 'Couple Portraits' | 'Family & Celebrations' | string;
  title: string;
  location?: string;
  couple?: string;
  imageUrl: string;
  featured?: boolean;
}

export interface WeddingDayStoriesData {
  eyebrow?: string;
  heading?: string;
  supportingText?: string;
  quote?: string;
  ctaText?: string;
  ctaLink?: string;
  stories?: WeddingDayStoryItem[];
}

export interface PreWeddingPageData {
  id: string;
  studioInfo: PreWeddingStudioInfo;
  heroStats: PreWeddingHeroStat[];
  directorInfo: PreWeddingDirectorInfo;
  processSteps: PreWeddingProcessStep[];
  videos: PreWeddingVideoItem[];
  portfolioGallery: PreWeddingGalleryItem[];
  coverageTypes: PreWeddingCoverageType[];
  coupleStories: PreWeddingCoupleStory[];
  packages: PreWeddingPackage[];
  weddingPackages?: PreWeddingPackage[];
  customServices: CustomServiceOption[];
  addOns: AddOnService[];
  whyUsPillars: WhyUsPillar[];
  weddingDayStories?: WeddingDayStoriesData;
  updatedAt: string;
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
  preWedding?: PreWeddingPageData;
}

