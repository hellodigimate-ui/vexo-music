import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import dotenv from 'dotenv';
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
  PreWeddingPageData,
} from './types.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnected = false;
let retryTimer: NodeJS.Timeout | null = null;

// Track existing columns for each table to avoid SQL errors when schemas evolve
const tableColumnsMap: Map<string, Set<string>> = new Map();

/**
 * Ensures required CMS columns and tables exist in PostgreSQL non-destructively.
 */
async function ensureSchemaExtensions(client: pg.PoolClient | pg.Pool): Promise<void> {
  try {
    await client.query(`
      ALTER TABLE public."homepage"
        ADD COLUMN IF NOT EXISTS "reviewsBadge" TEXT,
        ADD COLUMN IF NOT EXISTS "reviewsHeading" TEXT,
        ADD COLUMN IF NOT EXISTS "reviewsSubtitle" TEXT,
        ADD COLUMN IF NOT EXISTS "reviews" JSONB;
    `);

    await client.query(`
      ALTER TABLE public."site_settings"
        ADD COLUMN IF NOT EXISTS "socialAppleMusic" TEXT,
        ADD COLUMN IF NOT EXISTS "socialFacebook" TEXT,
        ADD COLUMN IF NOT EXISTS "socialSoundcloud" TEXT,
        ADD COLUMN IF NOT EXISTS "footerBio" TEXT,
        ADD COLUMN IF NOT EXISTS "footerQuickLinksHeading" TEXT,
        ADD COLUMN IF NOT EXISTS "footerQuickLinks" JSONB,
        ADD COLUMN IF NOT EXISTS "footerServicesHeading" TEXT,
        ADD COLUMN IF NOT EXISTS "footerServicesLinks" JSONB,
        ADD COLUMN IF NOT EXISTS "footerContactHeading" TEXT,
        ADD COLUMN IF NOT EXISTS "footerStatusText" TEXT,
        ADD COLUMN IF NOT EXISTS "footerStatusEnabled" BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS "footerBackToTopEnabled" BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS "footerAdminLinkEnabled" BOOLEAN DEFAULT TRUE;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public."pre_wedding" (
        "id" TEXT PRIMARY KEY DEFAULT 'pre-wedding-singleton',
        "studioInfo" JSONB,
        "heroStats" JSONB,
        "directorInfo" JSONB,
        "processSteps" JSONB,
        "videos" JSONB,
        "portfolioGallery" JSONB,
        "coverageTypes" JSONB,
        "coupleStories" JSONB,
        "packages" JSONB,
        "weddingPackages" JSONB,
        "customServices" JSONB,
        "addOns" JSONB,
        "whyUsPillars" JSONB,
        "weddingDayStories" JSONB,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  } catch (err: any) {
    console.warn('[PostgreSQL Schema Extension Warning]:', err.message);
  }
}

function reloadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
}

export function isPostgresConnected(): boolean {
  return isConnected;
}

const DEFAULT_SUPABASE_DATABASE_URL =
  'postgresql://postgres.fxfmictwosbwjeoumyny:Chinmay0009!@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

export function getPostgresPool(): pg.Pool | null {
  reloadEnv();
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('postgres') || dbUrl.includes('dev.db')) {
    dbUrl = DEFAULT_SUPABASE_DATABASE_URL;
  }

  if (dbUrl.includes('YOUR_PASSWORD')) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 8000,
    });

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Error]:', err.message);
      isConnected = false;
      pool = null;
    });
  }

  return pool;
}

function parseJsonSafely<T>(raw: any, fallback: T): T {
  if (raw === undefined || raw === null) return fallback;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function formatDateToIso(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  try {
    return new Date(val).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Generic upsert helper that dynamically discovers and matches columns in the live PostgreSQL table.
 */
async function upsertRow(
  tableName: string,
  dataObj: Record<string, any>,
  conflictCol: string = 'id'
): Promise<boolean> {
  const client = getPostgresPool();
  if (!client || !isConnected) return false;

  const tableCols = tableColumnsMap.get(tableName);
  if (!tableCols || tableCols.size === 0) return false;

  const fields: string[] = [];
  const values: any[] = [];
  const placeholders: string[] = [];

  for (const [key, val] of Object.entries(dataObj)) {
    const matchingCol = Array.from(tableCols).find(
      (c) => c === key || c.toLowerCase() === key.toLowerCase()
    );
    if (matchingCol) {
      fields.push(`"${matchingCol}"`);
      values.push(val);
      placeholders.push(`$${values.length}`);
    }
  }

  if (fields.length === 0) return false;

  const updateClause = fields
    .filter((f) => f !== `"${conflictCol}"`)
    .map((f) => `${f} = EXCLUDED.${f}`)
    .join(', ');

  const query = `
    INSERT INTO public."${tableName}" (${fields.join(', ')})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT ("${conflictCol}") DO UPDATE SET ${updateClause};
  `;

  await client.query(query, values);
  return true;
}

/**
 * Generic insert-if-not-exists helper for initial backfill from vexo_db.json
 */
async function insertIfNotExists(
  tableName: string,
  dataObj: Record<string, any>,
  conflictCol: string = 'id'
): Promise<boolean> {
  const client = getPostgresPool();
  if (!client || !isConnected) return false;

  const tableCols = tableColumnsMap.get(tableName);
  if (!tableCols || tableCols.size === 0) return false;

  const fields: string[] = [];
  const values: any[] = [];
  const placeholders: string[] = [];

  for (const [key, val] of Object.entries(dataObj)) {
    const matchingCol = Array.from(tableCols).find(
      (c) => c === key || c.toLowerCase() === key.toLowerCase()
    );
    if (matchingCol) {
      fields.push(`"${matchingCol}"`);
      values.push(val);
      placeholders.push(`$${values.length}`);
    }
  }

  if (fields.length === 0) return false;

  const query = `
    INSERT INTO public."${tableName}" (${fields.join(', ')})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT ("${conflictCol}") DO NOTHING;
  `;

  const res = await client.query(query, values);
  return (res.rowCount || 0) > 0;
}

/**
 * Delete a row by id
 */
async function deleteRow(tableName: string, id: string, idCol: string = 'id'): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;
  await client.query(`DELETE FROM public."${tableName}" WHERE "${idCol}" = $1`, [id]);
}

// ==========================================
// 1. HOMEPAGE SYNC & LOAD
// ==========================================
export async function syncHomepageToPostgres(homepage: Homepage): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const dataObj: Record<string, any> = {
      id: homepage.id || 'homepage-singleton',
      heroTagline: homepage.heroTagline ?? null,
      heroHeadline: homepage.heroHeadline ?? null,
      heroSubtitle: homepage.heroSubtitle ?? null,
      heroBgImage: homepage.heroBgImage ?? null,
      heroBgMedia: homepage.heroBgMedia ?? null,
      featuredVideoId: homepage.featuredVideoId ?? null,
      heroCtaText: homepage.heroCtaText ?? null,
      heroCtaUrl: homepage.heroCtaUrl ?? null,
      heroSecondaryCtaText: homepage.heroSecondaryCtaText ?? null,
      heroSecondaryCtaUrl: homepage.heroSecondaryCtaUrl ?? null,
      releasesHeading: homepage.releasesHeading ?? null,
      releasesSubtitle: homepage.releasesSubtitle ?? null,
      selectedAlbumIds: Array.isArray(homepage.selectedAlbumIds)
        ? JSON.stringify(homepage.selectedAlbumIds)
        : homepage.selectedAlbumIds ?? null,
      releasesLimit: typeof homepage.releasesLimit === 'number' ? homepage.releasesLimit : 4,
      artistsHeading: homepage.artistsHeading ?? null,
      artistsSubtitle: homepage.artistsSubtitle ?? null,
      featuredArtistIds: Array.isArray(homepage.featuredArtistIds)
        ? JSON.stringify(homepage.featuredArtistIds)
        : homepage.featuredArtistIds ?? null,
      eventsHeading: homepage.eventsHeading ?? null,
      eventsSubtitle: homepage.eventsSubtitle ?? null,
      featuredEventIds: Array.isArray(homepage.featuredEventIds)
        ? JSON.stringify(homepage.featuredEventIds)
        : homepage.featuredEventIds ?? null,
      videosHeading: homepage.videosHeading ?? null,
      videosSubtitle: homepage.videosSubtitle ?? null,
      featuredVideoIds: Array.isArray(homepage.featuredVideoIds)
        ? JSON.stringify(homepage.featuredVideoIds)
        : homepage.featuredVideoIds ?? null,
      statsArtistsCount: homepage.statsArtistsCount ? String(homepage.statsArtistsCount) : '10+',
      statsReleasesCount: homepage.statsReleasesCount ? String(homepage.statsReleasesCount) : '50+',
      statsProjectsCount: homepage.statsProjectsCount ? String(homepage.statsProjectsCount) : '100+',
      statsTotalStreams: homepage.statsTotalStreams ?? null,
      statsGlobalReach: homepage.statsGlobalReach ?? null,
      aboutBadge: homepage.aboutBadge ?? 'ABOUT VEXO',
      aboutHeading: homepage.aboutHeading ?? 'VEXO MUSIC ENTERTAINMENT PVT. LTD.',
      aboutDescription: homepage.aboutDescription ?? null,
      aboutImage: homepage.aboutImage ?? null,
      finalCtaBadge: homepage.finalCtaBadge ?? 'READY TO COLLABORATE?',
      finalCtaHeading: homepage.finalCtaHeading ?? "LET'S CREATE SOMETHING ICONIC.",
      finalCtaDescription: homepage.finalCtaDescription ?? null,
      finalCtaButtonLabel: homepage.finalCtaButtonLabel ?? 'START A PROJECT',
      finalCtaButtonUrl: homepage.finalCtaButtonUrl ?? '/contact',
      finalCtaSecondaryLabel: homepage.finalCtaSecondaryLabel ?? 'CONTACT VEXO',
      finalCtaSecondaryUrl: homepage.finalCtaSecondaryUrl ?? '/contact',
      marqueeText: homepage.marqueeText ?? null,
      reviewsBadge: homepage.reviewsBadge ?? 'TESTIMONIALS & TRUST',
      reviewsHeading: homepage.reviewsHeading ?? 'VOICES OF EXCELLENCE',
      reviewsSubtitle: homepage.reviewsSubtitle ?? 'What artists, visionary couples, and industry partners say about producing with VEXO.',
      reviews: homepage.reviews ? JSON.stringify(homepage.reviews) : null,
      updatedAt: new Date(),
    };

    await upsertRow('homepage', dataObj, 'id');
  } catch (err: any) {
    console.warn('[PostgreSQL Homepage Sync Error]:', err.message);
  }
}

export async function loadHomepageFromPostgres(): Promise<Homepage | null> {
  const client = getPostgresPool();
  if (!client || !isConnected) return null;

  try {
    const res = await client.query('SELECT * FROM public.homepage LIMIT 1;');
    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    return {
      id: r.id || 'homepage-singleton',
      heroTagline: r.heroTagline ?? null,
      heroHeadline: r.heroHeadline ?? null,
      heroSubtitle: r.heroSubtitle ?? null,
      heroBgImage: r.heroBgImage ?? null,
      heroBgMedia: r.heroBgMedia ?? null,
      featuredVideoId: r.featuredVideoId ?? null,
      heroCtaText: r.heroCtaText ?? null,
      heroCtaUrl: r.heroCtaUrl ?? null,
      heroSecondaryCtaText: r.heroSecondaryCtaText ?? null,
      heroSecondaryCtaUrl: r.heroSecondaryCtaUrl ?? null,
      releasesHeading: r.releasesHeading ?? null,
      releasesSubtitle: r.releasesSubtitle ?? null,
      selectedAlbumIds: parseJsonSafely(r.selectedAlbumIds, []),
      releasesLimit: typeof r.releasesLimit === 'number' ? r.releasesLimit : 4,
      artistsHeading: r.artistsHeading ?? null,
      artistsSubtitle: r.artistsSubtitle ?? null,
      featuredArtistIds: parseJsonSafely(r.featuredArtistIds, []),
      eventsHeading: r.eventsHeading ?? null,
      eventsSubtitle: r.eventsSubtitle ?? null,
      featuredEventIds: parseJsonSafely(r.featuredEventIds, []),
      videosHeading: r.videosHeading ?? null,
      videosSubtitle: r.videosSubtitle ?? null,
      featuredVideoIds: parseJsonSafely(r.featuredVideoIds, []),
      statsArtistsCount: r.statsArtistsCount ?? '10+',
      statsReleasesCount: r.statsReleasesCount ?? '50+',
      statsProjectsCount: r.statsProjectsCount ?? '100+',
      statsTotalStreams: r.statsTotalStreams ?? null,
      statsGlobalReach: r.statsGlobalReach ?? null,
      aboutBadge: r.aboutBadge ?? 'ABOUT VEXO',
      aboutHeading: r.aboutHeading ?? 'VEXO MUSIC ENTERTAINMENT PVT. LTD.',
      aboutDescription: r.aboutDescription ?? null,
      aboutImage: r.aboutImage ?? null,
      finalCtaBadge: r.finalCtaBadge ?? 'READY TO COLLABORATE?',
      finalCtaHeading: r.finalCtaHeading ?? "LET'S CREATE SOMETHING ICONIC.",
      finalCtaDescription: r.finalCtaDescription ?? null,
      finalCtaButtonLabel: r.finalCtaButtonLabel ?? 'START A PROJECT',
      finalCtaButtonUrl: r.finalCtaButtonUrl ?? '/contact',
      finalCtaSecondaryLabel: r.finalCtaSecondaryLabel ?? 'CONTACT VEXO',
      finalCtaSecondaryUrl: r.finalCtaSecondaryUrl ?? '/contact',
      marqueeText: r.marqueeText ?? null,
      reviewsBadge: r.reviewsBadge ?? 'TESTIMONIALS & TRUST',
      reviewsHeading: r.reviewsHeading ?? 'VOICES OF EXCELLENCE',
      reviewsSubtitle: r.reviewsSubtitle ?? 'What artists, visionary couples, and industry partners say about producing with VEXO.',
      reviews: parseJsonSafely(r.reviews, []),
      updatedAt: formatDateToIso(r.updatedAt),
    };
  } catch (err: any) {
    console.warn('[PostgreSQL Load Homepage Error]:', err.message);
    return null;
  }
}

// ==========================================
// 2. SITE SETTINGS SYNC & LOAD
// ==========================================
export async function syncSiteSettingsToPostgres(settings: SiteSettings): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const dataObj: Record<string, any> = {
      id: settings.id || 'site-settings-singleton',
      siteName: settings.siteName || 'VEXO Music Entertainment Pvt. Ltd.',
      siteDescription: settings.siteDescription ?? null,
      logoUrl: settings.logoUrl ?? null,
      faviconUrl: settings.faviconUrl ?? null,
      contactEmail: settings.contactEmail ?? null,
      contactPhone: settings.contactPhone ?? null,
      officeAddress: settings.officeAddress ?? null,
      copyrightText: settings.copyrightText ?? null,
      socialSpotify: settings.socialSpotify ?? null,
      socialYoutube: settings.socialYoutube ?? null,
      socialInstagram: settings.socialInstagram ?? null,
      socialTwitter: settings.socialTwitter ?? null,
      socialAppleMusic: settings.socialAppleMusic ?? null,
      socialFacebook: settings.socialFacebook ?? null,
      socialSoundcloud: settings.socialSoundcloud ?? null,
      footerBio: settings.footerBio ?? null,
      footerQuickLinksHeading: settings.footerQuickLinksHeading ?? 'QUICK LINKS',
      footerQuickLinks: settings.footerQuickLinks ? JSON.stringify(settings.footerQuickLinks) : null,
      footerServicesHeading: settings.footerServicesHeading ?? 'SERVICES',
      footerServicesLinks: settings.footerServicesLinks ? JSON.stringify(settings.footerServicesLinks) : null,
      footerContactHeading: settings.footerContactHeading ?? 'CONTACT US',
      footerStatusText: settings.footerStatusText ?? 'STUDIO ACTIVE • JAIPUR',
      footerStatusEnabled: settings.footerStatusEnabled !== undefined ? Boolean(settings.footerStatusEnabled) : true,
      footerBackToTopEnabled: settings.footerBackToTopEnabled !== undefined ? Boolean(settings.footerBackToTopEnabled) : true,
      footerAdminLinkEnabled: settings.footerAdminLinkEnabled !== undefined ? Boolean(settings.footerAdminLinkEnabled) : true,
      maintenanceMode: Boolean(settings.maintenanceMode),
      updatedAt: new Date(),
    };

    await upsertRow('site_settings', dataObj, 'id');
  } catch (err: any) {
    console.warn('[PostgreSQL SiteSettings Sync Error]:', err.message);
  }
}

export async function loadSiteSettingsFromPostgres(): Promise<SiteSettings | null> {
  const client = getPostgresPool();
  if (!client || !isConnected) return null;

  try {
    const res = await client.query('SELECT * FROM public.site_settings LIMIT 1;');
    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    return {
      id: r.id || 'site-settings-singleton',
      siteName: r.siteName || 'VEXO Music Entertainment Pvt. Ltd.',
      siteDescription: r.siteDescription ?? null,
      logoUrl: r.logoUrl ?? null,
      faviconUrl: r.faviconUrl ?? null,
      contactEmail: r.contactEmail ?? null,
      contactPhone: r.contactPhone ?? null,
      officeAddress: r.officeAddress ?? null,
      copyrightText: r.copyrightText ?? null,
      socialSpotify: r.socialSpotify ?? null,
      socialYoutube: r.socialYoutube ?? null,
      socialInstagram: r.socialInstagram ?? null,
      socialTwitter: r.socialTwitter ?? null,
      socialAppleMusic: r.socialAppleMusic ?? null,
      socialFacebook: r.socialFacebook ?? null,
      socialSoundcloud: r.socialSoundcloud ?? null,
      footerBio: r.footerBio ?? null,
      footerQuickLinksHeading: r.footerQuickLinksHeading ?? 'QUICK LINKS',
      footerQuickLinks: parseJsonSafely(r.footerQuickLinks, []),
      footerServicesHeading: r.footerServicesHeading ?? 'SERVICES',
      footerServicesLinks: parseJsonSafely(r.footerServicesLinks, []),
      footerContactHeading: r.footerContactHeading ?? 'CONTACT US',
      footerStatusText: r.footerStatusText ?? 'STUDIO ACTIVE • JAIPUR',
      footerStatusEnabled: r.footerStatusEnabled !== undefined && r.footerStatusEnabled !== null ? Boolean(r.footerStatusEnabled) : true,
      footerBackToTopEnabled: r.footerBackToTopEnabled !== undefined && r.footerBackToTopEnabled !== null ? Boolean(r.footerBackToTopEnabled) : true,
      footerAdminLinkEnabled: r.footerAdminLinkEnabled !== undefined && r.footerAdminLinkEnabled !== null ? Boolean(r.footerAdminLinkEnabled) : true,
      maintenanceMode: Boolean(r.maintenanceMode),
      updatedAt: formatDateToIso(r.updatedAt),
    };
  } catch (err: any) {
    console.warn('[PostgreSQL Load SiteSettings Error]:', err.message);
    return null;
  }
}

// ==========================================
// 3. SERVICES SYNC & LOAD
// ==========================================
export async function syncServiceToPostgres(service: Service): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = service.createdAt ? new Date(service.createdAt) : now;
    const updatedAt = service.updatedAt ? new Date(service.updatedAt) : now;

    const dataObj: Record<string, any> = {
      id: service.id,
      number: service.number || '01',
      title: service.title,
      slug: service.slug || service.id,
      category: service.category || 'Production',
      shortDesc: service.shortDesc || service.fullDesc || '',
      fullDesc: service.fullDesc || service.shortDesc || '',
      description: service.shortDesc || service.fullDesc || '',
      imageUrl: service.imageUrl || '',
      icon: service.icon || 'Music',
      features: Array.isArray(service.features) ? JSON.stringify(service.features) : (service.features || '[]'),
      plans: (service as any).plans ? JSON.stringify((service as any).plans) : '[]',
      specs: (service as any).specs ? JSON.stringify((service as any).specs) : '[]',
      specifications: (service as any).specs ? JSON.stringify((service as any).specs) : (service.specifications ? JSON.stringify(service.specifications) : '[]'),
      deliverables: (service as any).deliverables ? JSON.stringify((service as any).deliverables) : '[]',
      equipmentList: (service as any).equipmentList ? JSON.stringify((service as any).equipmentList) : (service.equipmentList ? JSON.stringify(service.equipmentList) : '[]'),
      faqs: (service as any).faqs ? JSON.stringify((service as any).faqs) : '[]',
      ctaText: service.ctaText || 'INITIATE PROJECT',
      pricingRange: service.pricingRange || null,
      order: typeof service.order === 'number' ? service.order : 0,
      isActive: service.isActive !== false,
      createdAt,
      updatedAt,
    };

    await upsertRow('services', dataObj, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Service Sync Error for "${service.title}"]:`, err.message);
  }
}

