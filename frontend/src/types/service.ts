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
}
