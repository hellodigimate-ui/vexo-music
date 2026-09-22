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

export interface WeddingFilmItem {
  id: string;
  title: string;
  couple: string;
  location: string;
  category: 'Cinematic Film' | 'Pre-Wedding' | 'Instagram Reel' | 'Teaser' | string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  aspectRatio?: '16:9' | '9:16';
  views?: string;
  tag?: string;
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

export interface PreWeddingGalleryItem {
  id: string;
  title: string;
  category: string;
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
  studioInfo: typeof WEDDING_STUDIO_INFO & {
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
  };
  heroStats: PreWeddingHeroStat[];
  directorInfo: PreWeddingDirectorInfo;
  processSteps: PreWeddingProcessStep[];
  videos: WeddingFilmItem[];
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

export const WEDDING_STUDIO_INFO = {
  name: 'VEXO WEDDING STUDIO',
  tagline: 'WEDDING • PRE-WEDDING • CINEMATOGRAPHY',
  headline: 'Your Story. Our Frames. Forever.',
  subHeadlineHindi: "Every couple has a story of their own — and we don't just capture it, we turn it into a beautiful memory that lasts forever.",
  storyHook: "Every couple has a story of their own — and we don't just capture it, we turn it into a beautiful memory that lasts forever.",
  signatureIntro: "If you're looking for a customised package based on your budget and requirements, our team will create a personalised experience for you.",
  phone: '+91 72399-99966',
  displayPhone: '+91 72399 99966',
  email: 'contact@vexoweddingstudio.com',
  instagramHandle: '@vexoweddingstudio',
  instagramUrl: 'https://www.instagram.com/vexoweddingstudio',
  location: 'Jaipur • Udaipur • Destination Shoots Across India',
  whatsappNumber: '917239999966',
  experienceYears: '8+ Years of Excellence',
  heroBgImage: '/images/pre-wedding/hero-bride.jpg',
  stats: [
    { value: '250+', label: 'Love Stories Captured' },
    { value: 'Sony Cinema', label: 'FX3 & FX6 4K Production' },
    { value: '100%', label: 'Raw Emotion & Storytelling' },
    { value: '4.9/5', label: 'Couple Rating' },
  ],
};

export const PRE_WEDDING_PACKAGES: PreWeddingPackage[] = [
  {
    id: 'silver',
    name: 'SILVER',
    tagline: 'Perfect for a Simple & Elegant Pre-Wedding',
    priceINR: 24999,
    priceDisplay: '₹24,999',
    badge: 'CLASSIC ELEGANCE',
    isPopular: false,
    highlightText: 'Ideal for intimate, heartfelt pre-wedding moments with cinematic finesse.',
    photography: {
      photographersCount: '1 Professional Photographer',
      cameraSetup: '1 Photography Camera Setup',
      details: [
        '1 Professional Photographer',
        '1 Photography Camera',
        'Candid & Portrait Photography',
      ],
    },
    cinematography: {
      cinematographersCount: '1 Cinematographer',
      cameraSetup: '1 Professional Cinema Camera',
      details: [
        '1 Cinematographer',
        '1 Professional Cinema Camera',
        'Cinematic Video Coverage',
      ],
    },
    deliverables: [
      '1 Pre-Wedding Cinematic Film',
      '1 Highlight Video',
      '2 Instagram Reels',
      'Professionally Edited Photos',
      'Basic Colour Grading',
    ],
    shoot: {
      days: '1 Day Shoot',
      locations: '1 Location',
    },
  },
  {
    id: 'gold',
    name: 'GOLD',
    tagline: 'Our Most Popular Package',
    priceINR: 39999,
    priceDisplay: '₹39,999',
    badge: 'MOST POPULAR',
    isPopular: true,
    highlightText: 'The crowd favorite. Enhanced cinematic camera movements, sound design & bonus portraits.',
    photography: {
      photographersCount: '1 Professional Photographer',
      cameraSetup: 'Premium Camera Setup',
      details: [
        '1 Professional Photographer',
        'Premium Camera Setup',
        'Candid + Creative Portraits',
      ],
    },
    cinematography: {
      cinematographersCount: '1 Professional Cinematographer',
      cameraSetup: 'Sony Cinema Camera Setup',
      details: [
        '1 Professional Cinematographer',
        'Sony Cinema Camera Setup',
        'Gimbal Cinematography',
        'Creative Cinematic Shots',
      ],
    },
    deliverables: [
      '1 Cinematic Pre-Wedding Film',
      '1 Trailer / Teaser',
      '4 Instagram Reels',
      'Professionally Edited Photos',
      'Premium Colour Grading',
      'Cinematic Sound Design',
    ],
    shoot: {
      days: '1 Full Day Shoot',
      locations: 'Up to 2 Locations',
    },
    bonus: [
      'Couple Portrait Session',
      'Creative Reel Concepts',
    ],
  },
  {
    id: 'platinum',
    name: 'PLATINUM',
    tagline: 'THE COMPLETE PRE-WEDDING EXPERIENCE',
    priceINR: 59999,
    priceDisplay: '₹59,999',
    badge: 'ROYAL EXPERIENCE',
    isPopular: false,
    highlightText: 'For couples who want a premium cinematic experience with 2 shoot days & full creative direction.',
    photography: {
      photographersCount: '1 Professional Photographer',
      cameraSetup: 'Premium Photography Setup',
      details: [
        '1 Professional Photographer',
        'Premium Photography Setup',
        'Candid Photography',
        'Creative Couple Portraits',
      ],
    },
    cinematography: {
      cinematographersCount: '2 Cinematographers',
      cameraSetup: 'Sony Cinema Camera Setup',
      details: [
        '2 Cinematographers',
        'Sony Cinema Camera Setup',
        'Gimbal Setup',
        'Cinematic Camera Movements',
        'Creative Storytelling Shots',
      ],
    },
    deliverables: [
      '1 Premium Cinematic Pre-Wedding Film',
      '1 Cinematic Trailer',
      '6 Instagram Reels',
      '1 Couple Introduction Reel',
      'Professionally Edited Photos',
      'Advanced Colour Grading',
      'Professional Sound Design',
    ],
    shoot: {
      days: '2 Shoot Days',
      locations: 'Up to 3 Locations',
    },
    platinumExperience: [
      'Concept Planning',
      'Shot Planning',
      'Location Guidance',
      'Outfit Coordination Guidance',
      'Dedicated Creative Direction',
    ],
  },
];

export const CUSTOM_PACKAGE_SERVICES: CustomServiceOption[] = [
  {
    id: 'opt-photography',
    name: 'Photography',
    icon: 'Camera',
    category: 'core',
    startingPriceINR: 15000,
    unit: 'per day',
    description: 'Candid & traditional portrait photography with prime lens aesthetics.',
  },
  {
    id: 'opt-cinematography',
    name: 'Cinematography',
    icon: 'Video',
    category: 'core',
    startingPriceINR: 20000,
    unit: 'per day',
    description: 'High-speed Sony Cinema Rig with gimbal movements & storytelling angles.',
  },
  {
    id: 'opt-wedding-film',
    name: 'Wedding Film',
    icon: 'Film',
    category: 'deliverable',
    startingPriceINR: 18000,
    unit: 'per film',
    description: 'Full-length 15-20 min master wedding documentary with vows & celebration highlights.',
  },
  {
    id: 'opt-pre-wedding',
    name: 'Pre-Wedding Shoot',
    icon: 'Heart',
    category: 'core',
    startingPriceINR: 24999,
    unit: 'package starting',
    description: 'Scenic outdoor romance shoot at heritage forts, lakes or scenic destinations.',
  },
  {
    id: 'opt-reels',
    name: 'Instagram Reels',
    icon: 'Smartphone',
    category: 'deliverable',
    startingPriceINR: 2000,
    unit: 'per reel',
    description: 'Trending 9:16 vertical cuts tailored for viral social media audio & aesthetics.',
  },
  {
    id: 'opt-drone',
    name: 'Drone Coverage',
    icon: 'Plane',
    category: 'coverage',
    startingPriceINR: 10000,
    unit: 'per session',
    description: 'Cinematic 4K aerial bird-eye views of your majestic venues and rituals.',
  },
  {
    id: 'opt-trailer',
    name: 'Trailer & Teaser',
    icon: 'Clapperboard',
    category: 'deliverable',
    startingPriceINR: 8000,
    unit: 'per cut',
    description: 'Fast-paced 60-90 second cinematic movie trailer for instant sharing.',
  },
  {
    id: 'opt-makeup',
    name: 'Makeup & Styling',
    icon: 'Sparkles',
    category: 'styling',
    startingPriceINR: 7000,
    unit: 'per look',
    description: 'Certified bridal makeup artists for glowing, camera-ready glamour.',
  },
  {
    id: 'opt-costume',
    name: 'Costume / Styling Assistance',
    icon: 'Shirt',
    category: 'styling',
    startingPriceINR: 5000,
    unit: 'per shoot',
    description: 'Color palette coordination, royal drapery & couple outfit harmony guidance.',
  },
  {
    id: 'opt-location',
    name: 'Location Assistance',
    icon: 'MapPin',
    category: 'coverage',
    startingPriceINR: 4000,
    unit: 'curated access',
    description: 'Exclusive permissions, sunset scouting & hidden palace spots in Rajasthan.',
  },
  {
    id: 'opt-album',
    name: 'Album & Prints',
    icon: 'BookOpen',
    category: 'deliverable',
    startingPriceINR: 12000,
    unit: 'per luxury book',
    description: 'Handcrafted flush-mount leather or acrylic photo book with matte Fuji crystal pages.',
  },
];

export const WHY_US_PILLARS: WhyUsPillar[] = [
  {
    id: 'pillar-1',
    title: 'CINEMATIC STORYTELLING',
    description: "Your wedding isn't just recorded — it's crafted into a cinematic story that you can relive for years to come.",
    icon: 'Film',
    tag: 'FILMIC NARRATIVE',
  },
  {
    id: 'pillar-2',
    title: 'PROFESSIONAL EQUIPMENT',
    description: 'High-quality production powered by professional Sony camera systems, premium lenses, lighting and stabilisation equipment.',
    icon: 'Camera',
    tag: 'SONY CINEMA FX LINE',
  },
  {
    id: 'pillar-3',
    title: 'PREMIUM EDITING & DI',
    description: 'Professional editing, colour grading and cinematic finishing that bring every frame to life.',
    icon: 'Palette',
    tag: 'DAVINCI RESOLVE COLOR',
  },
  {
    id: 'pillar-4',
    title: 'CREATIVE DIRECTION',
    description: 'Creative concepts, shot planning and direction designed to make every shoot visually unique and memorable.',
    icon: 'Compass',
    tag: 'BESPOKE CONCEPTS',
  },
  {
    id: 'pillar-5',
    title: 'PERSONAL ATTENTION',
    description: 'Every couple receives a personalised approach so your personality, connection and story naturally shine through on screen.',
    icon: 'HeartHandshake',
    tag: 'DEDICATED TEAM',
  },
];

export const ADD_ON_SERVICES: AddOnService[] = [
  {
    id: 'addon-drone',
    title: 'Drone Coverage',
    priceDisplay: 'Starting ₹10,000',
    priceINR: 10000,
    description: 'Cinematic 4K aerial bird-eye views of your majestic venues and rituals.',
    badge: 'POPULAR',
  },
  {
    id: 'addon-reel',
    title: 'Additional Reel',
    priceDisplay: 'Starting ₹2,000',
    priceINR: 2000,
    description: 'Tailored 9:16 vertical video cut with trending music for Instagram & YouTube Shorts.',
  },
  {
    id: 'addon-shoot-day',
    title: 'Additional Shoot Day',
    priceDisplay: 'Starting ₹10,000',
    priceINR: 10000,
    description: 'Extra day of full coverage for extended celebrations, Mehendi, Sangeet or post-wedding.',
  },
  {
    id: 'addon-location',
    title: 'Additional Location',
    priceDisplay: 'As per requirement',
    priceINR: 4000,
    description: 'Shoot at additional forts, lakeside pavilions or architectural wonders.',
  },
  {
    id: 'addon-album',
    title: 'Premium Album',
    priceDisplay: 'As per selection',
    priceINR: 12000,
    description: 'Luxury handcrafted Italian leather album with HD non-tearable matte pages.',
    badge: 'KEEPSAKE',
  },
  {
    id: 'addon-makeup',
    title: 'Makeup Artist',
    priceDisplay: 'As per requirement',
    priceINR: 8000,
    description: 'Celebrity-grade bridal makeup & hair artist on set during shoot sessions.',
  },
  {
    id: 'addon-costume',
    title: 'Costume / Styling',
    priceDisplay: 'As per requirement',
    priceINR: 5000,
    description: 'Personalized wardrobe selection & traditional royal Rajasthani attire assistance.',
  },
  {
    id: 'addon-extra-photo',
    title: 'Additional Photography',
    priceDisplay: 'As per requirement',
    priceINR: 12000,
    description: 'Dedicated second candid photographer capturing candid guests & family smiles.',
  },
  {
    id: 'addon-extra-cinema',
    title: 'Additional Cinematographer',
    priceDisplay: 'As per requirement',
    priceINR: 15000,
    description: 'Secondary Sony Cinema camera operator for multi-angle emotional cuts.',
  },
];

export const FEATURED_WEDDING_FILMS: WeddingFilmItem[] = [
  {
    id: 'film-1',
    title: 'Eternal Twilight at Nahargarh Fort',
    couple: 'Aarav & Meera',
    location: 'Jaipur, Rajasthan',
    category: 'Pre-Wedding',
    duration: '4:18',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=HcEcM5AtEZ8',
    aspectRatio: '16:9',
    views: '124K Views',
  },
  {
    id: 'film-2',
    title: 'Royal Vows Under The Palace Stars',
    couple: 'Kabir & Radhika',
    location: 'Udaipur City Palace',
    category: 'Cinematic Film',
    duration: '6:42',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=PsmXAUKjR5Y',
    aspectRatio: '16:9',
    views: '280K Views',
  },
  {
    id: 'film-3',
    title: 'The Golden Hour Romance',
    couple: 'Rohan & Sanjana',
    location: 'Sam Sand Dunes, Jaisalmer',
    category: 'Pre-Wedding',
    duration: '3:54',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=HcEcM5AtEZ8',
    aspectRatio: '16:9',
    views: '98K Views',
  },
  {
    id: 'reel-1',
    title: 'Candid Glimpse of the First Look',
    couple: 'Kunal & Divya',
    location: 'Rambagh Palace, Jaipur',
    category: 'Instagram Reel',
    duration: '0:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=PsmXAUKjR5Y',
    aspectRatio: '9:16',
    views: '450K Views',
  },
  {
    id: 'reel-2',
    title: 'The Royal Varmala Firework Symphony',
    couple: 'Yuvraj & Aditi',
    location: 'Jagmandir Island, Udaipur',
    category: 'Instagram Reel',
    duration: '0:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=HcEcM5AtEZ8',
    aspectRatio: '9:16',
    views: '610K Views',
  },
  {
    id: 'reel-3',
    title: 'Pure Sunset Magic in Udaipur',
    couple: 'Dev & Ananya',
    location: 'Lake Pichola',
    category: 'Instagram Reel',
    duration: '0:28',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=PsmXAUKjR5Y',
    aspectRatio: '9:16',
    views: '320K Views',
  },
];

export const DEFAULT_WEDDING_DAY_STORIES: WeddingDayStoriesData = {
  eyebrow: 'WEDDING DAY COVERAGE',
  heading: 'Wedding Day Stories',
  supportingText:
    'Beyond the pre-wedding, we capture every emotion, ritual and celebration of your wedding day.',
  quote: 'Every moment deserves its frame.',
  ctaText: 'VIEW WEDDING STORIES →',
  ctaLink: '#portfolio-gallery',
  stories: [
    {
      id: 'wds-rituals',
      category: 'Wedding Rituals',
      title: 'The Sacred Varmala Symphony',
      location: 'Rambagh Palace, Jaipur',
      couple: 'Yuvraj & Aditi',
      imageUrl:
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=85',
      featured: true,
    },
    {
      id: 'wds-candid',
      category: 'Candid Moments',
      title: 'Spontaneous Laughter & Joy',
      location: 'Samode Palace Courtyard',
      couple: 'Kabir & Radhika',
      imageUrl:
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=85',
    },
    {
      id: 'wds-portraits',
      category: 'Couple Portraits',
      title: 'Heritage Palace Elegance',
      location: 'Amer Fort, Jaipur',
      couple: 'Aarav & Simran',
      imageUrl:
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=85',
    },
    {
      id: 'wds-family',
      category: 'Family & Celebrations',
      title: 'Grand Baraat & Family Blessings',
      location: 'Jagmandir Island, Udaipur',
      couple: 'Kunal & Divya',
      imageUrl:
        'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=85',
    },
  ],
};

export const DEFAULT_WEDDING_PLANS: PreWeddingPackage[] = [
  {
    id: 'wedding-essential',
    category: 'WEDDING',
    name: 'ESSENTIAL WEDDING',
    tagline: 'For intimate wedding celebrations',
    priceINR: 0,
    priceDisplay: 'Custom Quote',
    badge: 'INTIMATE CELEBRATIONS',
    isPopular: false,
    highlightText: 'Artfully curated coverage for close-knit and meaningful ceremonies.',
    foodTravel: 'Food, Travel — Paid By Client / Company',
    ctaText: 'Choose Essential Wedding',
    photography: {
      photographersCount: 'Professional Wedding Photographer',
      cameraSetup: 'High-Res Sony Cinema Still Rig',
      details: [
        'Professional wedding photography',
        'Candid photography',
        'Traditional ceremony coverage',
      ],
    },
    cinematography: {
      cinematographersCount: 'Professional Cinematographer',
      cameraSetup: '4K Cinema Camera Setup',
      details: ['Wedding cinematography'],
    },
    deliverables: [
      'Professionally edited photographs',
      'Highlight wedding film',
    ],
    shoot: {
      days: '1 Shoot Day',
      locations: 'Up to 1 Location',
    },
  },
  {
    id: 'wedding-signature',
    category: 'WEDDING',
    name: 'SIGNATURE WEDDING',
    tagline: 'For complete wedding-day coverage',
    priceINR: 0,
    priceDisplay: 'Custom Quote',
    badge: 'MOST POPULAR',
    isPopular: true,
    highlightText: 'The quintessential wedding day chronicle blending candid realism with cinema.',
    foodTravel: 'Food, Travel — Paid By Client / Company',
    ctaText: 'Choose Signature Wedding',
    photography: {
      photographersCount: 'Professional Photographers Team',
      cameraSetup: 'Dual Full-Frame Cinema Cameras',
      details: [
        'Professional photographers',
        'Candid + traditional photography',
      ],
    },
    cinematography: {
      cinematographersCount: 'Professional Cinematographer',
      cameraSetup: 'Gimbal + 4K Cinema Rig',
      details: [
        'Professional cinematographer',
        'Cinematic wedding coverage',
      ],
    },
    deliverables: [
      'Professionally edited photos',
      'Premium colour grading',
      'Cinematic wedding film',
      'Social media reels',
    ],
    shoot: {
      days: '1–2 Shoot Days',
      locations: 'Up to 2 Locations',
    },
  },
  {
    id: 'wedding-royal',
    category: 'WEDDING',
    name: 'ROYAL WEDDING',
    tagline: 'For complete multi-event wedding coverage',
    priceINR: 0,
    priceDisplay: 'Custom Quote',
    badge: 'ROYAL LUXURY',
    isPopular: false,
    highlightText: 'Multi-crew cinematic grandeur capturing every ritual and royal celebration.',
    foodTravel: 'Food, Travel — Paid By Client / Company',
    ctaText: 'Choose Royal Wedding',
    photography: {
      photographersCount: 'Multiple Photographers Crew',
      cameraSetup: 'Multi-Camera Sony Master Rig',
      details: [
        'Multiple photographers',
        'Premium candid photography',
        'Traditional ceremony coverage',
      ],
    },
    cinematography: {
      cinematographersCount: 'Multiple Cinematographers Crew',
      cameraSetup: 'Multi-Angle Cinema & Drone Setup',
      details: [
        'Multiple cinematographers',
        'Full cinematic coverage',
      ],
    },
    deliverables: [
      'Wedding teaser',
      'Full wedding film',
      'Multiple Instagram reels',
      'Premium colour grading',
      'Professional sound design',
    ],
    shoot: {
      days: '2–3 Shoot Days',
      locations: 'Multiple Locations',
    },
  },
];