export async function deleteServiceFromPostgres(serviceId: string): Promise<void> {
  try {
    await deleteRow('services', serviceId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Service Delete Error for "${serviceId}"]:`, err.message);
  }
}

export async function loadServicesFromPostgres(): Promise<Service[]> {
  const client = getPostgresPool();
  if (!client || !isConnected) return [];

  try {
    const res = await client.query('SELECT * FROM public.services ORDER BY "order" ASC, "createdAt" ASC;');
    return res.rows.map((r: any, idx: number) => ({
      id: r.id,
      number: r.number || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`),
      title: r.title,
      slug: r.slug || r.id,
      category: r.category || 'Production',
      shortDesc: r.shortDesc || r.description || '',
      fullDesc: r.fullDesc || r.shortDesc || r.description || '',
      imageUrl: r.imageUrl || '',
      icon: r.icon || 'Music',
      features: parseJsonSafely(r.features, []),
      ctaText: r.ctaText || 'INITIATE PROJECT',
      pricingRange: r.pricingRange || null,
      plans: parseJsonSafely(r.plans, []),
      specs: parseJsonSafely(r.specs || r.specifications, []),
      specifications: parseJsonSafely(r.specifications || r.specs, []),
      processSteps: parseJsonSafely(r.processSteps, []),
      deliverables: parseJsonSafely(r.deliverables || r.equipmentList, []),
      equipmentList: parseJsonSafely(r.equipmentList || r.deliverables, []),
      faqs: parseJsonSafely(r.faqs, []),
      order: typeof r.order === 'number' ? r.order : idx + 1,
      isActive: r.isActive !== false,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));
  } catch (err: any) {
    console.warn('[PostgreSQL Load Services Error]:', err.message);
    return [];
  }
}

