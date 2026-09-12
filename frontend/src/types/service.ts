export interface ServicePlan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  priceUSD: string;
  priceINR: string;
  duration?: string;
  revisions?: string;
  isPopular?: boolean;
  features: string[];
  deliverables?: string[];
  ctaText?: string;
}

export interface ServiceProcessStep {
  step: string;
  title: string;
  desc: string;
}

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface ServiceItem {
  id: string;
  number?: string;
  title: string;
  slug?: string;
  shortDesc: string;
  fullDesc: string;
  imageUrl: string;
  icon?: string;
  features: string[];
  category?: string;
  ctaText?: string;
  pricingRange?: string;
  order?: number;
  isActive?: boolean;
  plans?: ServicePlan[];
  specs?: string[];
  specifications?: string[];
  equipmentList?: string[];
  processSteps?: ServiceProcessStep[];
  deliverables?: string[];
  faqs?: ServiceFAQ[];
}

