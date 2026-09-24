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
      ALTER TABLE public."services"
        ADD COLUMN IF NOT EXISTS "description" TEXT,
        ADD COLUMN IF NOT EXISTS "plans" JSONB,
        ADD COLUMN IF NOT EXISTS "specs" JSONB,
        ADD COLUMN IF NOT EXISTS "deliverables" JSONB,
        ADD COLUMN IF NOT EXISTS "faqs" JSONB,
        ADD COLUMN IF NOT EXISTS "processSteps" JSONB;
    `);

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS public."contact_requests" (
        "id" TEXT PRIMARY KEY,
        "referenceId" TEXT UNIQUE,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "company" TEXT,
        "service" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "status" TEXT DEFAULT 'NEW',
        "notes" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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

  if (dbUrl === 'disconnected' || dbUrl === 'disabled' || dbUrl?.includes('YOUR_PASSWORD')) {
    if (pool) {
      try { pool.end(); } catch {}
      pool = null;
    }
    isConnected = false;
    return null;
  }

  if (!dbUrl || dbUrl.includes('dev.db')) {
    dbUrl = DEFAULT_SUPABASE_DATABASE_URL;
  }

  // If pool already exists but DATABASE_URL was changed, recreate pool
  if (pool && (pool as any)._customDbUrl !== dbUrl) {
    try { pool.end(); } catch {}
    pool = null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 8000,
    });
    (pool as any)._customDbUrl = dbUrl;

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Error]:', err.message);
      isConnected = false;
      pool = null;
    });
  }

  return pool;
}

export async function verifyPostgresConnection(): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    isConnected = false;
    throw new Error('PostgreSQL database pool is unavailable or disconnected.');
  }
  try {
    await client.query('SELECT 1 FROM public."contact_requests" LIMIT 1;');
    isConnected = true;
    return true;
  } catch (err: any) {
    isConnected = false;
    console.error('[PostgreSQL Connection Verification Error]:', err.message);
    throw new Error(`PostgreSQL is unavailable: ${err.message}`);
  }
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
/**
 * Generic upsert helper that dynamically discovers and matches columns in the live PostgreSQL table.
 * Throws an error on connection failure, missing columns, or database execution failure.
 */
async function upsertRow(
  tableName: string,
  dataObj: Record<string, any>,
  conflictCol: string = 'id'
): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Cannot upsert into "${tableName}": Database connection pool is unavailable.`);
  }

  let tableCols = tableColumnsMap.get(tableName);
  if (!tableCols || tableCols.size === 0) {
    const colRes = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1;`,
      [tableName]
    );
    if (colRes.rows.length === 0) {
      throw new Error(`[PostgreSQL] Table "public.${tableName}" does not exist in database.`);
    }
    tableCols = new Set(colRes.rows.map((r: any) => r.column_name));
    tableColumnsMap.set(tableName, tableCols);
  }

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

  if (fields.length === 0) {
    throw new Error(`[PostgreSQL] No matching columns found for table "${tableName}".`);
  }

  const updateClause = fields
    .filter((f) => f !== `"${conflictCol}"`)
    .map((f) => `${f} = EXCLUDED.${f}`)
    .join(', ');

  const query = `
    INSERT INTO public."${tableName}" (${fields.join(', ')})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT ("${conflictCol}") DO UPDATE SET ${updateClause}
    RETURNING "${conflictCol}";
  `;

  const res = await client.query(query, values);
  if (!res || !res.rowCount || res.rowCount === 0) {
    throw new Error(`[PostgreSQL] Upsert into "${tableName}" failed to affect any rows.`);
  }
  return true;
}


/**
 * Delete a row by id. Throws an error on failure.
 */
async function deleteRow(tableName: string, id: string, idCol: string = 'id'): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Cannot delete from "${tableName}": Database connection pool is unavailable.`);
  }
  await client.query(`DELETE FROM public."${tableName}" WHERE "${idCol}" = $1`, [id]);
  return true;
}