// ==========================================
// 4. CONTACT REQUESTS SYNC & LOAD
// ==========================================
export async function syncContactRequestToPostgres(contact: ContactRequest): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = contact.createdAt ? new Date(contact.createdAt) : now;
    const updatedAt = contact.updatedAt ? new Date(contact.updatedAt) : now;

    const dataObj: Record<string, any> = {
      id: contact.id,
      referenceId: contact.referenceId || `VXO-${Date.now().toString(36).toUpperCase()}`,
      name: contact.name,
      email: contact.email,
      phone: contact.phone || null,
      company: contact.company || null,
      service: contact.service,
      message: contact.message,
      status: contact.status || 'NEW',
      notes: contact.notes || null,
      createdAt,
      updatedAt,
    };

    await upsertRow('contact_requests', dataObj, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Contact Sync Error for "${contact.name}"]:`, err.message);
  }
}

export async function deleteContactRequestFromPostgres(contactId: string): Promise<void> {
  try {
    await deleteRow('contact_requests', contactId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Contact Delete Error for "${contactId}"]:`, err.message);
  }
}

export async function loadContactRequestsFromPostgres(): Promise<ContactRequest[]> {
  const client = getPostgresPool();
  if (!client || !isConnected) return [];

  try {
    const res = await client.query('SELECT * FROM public.contact_requests ORDER BY "createdAt" DESC;');
    return res.rows.map((r: any) => ({
      id: r.id,
      referenceId: r.referenceId,
      name: r.name,
      email: r.email,
      phone: r.phone || null,
      company: r.company || null,
      service: r.service,
      message: r.message,
      status: r.status || 'NEW',
      notes: r.notes || null,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));
  } catch (err: any) {
    console.warn('[PostgreSQL Load Contact Requests Error]:', err.message);
    return [];
  }
}

// ==========================================
// 5. ARTISTS & SOCIALS SYNC & LOAD
// ==========================================
export async function syncArtistToPostgres(artist: Artist, socials?: ArtistSocial[]): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = artist.createdAt ? new Date(artist.createdAt) : now;
    const updatedAt = artist.updatedAt ? new Date(artist.updatedAt) : now;
    const defaultAvatar = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
    const avatarUrl = (artist.avatarUrl && artist.avatarUrl.trim()) ? artist.avatarUrl.trim() : defaultAvatar;
    const slug = (artist.slug && artist.slug.trim())
      ? artist.slug.trim()
      : artist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || artist.id;
    const genres = Array.isArray(artist.genres)
      ? JSON.stringify(artist.genres)
      : (typeof artist.genres === 'string' && artist.genres ? artist.genres : '["Pop"]');

    const dataObj: Record<string, any> = {
      id: artist.id,
      name: artist.name,
      slug,
      role: artist.role || 'Recording Artist',
      avatarUrl,
      coverUrl: artist.coverUrl || null,
      bio: artist.bio || null,
      monthlyListeners: typeof artist.monthlyListeners === 'number' ? artist.monthlyListeners : 0,
      genres,
      featured: Boolean(artist.featured),
      isComingSoon: Boolean(artist.isComingSoon),
      order: typeof artist.order === 'number' ? artist.order : 0,
      createdAt,
      updatedAt,
    };

    await upsertRow('artists', dataObj, 'id');

    if (socials && socials.length > 0) {
      await client.query('DELETE FROM public.artist_socials WHERE "artistId" = $1', [artist.id]);
      for (const s of socials) {
        const socObj: Record<string, any> = {
          id: s.id || `soc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          artistId: artist.id,
          platform: s.platform,
          url: s.url,
          order: typeof s.order === 'number' ? s.order : 0,
          createdAt,
          updatedAt,
        };
        await upsertRow('artist_socials', socObj, 'id');
      }
    }
  } catch (err: any) {
    console.warn(`[PostgreSQL Artist Sync Error for "${artist.name}"]:`, err.message);
  }
}

export async function deleteArtistFromPostgres(artistId: string): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    await client.query('DELETE FROM public.artist_socials WHERE "artistId" = $1', [artistId]);
    await deleteRow('artists', artistId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Artist Delete Error for "${artistId}"]:`, err.message);
  }
}

export async function loadArtistsFromPostgres(): Promise<{ artists: Artist[]; socials: ArtistSocial[] }> {
  const client = getPostgresPool();
  if (!client || !isConnected) return { artists: [], socials: [] };

  try {
    const aRes = await client.query('SELECT * FROM public.artists ORDER BY "order" ASC, "createdAt" ASC;');
    const sRes = await client.query('SELECT * FROM public.artist_socials ORDER BY "order" ASC, "createdAt" ASC;');

    const socials: ArtistSocial[] = sRes.rows.map((r: any) => ({
      id: r.id,
      artistId: r.artistId,
      platform: r.platform,
      url: r.url,
      order: typeof r.order === 'number' ? r.order : 0,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));

    const artists: Artist[] = aRes.rows.map((r: any, idx: number) => ({
      id: r.id,
      name: r.name,
      slug: r.slug || r.id,
      role: r.role || 'Recording Artist',
      avatarUrl: r.avatarUrl,
      coverUrl: r.coverUrl || null,
      bio: r.bio || null,
      monthlyListeners: typeof r.monthlyListeners === 'number' ? r.monthlyListeners : 0,
      genres: parseJsonSafely(r.genres, ['Pop']),
      featured: Boolean(r.featured),
      isComingSoon: Boolean(r.isComingSoon),
      order: typeof r.order === 'number' ? r.order : idx + 1,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
      socials: socials.filter((s) => s.artistId === r.id),
    }));

    return { artists, socials };
  } catch (err: any) {
    console.warn('[PostgreSQL Load Artists Error]:', err.message);
    return { artists: [], socials: [] };
  }
}

// ==========================================
// 6. ALBUMS SYNC & LOAD
// ==========================================
export async function syncAlbumToPostgres(album: Album): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = album.createdAt ? new Date(album.createdAt) : now;
    const updatedAt = album.updatedAt ? new Date(album.updatedAt) : now;

    let validArtistId = album.artistId || null;
    if (validArtistId) {
      const artCheck = await client.query('SELECT id FROM public.artists WHERE id = $1', [validArtistId]);
      if (artCheck.rows.length === 0) {
        validArtistId = null;
      }
    }

    const dataObj: Record<string, any> = {
      id: album.id,
      title: album.title,
      slug: album.slug || album.id,
      artistName: album.artistName,
      artistId: validArtistId,
      coverUrl: album.coverUrl,
      releaseDate: album.releaseDate || now.toISOString().split('T')[0],
      year: typeof album.year === 'number' ? album.year : now.getFullYear(),
      genre: album.genre || 'Electronic',
      trackCount: typeof album.trackCount === 'number' ? album.trackCount : 0,
      spotifyUrl: album.spotifyUrl || null,
      youtubeUrl: album.youtubeUrl || null,
      appleMusicUrl: album.appleMusicUrl || null,
      featured: Boolean(album.featured),
      order: typeof album.order === 'number' ? album.order : 0,
      createdAt,
      updatedAt,
    };

    await upsertRow('albums', dataObj, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Album Sync Error for "${album.title}"]:`, err.message);
  }
}

export async function deleteAlbumFromPostgres(albumId: string): Promise<void> {
  try {
    await deleteRow('albums', albumId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Album Delete Error for "${albumId}"]:`, err.message);
  }
}

