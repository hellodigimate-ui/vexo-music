export interface SocialLink {
  platform: 'instagram' | 'spotify' | 'youtube' | 'apple-music' | 'soundcloud' | 'twitter';
  url: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  bio?: string;
  monthlyListeners?: number;
  genres: string[];
  socialLinks?: SocialLink[];
  featured?: boolean;
  isComingSoon?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumId?: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  genre: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
  releaseDate: string;
  year: number;
  genre: string;
  trackCount?: number;
  tracks?: Track[];
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
}

export interface ServiceItem {
  id: string;
  number?: string;
  title: string;
  slug?: string;
  category?: string;
  shortDesc: string;
  fullDesc: string;
  imageUrl: string;
  icon?: string;
  features: string[];
  ctaText?: string;
  pricingRange?: string;
  plans?: any[];
  specs?: string[];
  processSteps?: any[];
  deliverables?: string[];
  faqs?: any[];
  order?: number;
  isActive?: boolean;
}

export interface ServiceDetail extends ServiceItem {
  detailedDescription?: string;
  specifications?: string[];
  equipmentList?: string[];
  pricingRange?: string;
}

export interface Event {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  city?: string;
  country?: string;
  ticketUrl?: string;
  price: string;
  status: 'upcoming' | 'sold-out' | 'live' | 'past';
  imageUrl: string;
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
  featured?: boolean;
  description?: string;
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
  referenceId: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}
