export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number | string;
  coverUrl: string;
  genre: string;
  spotifyUrl: string;
  youtubeUrl: string;
  trackCount?: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  duration: number; // in seconds
  audioUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  genre: string;
  plays?: number;
  likes?: number;
  isPopular?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  followers?: number;
  monthlyListeners?: number;
  genres: string[];
  socialLinks?: SocialLink[];
  isComingSoon?: boolean;
}

export interface SocialLink {
  platform: 'spotify' | 'youtube' | 'instagram' | 'twitter' | 'apple' | 'soundcloud';
  url: string;
}

export interface Event {
  id: string;
  title: string;
  artist: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  imageUrl: string;
  price: string;
  status: 'upcoming' | 'sold-out' | 'live';
  description?: string;
  ticketUrl?: string;
}

export interface Service {
  id: string;
  number?: string;
  title: string;
  slug?: string;
  description?: string;
  shortDesc?: string;
  fullDesc?: string;
  imageUrl?: string;
  icon?: string;
  iconName?: string;
  features: string[];
  category?: 'production' | 'distribution' | 'management' | 'marketing' | string;
  ctaText?: string;
  pricingRange?: string;
  order?: number;
  isActive?: boolean;
}

export interface Video {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  videoUrl?: string;
  youtubeId: string;
  category: 'Official Music Videos' | 'Live Performances' | 'Behind The Scenes' | 'Visualizers';
  description?: string;
  featured?: boolean;
  duration: string;
  views: number;
  likes?: number;
  publishedAt: string;
  tags?: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  referenceId?: string;
  timestamp?: string;
}

export interface Homepage {
  id?: string;
  // Hero Section
  heroTagline?: string;
  heroHeadline?: string;
  heroSubtitle?: string;
  heroBgImage?: string;
  heroBgMedia?: string;
  featuredVideoId?: string;
  heroCtaText?: string;
  heroCtaUrl?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaUrl?: string;

  // Latest Releases Section
  releasesHeading?: string;
  releasesSubtitle?: string;
  selectedAlbumIds?: string[];
  releasesLimit?: number;

  // Featured Artists Section
  artistsHeading?: string;
  artistsSubtitle?: string;
  featuredArtistIds?: string[];

  // Featured Events Section
  eventsHeading?: string;
  eventsSubtitle?: string;
  featuredEventIds?: string[];

  // Featured Videos Section
  videosHeading?: string;
  videosSubtitle?: string;
  featuredVideoIds?: string[];

  // Statistics Section
  statsArtistsCount?: string | number;
  statsReleasesCount?: string | number;
  statsProjectsCount?: string | number;
  statsTotalStreams?: string;
  statsGlobalReach?: string;

  // About Section
  aboutBadge?: string;
  aboutHeading?: string;
  aboutDescription?: string;
  aboutImage?: string;

  // Final CTA Section
  finalCtaBadge?: string;
  finalCtaHeading?: string;
  finalCtaDescription?: string;
  finalCtaButtonLabel?: string;
  finalCtaButtonUrl?: string;
  finalCtaSecondaryLabel?: string;
  finalCtaSecondaryUrl?: string;
  // Reviews / Testimonials Section
  reviewsHeading?: string;
  reviewsSubtitle?: string;
  reviewsBadge?: string;
  reviews?: ReviewItem[];

  marqueeText?: string;
  updatedAt?: string;
}

export interface ReviewItem {
  id: string;
  clientName: string;
  roleOrProject: string;
  rating: number; // 1 to 5
  reviewText: string;
  avatarUrl?: string;
  category?: string;
  verified?: boolean;
  date?: string;
}

export interface FooterLink {
  id: string;
  label: string;
  path: string;
  isExternal?: boolean;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  siteDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  officeAddress?: string;
  copyrightText?: string;
  socialSpotify?: string;
  socialYoutube?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialAppleMusic?: string;
  socialFacebook?: string;
  socialSoundcloud?: string;
  maintenanceMode?: boolean;

  // Footer Customization
  footerBio?: string;
  footerQuickLinksHeading?: string;
  footerQuickLinks?: FooterLink[];
  footerServicesHeading?: string;
  footerServicesLinks?: FooterLink[];
  footerContactHeading?: string;
  footerStatusText?: string;
  footerStatusEnabled?: boolean;
  footerBackToTopEnabled?: boolean;
  footerAdminLinkEnabled?: boolean;

  updatedAt?: string;
}