export async function loadAlbumsFromPostgres(): Promise<Album[]> {
  const client = getPostgresPool();
  if (!client || !isConnected) return [];

  try {
    const res = await client.query('SELECT * FROM public.albums ORDER BY "order" ASC, "createdAt" ASC;');
    return res.rows.map((r: any, idx: number) => ({
      id: r.id,
      title: r.title,
      slug: r.slug || r.id,
      artistName: r.artistName,
      artistId: r.artistId || null,
      coverUrl: r.coverUrl,
      releaseDate: r.releaseDate || new Date().toISOString().split('T')[0],
      year: typeof r.year === 'number' ? r.year : new Date().getFullYear(),
      genre: r.genre || 'Electronic',
      trackCount: typeof r.trackCount === 'number' ? r.trackCount : 0,
      spotifyUrl: r.spotifyUrl || null,
      youtubeUrl: r.youtubeUrl || null,
      appleMusicUrl: r.appleMusicUrl || null,
      featured: Boolean(r.featured),
      order: typeof r.order === 'number' ? r.order : idx + 1,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));
  } catch (err: any) {
    console.warn('[PostgreSQL Load Albums Error]:', err.message);
    return [];
  }
}

// ==========================================
// 7. TRACKS SYNC & LOAD
// ==========================================
export async function syncTrackToPostgres(track: Track): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = track.createdAt ? new Date(track.createdAt) : now;
    const updatedAt = track.updatedAt ? new Date(track.updatedAt) : now;

    let validArtistId = track.artistId || null;
    if (validArtistId) {
      const artCheck = await client.query('SELECT id FROM public.artists WHERE id = $1', [validArtistId]);
      if (artCheck.rows.length === 0) validArtistId = null;
    }

    let validAlbumId = track.albumId || null;
    if (validAlbumId) {
      const albCheck = await client.query('SELECT id FROM public.albums WHERE id = $1', [validAlbumId]);
      if (albCheck.rows.length === 0) validAlbumId = null;
    }

    const dataObj: Record<string, any> = {
      id: track.id,
      title: track.title,
      artistName: track.artistName,
      artistId: validArtistId,
      albumId: validAlbumId,
      duration: typeof track.duration === 'number' ? track.duration : 180,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl || null,
      spotifyUrl: track.spotifyUrl || null,
      youtubeUrl: track.youtubeUrl || null,
      genre: track.genre || 'Electronic',
      plays: typeof track.plays === 'number' ? track.plays : 0,
      isPopular: Boolean(track.isPopular),
      order: typeof track.order === 'number' ? track.order : 0,
      createdAt,
      updatedAt,
    };

    await upsertRow('tracks', dataObj, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Track Sync Error for "${track.title}"]:`, err.message);
  }
}

export async function deleteTrackFromPostgres(trackId: string): Promise<void> {
  try {
    await deleteRow('tracks', trackId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Track Delete Error for "${trackId}"]:`, err.message);
  }
}

export async function loadTracksFromPostgres(): Promise<Track[]> {
  const client = getPostgresPool();
  if (!client || !isConnected) return [];

  try {
    const res = await client.query('SELECT * FROM public.tracks ORDER BY "order" ASC, "createdAt" ASC;');
    return res.rows.map((r: any, idx: number) => ({
      id: r.id,
      title: r.title,
      artistName: r.artistName,
      artistId: r.artistId || null,
      albumId: r.albumId || null,
      duration: typeof r.duration === 'number' ? r.duration : 180,
      coverUrl: r.coverUrl,
      audioUrl: r.audioUrl || null,
      spotifyUrl: r.spotifyUrl || null,
      youtubeUrl: r.youtubeUrl || null,
      genre: r.genre || 'Electronic',
      plays: typeof r.plays === 'number' ? r.plays : 0,
      isPopular: Boolean(r.isPopular),
      order: typeof r.order === 'number' ? r.order : idx + 1,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));
  } catch (err: any) {
    console.warn('[PostgreSQL Load Tracks Error]:', err.message);
    return [];
  }
}

// ==========================================
// 8. VIDEOS SYNC & LOAD
// ==========================================
export async function syncVideoToPostgres(video: Video): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = video.createdAt ? new Date(video.createdAt) : now;
    const updatedAt = video.updatedAt ? new Date(video.updatedAt) : now;

    const dataObj: Record<string, any> = {
      id: video.id,
      title: video.title,
      artist: video.artist,
      youtubeId: video.youtubeId,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration || '3:30',
      views: typeof video.views === 'number' ? video.views : 0,
      publishedAt: video.publishedAt || now.toISOString().split('T')[0],
      category: video.category || 'Official Music Videos',
      featured: Boolean(video.featured),
      description: video.description || null,
      tags: Array.isArray(video.tags) ? JSON.stringify(video.tags) : (video.tags || '[]'),
      order: typeof video.order === 'number' ? video.order : 0,
      createdAt,
      updatedAt,
    };

    await upsertRow('videos', dataObj, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Video Sync Error for "${video.title}"]:`, err.message);
  }
}

export async function deleteVideoFromPostgres(videoId: string): Promise<void> {
  try {
    await deleteRow('videos', videoId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Video Delete Error for "${videoId}"]:`, err.message);
  }
}