// ==========================================
// 1. HOMEPAGE SYNC & LOAD
// ==========================================
export async function syncHomepageToPostgres(homepage: Homepage): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error('[PostgreSQL] Database pool is unavailable. Cannot sync homepage.');
  }

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
  console.log('[PostgreSQL] ✅ Homepage synced to Supabase.');
  return true;
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
export async function syncSiteSettingsToPostgres(settings: SiteSettings): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error('[PostgreSQL] Database pool is unavailable. Cannot sync site settings.');
  }

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
  console.log('[PostgreSQL] ✅ SiteSettings synced to Supabase.');
  return true;
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
export async function syncServiceToPostgres(service: Service): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot sync service "${service.title}".`);
  }

  const now = new Date();
  const createdAt = service.createdAt ? new Date(service.createdAt) : now;
  const updatedAt = service.updatedAt ? new Date(service.updatedAt) : now;

  const dataObj: Record<string, any> = {
    id: service.id,
    number: service.number || '01',
    title: service.title,
    slug: service.slug || service.id,
    category: service.category || 'Production',
    shortDesc: service.shortDesc || (service as any).description || service.fullDesc || '',
    fullDesc: service.fullDesc || service.shortDesc || (service as any).description || '',
    description: (service as any).description || service.shortDesc || service.fullDesc || '',
    imageUrl: service.imageUrl || '',
    icon: service.icon || 'Music',
    features: Array.isArray(service.features) ? JSON.stringify(service.features) : (service.features || '[]'),
    plans: (service as any).plans ? JSON.stringify((service as any).plans) : '[]',
    specs: (service as any).specs ? JSON.stringify((service as any).specs) : (Array.isArray(service.specifications) ? JSON.stringify(service.specifications) : '[]'),
    specifications: (service as any).specs ? JSON.stringify((service as any).specs) : (Array.isArray(service.specifications) ? JSON.stringify(service.specifications) : '[]'),
    deliverables: (service as any).deliverables ? JSON.stringify((service as any).deliverables) : '[]',
    equipmentList: (service as any).equipmentList ? JSON.stringify((service as any).equipmentList) : '[]',
    faqs: (service as any).faqs ? JSON.stringify((service as any).faqs) : '[]',
    processSteps: (service as any).processSteps ? JSON.stringify((service as any).processSteps) : '[]',
    ctaText: service.ctaText || 'INITIATE PROJECT',
    pricingRange: service.pricingRange || null,
    order: typeof service.order === 'number' ? service.order : 0,
    isActive: service.isActive !== false,
    createdAt,
    updatedAt,
  };

  await upsertRow('services', dataObj, 'id');
  console.log(`[PostgreSQL] ✅ Service "${service.title}" (${service.id}) persisted to Supabase.`);
  return true;
}

export async function deleteServiceFromPostgres(serviceId: string): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot delete service "${serviceId}".`);
  }
  await deleteRow('services', serviceId, 'id');
  console.log(`[PostgreSQL] ✅ Service ID "${serviceId}" deleted from Supabase.`);
  return true;
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
      description: r.description || r.shortDesc || r.fullDesc || '',
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
export async function syncContactRequestToPostgres(contact: ContactRequest): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    const errMsg = '[PostgreSQL] Database pool is unavailable. Cannot persist contact request.';
    console.error(errMsg);
    throw new Error(errMsg);
  }

  const now = new Date();
  const createdAt = contact.createdAt ? new Date(contact.createdAt) : now;
  const updatedAt = contact.updatedAt ? new Date(contact.updatedAt) : now;

  const query = `
    INSERT INTO public."contact_requests" (
      "id",
      "referenceId",
      "name",
      "email",
      "phone",
      "company",
      "service",
      "message",
      "status",
      "notes",
      "createdAt",
      "updatedAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT ("id") DO UPDATE SET
      "referenceId" = EXCLUDED."referenceId",
      "name" = EXCLUDED."name",
      "email" = EXCLUDED."email",
      "phone" = EXCLUDED."phone",
      "company" = EXCLUDED."company",
      "service" = EXCLUDED."service",
      "message" = EXCLUDED."message",
      "status" = EXCLUDED."status",
      "notes" = EXCLUDED."notes",
      "updatedAt" = EXCLUDED."updatedAt"
    RETURNING "id", "referenceId";
  `;

  const values = [
    contact.id,
    contact.referenceId || `VXO-${Date.now().toString(36).toUpperCase()}`,
    contact.name,
    contact.email,
    contact.phone || null,
    contact.company || null,
    contact.service,
    contact.message,
    contact.status || 'NEW',
    contact.notes || null,
    createdAt,
    updatedAt,
  ];

  try {
    const res = await client.query(query, values);
    if (!res || !res.rowCount || res.rowCount === 0) {
      throw new Error(`[PostgreSQL] Zero rows affected during upsert for contact ID "${contact.id}".`);
    }
    console.log(`[PostgreSQL] ✅ Contact request persisted to Supabase: ID="${contact.id}", Ref="${contact.referenceId || res.rows[0]?.referenceId}"`);
    return true;
  } catch (err: any) {
    console.error(`[PostgreSQL Contact Sync Error for "${contact.name}"]:`, err.message);
    throw err;
  }
}

export async function deleteContactRequestFromPostgres(contactId: string): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot delete contact request "${contactId}".`);
  }
  await deleteRow('contact_requests', contactId, 'id');
  console.log(`[PostgreSQL] ✅ ContactRequest ID "${contactId}" deleted from Supabase.`);
  return true;
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
export async function syncArtistToPostgres(artist: Artist, socials?: ArtistSocial[]): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot sync artist "${artist.name}".`);
  }

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
  console.log(`[PostgreSQL] ✅ Artist "${artist.name}" (${artist.id}) persisted to Supabase.`);
  return true;
}

export async function deleteArtistFromPostgres(artistId: string): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot delete artist "${artistId}".`);
  }
  await client.query('DELETE FROM public.artist_socials WHERE "artistId" = $1', [artistId]);
  await deleteRow('artists', artistId, 'id');
  console.log(`[PostgreSQL] ✅ Artist ID "${artistId}" deleted from Supabase.`);
  return true;
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
export async function syncAlbumToPostgres(album: Album): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot sync album "${album.title}".`);
  }

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
  console.log(`[PostgreSQL] ✅ Album "${album.title}" (${album.id}) persisted to Supabase.`);
  return true;
}