export async function loadVideosFromPostgres(): Promise<Video[]> {
  const client = getPostgresPool();
  if (!client || !isConnected) return [];

  try {
    const res = await client.query('SELECT * FROM public.videos ORDER BY "order" ASC, "createdAt" ASC;');
    return res.rows.map((r: any, idx: number) => ({
      id: r.id,
      title: r.title,
      artist: r.artist,
      youtubeId: r.youtubeId,
      thumbnailUrl: r.thumbnailUrl,
      duration: r.duration || '3:30',
      views: typeof r.views === 'number' ? r.views : 0,
      publishedAt: r.publishedAt || new Date().toISOString().split('T')[0],
      category: r.category || 'Official Music Videos',
      featured: Boolean(r.featured),
      description: r.description || null,
      tags: parseJsonSafely(r.tags, []),
      order: typeof r.order === 'number' ? r.order : idx + 1,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));
  } catch (err: any) {
    console.warn('[PostgreSQL Load Videos Error]:', err.message);
    return [];
  }
}

// ==========================================
// 9. EVENTS & EVENT ARTISTS SYNC & LOAD
// ==========================================
export async function syncEventToPostgres(event: Event, eventArtists?: EventArtist[]): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = event.createdAt ? new Date(event.createdAt) : now;
    const updatedAt = event.updatedAt ? new Date(event.updatedAt) : now;

    const dataObj: Record<string, any> = {
      id: event.id,
      title: event.title,
      slug: event.slug || event.id,
      mainArtist: event.mainArtist,
      date: event.date,
      time: event.time,
      venue: event.venue,
      location: event.location,
      city: event.city || null,
      country: event.country || null,
      ticketUrl: event.ticketUrl || null,
      price: event.price,
      status: event.status || 'upcoming',
      imageUrl: event.imageUrl,
      description: event.description || null,
      featured: Boolean(event.featured),
      order: typeof event.order === 'number' ? event.order : 0,
      createdAt,
      updatedAt,
    };

    await upsertRow('events', dataObj, 'id');

    if (eventArtists && eventArtists.length > 0) {
      await client.query('DELETE FROM public.event_artists WHERE "eventId" = $1', [event.id]);
      for (const ea of eventArtists) {
        const artCheck = await client.query('SELECT id FROM public.artists WHERE id = $1', [ea.artistId]);
        if (artCheck.rows.length > 0) {
          const eaObj: Record<string, any> = {
            id: ea.id || `ea-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
            eventId: event.id,
            artistId: ea.artistId,
            role: ea.role || 'Headliner',
            order: typeof ea.order === 'number' ? ea.order : 0,
            createdAt,
            updatedAt,
          };
          await upsertRow('event_artists', eaObj, 'id');
        }
      }
    }
  } catch (err: any) {
    console.warn(`[PostgreSQL Event Sync Error for "${event.title}"]:`, err.message);
  }
}

export async function deleteEventFromPostgres(eventId: string): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    await client.query('DELETE FROM public.event_artists WHERE "eventId" = $1', [eventId]);
    await deleteRow('events', eventId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Event Delete Error for "${eventId}"]:`, err.message);
  }
}

export async function loadEventsFromPostgres(): Promise<{ events: Event[]; eventArtists: EventArtist[] }> {
  const client = getPostgresPool();
  if (!client || !isConnected) return { events: [], eventArtists: [] };

  try {
    const eRes = await client.query('SELECT * FROM public.events ORDER BY "order" ASC, "createdAt" ASC;');
    const eaRes = await client.query('SELECT * FROM public.event_artists ORDER BY "order" ASC, "createdAt" ASC;');

    const eventArtists: EventArtist[] = eaRes.rows.map((r: any) => ({
      id: r.id,
      eventId: r.eventId,
      artistId: r.artistId,
      role: r.role || 'Headliner',
      order: typeof r.order === 'number' ? r.order : 0,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));

    const events: Event[] = eRes.rows.map((r: any, idx: number) => ({
      id: r.id,
      title: r.title,
      slug: r.slug || r.id,
      mainArtist: r.mainArtist,
      date: r.date,
      time: r.time,
      venue: r.venue,
      location: r.location,
      city: r.city || null,
      country: r.country || null,
      ticketUrl: r.ticketUrl || null,
      price: r.price,
      status: r.status || 'upcoming',
      imageUrl: r.imageUrl,
      description: r.description || null,
      featured: Boolean(r.featured),
      order: typeof r.order === 'number' ? r.order : idx + 1,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
      eventArtists: eventArtists.filter((ea) => ea.eventId === r.id),
    }));

    return { events, eventArtists };
  } catch (err: any) {
    console.warn('[PostgreSQL Load Events Error]:', err.message);
    return { events: [], eventArtists: [] };
  }
}

// ==========================================
// 10. MEDIA SYNC & LOAD
// ==========================================
export async function syncMediaToPostgres(media: Media): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = media.createdAt ? new Date(media.createdAt) : now;
    const updatedAt = media.updatedAt ? new Date(media.updatedAt) : now;

    const dataObj: Record<string, any> = {
      id: media.id,
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: typeof media.size === 'number' ? media.size : 0,
      url: media.url,
      path: media.path || null,
      altText: media.altText || null,
      category: media.category || 'image',
      uploadedBy: media.uploadedBy || null,
      createdAt,
      updatedAt,
    };

    await upsertRow('media', dataObj, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Media Sync Error for "${media.filename}"]:`, err.message);
  }
}

export async function deleteMediaFromPostgres(mediaId: string): Promise<void> {
  try {
    await deleteRow('media', mediaId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL Media Delete Error for "${mediaId}"]:`, err.message);
  }
}

export async function loadMediaFromPostgres(): Promise<Media[]> {
  const client = getPostgresPool();
  if (!client || !isConnected) return [];

  try {
    const res = await client.query('SELECT * FROM public.media ORDER BY "createdAt" DESC;');
    return res.rows.map((r: any) => ({
      id: r.id,
      filename: r.filename,
      originalName: r.originalName,
      mimeType: r.mimeType,
      size: typeof r.size === 'number' ? r.size : 0,
      url: r.url,
      path: r.path || null,
      altText: r.altText || null,
      category: r.category || 'image',
      uploadedBy: r.uploadedBy || null,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));
  } catch (err: any) {
    console.warn('[PostgreSQL Load Media Error]:', err.message);
    return [];
  }
}

// ==========================================
// 11. ADMIN USERS SYNC & LOAD
// ==========================================
export async function syncAdminUserToPostgres(user: AdminUser): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const now = new Date();
    const createdAt = user.createdAt ? new Date(user.createdAt) : now;
    const updatedAt = user.updatedAt ? new Date(user.updatedAt) : now;
    const lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt) : null;

    const dataObj: Record<string, any> = {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role || 'ADMIN',
      isActive: user.isActive !== false,
      lastLoginAt,
      createdAt,
      updatedAt,
    };

    await upsertRow('admin_users', dataObj, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL AdminUser Sync Error for "${user.email}"]:`, err.message);
  }
}

export async function deleteAdminUserFromPostgres(userId: string): Promise<void> {
  try {
    await deleteRow('admin_users', userId, 'id');
  } catch (err: any) {
    console.warn(`[PostgreSQL AdminUser Delete Error for "${userId}"]:`, err.message);
  }
}

export async function loadAdminUsersFromPostgres(): Promise<AdminUser[]> {
  const client = getPostgresPool();
  if (!client || !isConnected) return [];

  try {
    const res = await client.query('SELECT * FROM public.admin_users ORDER BY "createdAt" ASC;');
    return res.rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      passwordHash: r.passwordHash,
      name: r.name,
      role: r.role || 'ADMIN',
      isActive: r.isActive !== false,
      lastLoginAt: r.lastLoginAt ? formatDateToIso(r.lastLoginAt) : null,
      createdAt: formatDateToIso(r.createdAt),
      updatedAt: formatDateToIso(r.updatedAt),
    }));
  } catch (err: any) {
    console.warn('[PostgreSQL Load AdminUsers Error]:', err.message);
    return [];
  }
}

// ==========================================
// 12. ACTIVITY LOGS SYNC & LOAD
// ==========================================
export async function syncActivityLogToPostgres(log: ActivityLog): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    let validUserId = log.adminUserId || null;
    if (validUserId) {
      const uCheck = await client.query('SELECT id FROM public.admin_users WHERE id = $1', [validUserId]);
      if (uCheck.rows.length === 0) validUserId = null;
    }

    const dataObj: Record<string, any> = {
      id: log.id,
      adminUserId: validUserId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId || null,
      details: typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || null),
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      createdAt: log.createdAt ? new Date(log.createdAt) : new Date(),
    };

    await upsertRow('activity_logs', dataObj, 'id');
  } catch (err: any) {
    console.warn('[PostgreSQL ActivityLog Sync Error]:', err.message);
  }
}

export async function loadActivityLogsFromPostgres(limit = 100): Promise<ActivityLog[]> {
  const client = getPostgresPool();
  if (!client || !isConnected) return [];

  try {
    const res = await client.query('SELECT * FROM public.activity_logs ORDER BY "createdAt" DESC LIMIT $1;', [limit]);
    return res.rows.map((r: any) => ({
      id: r.id,
      adminUserId: r.adminUserId || null,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId || null,
      details: parseJsonSafely(r.details, r.details),
      ipAddress: r.ipAddress || null,
      userAgent: r.userAgent || null,
      createdAt: formatDateToIso(r.createdAt),
    }));
  } catch (err: any) {
    console.warn('[PostgreSQL Load ActivityLogs Error]:', err.message);
    return [];
  }
}

// ==========================================
// 13. PRE-WEDDING STUDIO SYNC & LOAD
// ==========================================
export async function syncPreWeddingToPostgres(data: PreWeddingPageData): Promise<void> {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const dataObj: Record<string, any> = {
      id: data.id || 'pre-wedding-singleton',
      studioInfo: data.studioInfo ? JSON.stringify(data.studioInfo) : null,
      heroStats: data.heroStats ? JSON.stringify(data.heroStats) : null,
      directorInfo: data.directorInfo ? JSON.stringify(data.directorInfo) : null,
      processSteps: data.processSteps ? JSON.stringify(data.processSteps) : null,
      videos: data.videos ? JSON.stringify(data.videos) : null,
      portfolioGallery: data.portfolioGallery ? JSON.stringify(data.portfolioGallery) : null,
      coverageTypes: data.coverageTypes ? JSON.stringify(data.coverageTypes) : null,
      coupleStories: data.coupleStories ? JSON.stringify(data.coupleStories) : null,
      packages: data.packages ? JSON.stringify(data.packages) : null,
      weddingPackages: data.weddingPackages ? JSON.stringify(data.weddingPackages) : null,
      customServices: data.customServices ? JSON.stringify(data.customServices) : null,
      addOns: data.addOns ? JSON.stringify(data.addOns) : null,
      whyUsPillars: data.whyUsPillars ? JSON.stringify(data.whyUsPillars) : null,
      weddingDayStories: data.weddingDayStories ? JSON.stringify(data.weddingDayStories) : null,
      updatedAt: new Date(),
    };

    await upsertRow('pre_wedding', dataObj, 'id');
  } catch (err: any) {
    console.warn('[PostgreSQL PreWedding Sync Error]:', err.message);
  }
}

export async function loadPreWeddingFromPostgres(): Promise<PreWeddingPageData | null> {
  const client = getPostgresPool();
  if (!client || !isConnected) return null;

  try {
    const res = await client.query('SELECT * FROM public.pre_wedding LIMIT 1;');
    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    return {
      id: r.id || 'pre-wedding-singleton',
      studioInfo: parseJsonSafely(r.studioInfo, {} as any),
      heroStats: parseJsonSafely(r.heroStats, []),
      directorInfo: parseJsonSafely(r.directorInfo, {} as any),
      processSteps: parseJsonSafely(r.processSteps, []),
      videos: parseJsonSafely(r.videos, []),
      portfolioGallery: parseJsonSafely(r.portfolioGallery, []),
      coverageTypes: parseJsonSafely(r.coverageTypes, []),
      coupleStories: parseJsonSafely(r.coupleStories, []),
      packages: parseJsonSafely(r.packages, []),
      weddingPackages: parseJsonSafely(r.weddingPackages, []),
      customServices: parseJsonSafely(r.customServices, []),
      addOns: parseJsonSafely(r.addOns, []),
      whyUsPillars: parseJsonSafely(r.whyUsPillars, []),
      weddingDayStories: parseJsonSafely(r.weddingDayStories, {} as any),
      updatedAt: formatDateToIso(r.updatedAt),
    };
  } catch (err: any) {
    console.warn('[PostgreSQL Load PreWedding Error]:', err.message);
    return null;
  }
}

// ==========================================
// 14. MASTER INITIALIZATION & BACKFILL
// ==========================================
export async function initPostgresSync(
  initialData: DatabaseSchema,
  onHydrate?: (data: Partial<DatabaseSchema>) => void
): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    if (!retryTimer) {
      retryTimer = setTimeout(async () => {
        retryTimer = null;
        await initPostgresSync(initialData, onHydrate);
      }, 10000);
      retryTimer.unref?.();
    }
    return false;
  }

  try {
    const res = await client.query('SELECT current_database(), current_user;');
    isConnected = true;
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    const { current_database, current_user } = res.rows[0];
    console.log(`\n======================================================`);
    console.log(`[PostgreSQL] ✅ CONNECTED TO LIVE DATABASE "${current_database}" AS USER "${current_user}"!`);
    console.log(`======================================================\n`);

    // Ensure schema extensions exist non-destructively
    await ensureSchemaExtensions(client);

    // Discover columns for all tables in public schema
    const colRes = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public';
    `);

    tableColumnsMap.clear();
    for (const row of colRes.rows) {
      const tName = row.table_name;
      if (!tableColumnsMap.has(tName)) {
        tableColumnsMap.set(tName, new Set());
      }
      tableColumnsMap.get(tName)!.add(row.column_name);
    }

    console.log(`[PostgreSQL] 🔍 Discovered schema for ${tableColumnsMap.size} tables.`);

    // Helper to query existing IDs
    const getExistingIds = async (tableName: string): Promise<Set<string>> => {
      try {
        const r = await client.query(`SELECT "id" FROM public."${tableName}";`);
        return new Set(r.rows.map((row: any) => String(row.id)));
      } catch {
        return new Set();
      }
    };

    const existingAdminIds = await getExistingIds('admin_users');
    const existingArtistIds = await getExistingIds('artists');
    const existingAlbumIds = await getExistingIds('albums');
    const existingTrackIds = await getExistingIds('tracks');
    const existingEventIds = await getExistingIds('events');
    const existingVideoIds = await getExistingIds('videos');
    const existingServiceIds = await getExistingIds('services');
    const existingMediaIds = await getExistingIds('media');
    const existingContactIds = await getExistingIds('contact_requests');
    const existingSocialIds = await getExistingIds('artist_socials');
    const existingEventArtistIds = await getExistingIds('event_artists');

    // Check row counts for singleton tables
    const hpCountRes = await client.query('SELECT COUNT(*) FROM public.homepage;');
    const hpCount = parseInt(hpCountRes.rows[0].count, 10);

    const ssCountRes = await client.query('SELECT COUNT(*) FROM public.site_settings;');
    const ssCount = parseInt(ssCountRes.rows[0].count, 10);

    const pwCountRes = await client.query('SELECT COUNT(*) FROM public.pre_wedding;');
    const pwCount = parseInt(pwCountRes.rows[0].count, 10);

    console.log(`[PostgreSQL] Current row counts — Homepage: ${hpCount}, SiteSettings: ${ssCount}, PreWedding: ${pwCount}, Services: ${existingServiceIds.size}, Artists: ${existingArtistIds.size}, Albums: ${existingAlbumIds.size}, Tracks: ${existingTrackIds.size}, Contacts: ${existingContactIds.size}`);

    // -----------------------------------------------------------------
    // INITIAL BACKFILL: Insert missing records from vexo_db.json
    // Never overwrite rows that already exist in PostgreSQL!
    // -----------------------------------------------------------------

    // 1. Homepage backfill (only if table is empty or missing reviews)
    if (hpCount === 0 && initialData.homepage) {
      console.log('[PostgreSQL] 📥 Backfilling homepage singleton from vexo_db.json...');
      await syncHomepageToPostgres(initialData.homepage);
    } else if (hpCount > 0 && initialData.homepage) {
      // Non-destructive migration of reviews if missing in PostgreSQL
      try {
        const hpCheck = await client.query('SELECT "reviews" FROM public.homepage WHERE id = \'homepage-singleton\' LIMIT 1;');
        if (hpCheck.rows.length > 0 && hpCheck.rows[0].reviews === null && initialData.homepage.reviews && initialData.homepage.reviews.length > 0) {
          console.log('[PostgreSQL] 📥 Migrating reviews into homepage from vexo_db.json...');
          await client.query(`
            UPDATE public.homepage SET
              "reviews" = $1::jsonb,
              "reviewsBadge" = COALESCE("reviewsBadge", $2),
              "reviewsHeading" = COALESCE("reviewsHeading", $3),
              "reviewsSubtitle" = COALESCE("reviewsSubtitle", $4)
            WHERE id = 'homepage-singleton';
          `, [
            JSON.stringify(initialData.homepage.reviews),
            initialData.homepage.reviewsBadge || 'TESTIMONIALS & TRUST',
            initialData.homepage.reviewsHeading || 'VOICES OF EXCELLENCE',
            initialData.homepage.reviewsSubtitle || 'What artists, visionary couples, and industry partners say about producing with VEXO.',
          ]);
        }
      } catch (err: any) {
        console.warn('[PostgreSQL Reviews Migration Warning]:', err.message);
      }
    }

    // 2. Site settings backfill (only if table is empty or missing footer settings)
    if (ssCount === 0 && initialData.siteSettings) {
      console.log('[PostgreSQL] 📥 Backfilling site_settings singleton from vexo_db.json...');
      await syncSiteSettingsToPostgres(initialData.siteSettings);
    } else if (ssCount > 0 && initialData.siteSettings) {
      // Non-destructive migration of footer settings if missing in PostgreSQL
      try {
        const ssCheck = await client.query('SELECT "footerBio", "footerQuickLinks" FROM public.site_settings WHERE id = \'site-settings-singleton\' LIMIT 1;');
        if (ssCheck.rows.length > 0 && (ssCheck.rows[0].footerBio === null || ssCheck.rows[0].footerQuickLinks === null) && initialData.siteSettings) {
          console.log('[PostgreSQL] 📥 Migrating footer configuration into site_settings from vexo_db.json...');
          await client.query(`
            UPDATE public.site_settings SET
              "footerBio" = COALESCE("footerBio", $1),
              "footerQuickLinksHeading" = COALESCE("footerQuickLinksHeading", $2),
              "footerQuickLinks" = COALESCE("footerQuickLinks", $3::jsonb),
              "footerServicesHeading" = COALESCE("footerServicesHeading", $4),
              "footerServicesLinks" = COALESCE("footerServicesLinks", $5::jsonb),
              "footerContactHeading" = COALESCE("footerContactHeading", $6),
              "footerStatusText" = COALESCE("footerStatusText", $7),
              "socialAppleMusic" = COALESCE("socialAppleMusic", $8),
              "socialFacebook" = COALESCE("socialFacebook", $9),
              "socialSoundcloud" = COALESCE("socialSoundcloud", $10)
            WHERE id = 'site-settings-singleton';
          `, [
            initialData.siteSettings.footerBio || null,
            initialData.siteSettings.footerQuickLinksHeading || 'QUICK LINKS',
            initialData.siteSettings.footerQuickLinks ? JSON.stringify(initialData.siteSettings.footerQuickLinks) : null,
            initialData.siteSettings.footerServicesHeading || 'SERVICES',
            initialData.siteSettings.footerServicesLinks ? JSON.stringify(initialData.siteSettings.footerServicesLinks) : null,
            initialData.siteSettings.footerContactHeading || 'CONTACT US',
            initialData.siteSettings.footerStatusText || 'STUDIO ACTIVE • JAIPUR',
            initialData.siteSettings.socialAppleMusic || null,
            initialData.siteSettings.socialFacebook || null,
            initialData.siteSettings.socialSoundcloud || null,
          ]);
        }
      } catch (err: any) {
        console.warn('[PostgreSQL Footer Settings Migration Warning]:', err.message);
      }
    }

    // 3. Pre-Wedding backfill (only if table is empty or missing extended sections)
    if (pwCount === 0 && initialData.preWedding) {
      console.log('[PostgreSQL] 📥 Backfilling pre_wedding singleton from vexo_db.json...');
      await syncPreWeddingToPostgres(initialData.preWedding);
    } else if (pwCount > 0 && initialData.preWedding) {
      try {
        const pwCheck = await client.query('SELECT "weddingPackages", "whyUsPillars", "weddingDayStories" FROM public.pre_wedding WHERE id = \'pre-wedding-singleton\' LIMIT 1;');
        if (pwCheck.rows.length > 0 && initialData.preWedding) {
          const row = pwCheck.rows[0];
          const needsPackages = row.weddingPackages === null && initialData.preWedding.weddingPackages;
          const needsWhyUs = row.whyUsPillars === null && initialData.preWedding.whyUsPillars;
          const needsDayStories = row.weddingDayStories === null && initialData.preWedding.weddingDayStories;

          if (needsPackages || needsWhyUs || needsDayStories) {
            console.log('[PostgreSQL] 📥 Migrating pre-wedding sections into pre_wedding table from vexo_db.json...');
            await client.query(`
              UPDATE public.pre_wedding SET
                "weddingPackages" = COALESCE("weddingPackages", $1::jsonb),
                "whyUsPillars" = COALESCE("whyUsPillars", $2::jsonb),
                "weddingDayStories" = COALESCE("weddingDayStories", $3::jsonb)
              WHERE id = 'pre-wedding-singleton';
            `, [
              initialData.preWedding.weddingPackages ? JSON.stringify(initialData.preWedding.weddingPackages) : null,
              initialData.preWedding.whyUsPillars ? JSON.stringify(initialData.preWedding.whyUsPillars) : null,
              initialData.preWedding.weddingDayStories ? JSON.stringify(initialData.preWedding.weddingDayStories) : null,
            ]);
          }
        }
      } catch (err: any) {
        console.warn('[PostgreSQL PreWedding Migration Warning]:', err.message);
      }
    }

    // 4. Admin Users backfill
    if (initialData.adminUsers && initialData.adminUsers.length > 0) {
      for (const u of initialData.adminUsers) {
        if (!existingAdminIds.has(u.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: AdminUser ID "${u.id}" (${u.email})`);
          await insertIfNotExists('admin_users', {
            id: u.id,
            email: u.email,
            passwordHash: u.passwordHash,
            name: u.name,
            role: u.role || 'ADMIN',
            isActive: u.isActive !== false,
            createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
            updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
          });
          existingAdminIds.add(u.id);
        }
      }
    }

    // 5. Artists backfill
    if (initialData.artists && initialData.artists.length > 0) {
      for (const a of initialData.artists) {
        if (!existingArtistIds.has(a.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: Artist ID "${a.id}" ("${a.name}")`);
          const defaultAvatar = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
          await insertIfNotExists('artists', {
            id: a.id,
            name: a.name,
            slug: a.slug || a.id,
            role: a.role || 'Recording Artist',
            avatarUrl: (a.avatarUrl && a.avatarUrl.trim()) ? a.avatarUrl.trim() : defaultAvatar,
            coverUrl: a.coverUrl || null,
            bio: a.bio || null,
            monthlyListeners: typeof a.monthlyListeners === 'number' ? a.monthlyListeners : 0,
            genres: Array.isArray(a.genres) ? JSON.stringify(a.genres) : '["Pop"]',
            featured: Boolean(a.featured),
            isComingSoon: Boolean(a.isComingSoon),
            order: typeof a.order === 'number' ? a.order : 0,
            createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
            updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
          });
          existingArtistIds.add(a.id);
        }
      }
    }

    // 6. Artist Socials backfill (only for artists that exist in PostgreSQL)
    if (initialData.artistSocials && initialData.artistSocials.length > 0) {
      for (const s of initialData.artistSocials) {
        if (existingArtistIds.has(s.artistId) && !existingSocialIds.has(s.id)) {
          await insertIfNotExists('artist_socials', {
            id: s.id,
            artistId: s.artistId,
            platform: s.platform,
            url: s.url,
            order: typeof s.order === 'number' ? s.order : 0,
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
          });
          existingSocialIds.add(s.id);
        }
      }
    }

    // 7. Albums backfill
    if (initialData.albums && initialData.albums.length > 0) {
      for (const alb of initialData.albums) {
        if (!existingAlbumIds.has(alb.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: Album ID "${alb.id}" ("${alb.title}")`);
          const validArtistId = alb.artistId && existingArtistIds.has(alb.artistId) ? alb.artistId : null;
          await insertIfNotExists('albums', {
            id: alb.id,
            title: alb.title,
            slug: alb.slug || alb.id,
            artistName: alb.artistName,
            artistId: validArtistId,
            coverUrl: alb.coverUrl,
            releaseDate: alb.releaseDate || new Date().toISOString().split('T')[0],
            year: typeof alb.year === 'number' ? alb.year : new Date().getFullYear(),
            genre: alb.genre || 'Electronic',
            trackCount: typeof alb.trackCount === 'number' ? alb.trackCount : 0,
            spotifyUrl: alb.spotifyUrl || null,
            youtubeUrl: alb.youtubeUrl || null,
            appleMusicUrl: alb.appleMusicUrl || null,
            featured: Boolean(alb.featured),
            order: typeof alb.order === 'number' ? alb.order : 0,
            createdAt: alb.createdAt ? new Date(alb.createdAt) : new Date(),
            updatedAt: alb.updatedAt ? new Date(alb.updatedAt) : new Date(),
          });
          existingAlbumIds.add(alb.id);
        }
      }
    }

    // 8. Tracks backfill
    if (initialData.tracks && initialData.tracks.length > 0) {
      for (const trk of initialData.tracks) {
        if (!existingTrackIds.has(trk.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: Track ID "${trk.id}" ("${trk.title}")`);
          const validArtistId = trk.artistId && existingArtistIds.has(trk.artistId) ? trk.artistId : null;
          const validAlbumId = trk.albumId && existingAlbumIds.has(trk.albumId) ? trk.albumId : null;
          await insertIfNotExists('tracks', {
            id: trk.id,
            title: trk.title,
            artistName: trk.artistName,
            artistId: validArtistId,
            albumId: validAlbumId,
            duration: typeof trk.duration === 'number' ? trk.duration : 180,
            coverUrl: trk.coverUrl,
            audioUrl: trk.audioUrl || null,
            spotifyUrl: trk.spotifyUrl || null,
            youtubeUrl: trk.youtubeUrl || null,
            genre: trk.genre || 'Electronic',
            plays: typeof trk.plays === 'number' ? trk.plays : 0,
            isPopular: Boolean(trk.isPopular),
            order: typeof trk.order === 'number' ? trk.order : 0,
            createdAt: trk.createdAt ? new Date(trk.createdAt) : new Date(),
            updatedAt: trk.updatedAt ? new Date(trk.updatedAt) : new Date(),
          });
          existingTrackIds.add(trk.id);
        }
      }
    }

    // 9. Events backfill
    if (initialData.events && initialData.events.length > 0) {
      for (const ev of initialData.events) {
        if (!existingEventIds.has(ev.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: Event ID "${ev.id}" ("${ev.title}")`);
          await insertIfNotExists('events', {
            id: ev.id,
            title: ev.title,
            slug: ev.slug || ev.id,
            mainArtist: ev.mainArtist,
            date: ev.date,
            time: ev.time,
            venue: ev.venue,
            location: ev.location,
            city: ev.city || null,
            country: ev.country || null,
            ticketUrl: ev.ticketUrl || null,
            price: ev.price,
            status: ev.status || 'upcoming',
            imageUrl: ev.imageUrl,
            description: ev.description || null,
            featured: Boolean(ev.featured),
            order: typeof ev.order === 'number' ? ev.order : 0,
            createdAt: ev.createdAt ? new Date(ev.createdAt) : new Date(),
            updatedAt: ev.updatedAt ? new Date(ev.updatedAt) : new Date(),
          });
          existingEventIds.add(ev.id);
        }
      }
    }

    // 10. Event Artists backfill
    if (initialData.eventArtists && initialData.eventArtists.length > 0) {
      for (const ea of initialData.eventArtists) {
        if (existingEventIds.has(ea.eventId) && existingArtistIds.has(ea.artistId) && !existingEventArtistIds.has(ea.id)) {
          await insertIfNotExists('event_artists', {
            id: ea.id,
            eventId: ea.eventId,
            artistId: ea.artistId,
            role: ea.role || 'Headliner',
            order: typeof ea.order === 'number' ? ea.order : 0,
            createdAt: ea.createdAt ? new Date(ea.createdAt) : new Date(),
            updatedAt: ea.updatedAt ? new Date(ea.updatedAt) : new Date(),
          });
          existingEventArtistIds.add(ea.id);
        }
      }
    }

    // 11. Videos backfill
    if (initialData.videos && initialData.videos.length > 0) {
      for (const vid of initialData.videos) {
        if (!existingVideoIds.has(vid.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: Video ID "${vid.id}" ("${vid.title}")`);
          await insertIfNotExists('videos', {
            id: vid.id,
            title: vid.title,
            artist: vid.artist,
            youtubeId: vid.youtubeId,
            thumbnailUrl: vid.thumbnailUrl,
            duration: vid.duration || '3:30',
            views: typeof vid.views === 'number' ? vid.views : 0,
            publishedAt: vid.publishedAt || new Date().toISOString().split('T')[0],
            category: vid.category || 'Official Music Videos',
            featured: Boolean(vid.featured),
            description: vid.description || null,
            tags: Array.isArray(vid.tags) ? JSON.stringify(vid.tags) : '[]',
            order: typeof vid.order === 'number' ? vid.order : 0,
            createdAt: vid.createdAt ? new Date(vid.createdAt) : new Date(),
            updatedAt: vid.updatedAt ? new Date(vid.updatedAt) : new Date(),
          });
          existingVideoIds.add(vid.id);
        }
      }
    }

    // 12. Services backfill
    if (initialData.services && initialData.services.length > 0) {
      for (const s of initialData.services) {
        if (!existingServiceIds.has(s.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: Service ID "${s.id}" ("${s.title}")`);
          await insertIfNotExists('services', {
            id: s.id,
            number: s.number || '01',
            title: s.title,
            slug: s.slug || s.id,
            category: s.category || 'Production',
            shortDesc: s.shortDesc || s.fullDesc || '',
            fullDesc: s.fullDesc || s.shortDesc || '',
            description: s.shortDesc || s.fullDesc || '',
            imageUrl: s.imageUrl || '',
            icon: s.icon || 'Music',
            features: Array.isArray(s.features) ? JSON.stringify(s.features) : '[]',
            plans: (s as any).plans ? JSON.stringify((s as any).plans) : '[]',
            specs: (s as any).specs ? JSON.stringify((s as any).specs) : '[]',
            specifications: (s as any).specs ? JSON.stringify((s as any).specs) : '[]',
            deliverables: (s as any).deliverables ? JSON.stringify((s as any).deliverables) : '[]',
            equipmentList: (s as any).equipmentList ? JSON.stringify((s as any).equipmentList) : '[]',
            faqs: (s as any).faqs ? JSON.stringify((s as any).faqs) : '[]',
            ctaText: s.ctaText || 'INITIATE PROJECT',
            pricingRange: s.pricingRange || null,
            order: typeof s.order === 'number' ? s.order : 0,
            isActive: s.isActive !== false,
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
          });
          existingServiceIds.add(s.id);
        }
      }
    }

    // 13. Media backfill
    if (initialData.media && initialData.media.length > 0) {
      for (const m of initialData.media) {
        if (!existingMediaIds.has(m.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: Media ID "${m.id}" ("${m.filename}")`);
          await insertIfNotExists('media', {
            id: m.id,
            filename: m.filename,
            originalName: m.originalName,
            mimeType: m.mimeType,
            size: typeof m.size === 'number' ? m.size : 0,
            url: m.url,
            path: m.path || null,
            altText: m.altText || null,
            category: m.category || 'image',
            uploadedBy: m.uploadedBy || null,
            createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
            updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
          });
          existingMediaIds.add(m.id);
        }
      }
    }

    // 14. Contact Requests backfill (missing records only)
    if (initialData.contactRequests && initialData.contactRequests.length > 0) {
      for (const c of initialData.contactRequests) {
        if (!existingContactIds.has(c.id)) {
          console.log(`[JSON -> Supabase] Inserting missing record into Supabase: ContactRequest ID "${c.id}" (${c.referenceId || c.email})`);
          await insertIfNotExists('contact_requests', {
            id: c.id,
            referenceId: c.referenceId || `VXO-${Date.now().toString(36).toUpperCase()}`,
            name: c.name,
            email: c.email,
            phone: c.phone || null,
            company: c.company || null,
            service: c.service,
            message: c.message,
            status: c.status || 'NEW',
            notes: c.notes || null,
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          });
          existingContactIds.add(c.id);
        }
      }
    }

    console.log('[PostgreSQL] ✅ Initial migration and missing-record backfill complete.');

    // -----------------------------------------------------------------
    // HYDRATION: Load authoritative records from PostgreSQL
    // PostgreSQL is now the authoritative production source of truth.
    // -----------------------------------------------------------------
    if (onHydrate) {
      const [
        loadedHomepage,
        loadedSiteSettings,
        loadedServices,
        loadedContacts,
        loadedArtistsResult,
        loadedAlbums,
        loadedTracks,
        loadedEventsResult,
        loadedVideos,
        loadedMedia,
        loadedAdmins,
        loadedLogs,
        loadedPreWedding,
      ] = await Promise.all([
        loadHomepageFromPostgres(),
        loadSiteSettingsFromPostgres(),
        loadServicesFromPostgres(),
        loadContactRequestsFromPostgres(),
        loadArtistsFromPostgres(),
        loadAlbumsFromPostgres(),
        loadTracksFromPostgres(),
        loadEventsFromPostgres(),
        loadVideosFromPostgres(),
        loadMediaFromPostgres(),
        loadAdminUsersFromPostgres(),
        loadActivityLogsFromPostgres(),
        loadPreWeddingFromPostgres(),
      ]);

      const authoritativeData: Partial<DatabaseSchema> = {
        homepage: loadedHomepage || undefined,
        siteSettings: loadedSiteSettings || undefined,
        preWedding: loadedPreWedding || undefined,
        services: loadedServices.length > 0 ? loadedServices : undefined,
        contactRequests: loadedContacts.length > 0 ? loadedContacts : undefined,
        artists: loadedArtistsResult.artists.length > 0 ? loadedArtistsResult.artists : undefined,
        artistSocials: loadedArtistsResult.socials.length > 0 ? loadedArtistsResult.socials : undefined,
        albums: loadedAlbums.length > 0 ? loadedAlbums : undefined,
        tracks: loadedTracks.length > 0 ? loadedTracks : undefined,
        events: loadedEventsResult.events.length > 0 ? loadedEventsResult.events : undefined,
        eventArtists: loadedEventsResult.eventArtists.length > 0 ? loadedEventsResult.eventArtists : undefined,
        videos: loadedVideos.length > 0 ? loadedVideos : undefined,
        media: loadedMedia.length > 0 ? loadedMedia : undefined,
        adminUsers: loadedAdmins.length > 0 ? loadedAdmins : undefined,
        activityLogs: loadedLogs.length > 0 ? loadedLogs : undefined,
      };

      onHydrate(authoritativeData);
      console.log('[PostgreSQL] 🚀 PostgreSQL is now authoritative for all reads and writes.');
    }

    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL Init Warning]:', err.message);
    isConnected = false;
    pool = null;
    if (!retryTimer) {
      retryTimer = setTimeout(async () => {
        retryTimer = null;
        await initPostgresSync(initialData, onHydrate);
      }, 10000);
      retryTimer.unref?.();
    }
    return false;
  }
}