export async function deleteAlbumFromPostgres(albumId: string): Promise<boolean> {
  const res = await deleteRow('albums', albumId, 'id');
  console.log(`[PostgreSQL] ✅ Album ID "${albumId}" deleted from Supabase.`);
  return res;
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
export async function syncTrackToPostgres(track: Track): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot sync track "${track.title}".`);
  }

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
  console.log(`[PostgreSQL] ✅ Track "${track.title}" (${track.id}) persisted to Supabase.`);
  return true;
}

export async function deleteTrackFromPostgres(trackId: string): Promise<boolean> {
  const res = await deleteRow('tracks', trackId, 'id');
  console.log(`[PostgreSQL] ✅ Track ID "${trackId}" deleted from Supabase.`);
  return res;
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
export async function syncVideoToPostgres(video: Video): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot sync video "${video.title}".`);
  }

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
  console.log(`[PostgreSQL] ✅ Video "${video.title}" (${video.id}) persisted to Supabase.`);
  return true;
}

export async function deleteVideoFromPostgres(videoId: string): Promise<boolean> {
  const res = await deleteRow('videos', videoId, 'id');
  console.log(`[PostgreSQL] ✅ Video ID "${videoId}" deleted from Supabase.`);
  return res;
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
export async function syncEventToPostgres(event: Event, eventArtists?: EventArtist[]): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot sync event "${event.title}".`);
  }

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
  console.log(`[PostgreSQL] ✅ Event "${event.title}" (${event.id}) persisted to Supabase.`);
  return true;
}

export async function deleteEventFromPostgres(eventId: string): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot delete event "${eventId}".`);
  }
  await client.query('DELETE FROM public.event_artists WHERE "eventId" = $1', [eventId]);
  await deleteRow('events', eventId, 'id');
  console.log(`[PostgreSQL] ✅ Event ID "${eventId}" deleted from Supabase.`);
  return true;
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
export async function syncMediaToPostgres(media: Media): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot sync media "${media.filename}".`);
  }

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
  console.log(`[PostgreSQL] ✅ Media "${media.filename}" (${media.id}) persisted to Supabase.`);
  return true;
}

export async function deleteMediaFromPostgres(mediaId: string): Promise<boolean> {
  const res = await deleteRow('media', mediaId, 'id');
  console.log(`[PostgreSQL] ✅ Media ID "${mediaId}" deleted from Supabase.`);
  return res;
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
export async function syncAdminUserToPostgres(user: AdminUser): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error(`[PostgreSQL] Database pool is unavailable. Cannot sync admin user "${user.email}".`);
  }

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
  console.log(`[PostgreSQL] ✅ AdminUser "${user.email}" (${user.id}) persisted to Supabase.`);
  return true;
}

export async function deleteAdminUserFromPostgres(userId: string): Promise<boolean> {
  const res = await deleteRow('admin_users', userId, 'id');
  console.log(`[PostgreSQL] ✅ AdminUser ID "${userId}" deleted from Supabase.`);
  return res;
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
export async function syncActivityLogToPostgres(log: ActivityLog): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error('[PostgreSQL] Database pool is unavailable. Cannot sync activity log.');
  }

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
  return true;
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
export async function syncPreWeddingToPostgres(data: PreWeddingPageData): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    throw new Error('[PostgreSQL] Database pool is unavailable. Cannot persist Pre-Wedding data.');
  }

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

    const res = await upsertRow('pre_wedding', dataObj, 'id');
    console.log('[PostgreSQL] ✅ Pre-Wedding studio content synced to Supabase PostgreSQL.');
    return res;
  } catch (err: any) {
    console.error('[PostgreSQL PreWedding Sync Error]:', err.message);
    throw err;
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
  onHydrate?: (data: Partial<DatabaseSchema>) => void
): Promise<boolean> {
  const client = getPostgresPool();
  if (!client) {
    if (!retryTimer) {
      retryTimer = setTimeout(async () => {
        retryTimer = null;
        await initPostgresSync(onHydrate);
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

    // -----------------------------------------------------------------
    // HYDRATION: Load authoritative records from PostgreSQL
    // Supabase PostgreSQL is the SINGLE LIVE SOURCE OF TRUTH.
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
        services: loadedServices,
        contactRequests: loadedContacts,
        artists: loadedArtistsResult.artists,
        artistSocials: loadedArtistsResult.socials,
        albums: loadedAlbums,
        tracks: loadedTracks,
        events: loadedEventsResult.events,
        eventArtists: loadedEventsResult.eventArtists,
        videos: loadedVideos,
        media: loadedMedia,
        adminUsers: loadedAdmins,
        activityLogs: loadedLogs,
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
        await initPostgresSync(onHydrate);
      }, 10000);
      retryTimer.unref?.();
    }
    return false;
  }
}
