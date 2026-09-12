import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import dotenv from 'dotenv';
import type { Service, Media, ContactRequest, Artist, ArtistSocial } from './types.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnected = false;
let serviceColumns: Set<string> = new Set();
let targetServiceTable: string = 'services';
let contactColumns: Set<string> = new Set();
let targetContactTable: string = 'contact_requests';
let artistColumns: Set<string> = new Set();
let targetArtistTable: string = 'artists';

let cachedServices: Service[] = [];
let cachedContacts: ContactRequest[] = [];
let cachedArtists: Artist[] = [];
let cachedSocials: ArtistSocial[] = [];
let retryTimer: NodeJS.Timeout | null = null;

function reloadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
}

export function isPostgresConnected(): boolean {
  return isConnected;
}

export function getPostgresPool(): pg.Pool | null {
  reloadEnv();
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('postgres')) {
    return null;
  }

  if (dbUrl.includes('YOUR_PASSWORD')) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Error]:', err.message);
      isConnected = false;
      pool = null;
    });
  }

  return pool;
}

export async function initPostgresSync(
  initialServices: Service[] = [],
  initialContacts: ContactRequest[] = [],
  initialArtists: Artist[] = [],
  initialSocials: ArtistSocial[] = []
) {
  if (initialServices && initialServices.length > 0) cachedServices = initialServices;
  if (initialContacts && initialContacts.length > 0) cachedContacts = initialContacts;
  if (initialArtists && initialArtists.length > 0) cachedArtists = initialArtists;
  if (initialSocials && initialSocials.length > 0) cachedSocials = initialSocials;

  const client = getPostgresPool();
  if (!client) {
    if (!retryTimer) {
      retryTimer = setInterval(async () => {
        const ok = await initPostgresSync(cachedServices, cachedContacts, cachedArtists, cachedSocials);
        if (ok && retryTimer) {
          clearInterval(retryTimer);
          retryTimer = null;
        }
      }, 3000);
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

    // 1. Inspect Service/services table
    const serviceColRes = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND (table_name = 'services' OR table_name = 'Service');
    `);

    if (serviceColRes.rows.length === 0) {
      console.log('[PostgreSQL] Creating public."services" table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS public."services" (
          id TEXT PRIMARY KEY,
          number TEXT DEFAULT '01',
          title TEXT NOT NULL,
          slug TEXT,
          category TEXT DEFAULT 'Production',
          "shortDesc" TEXT,
          "fullDesc" TEXT,
          "imageUrl" TEXT,
          icon TEXT DEFAULT 'Music',
          features TEXT,
          plans JSONB,
          specs JSONB,
          specifications TEXT,
          deliverables JSONB,
          "equipmentList" TEXT,
          faqs JSONB,
          "ctaText" TEXT DEFAULT 'INITIATE PROJECT',
          "pricingRange" TEXT,
          "order" INTEGER DEFAULT 0,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        );
      `);
      targetServiceTable = 'services';
      serviceColumns = new Set([
        'id', 'number', 'title', 'slug', 'category', 'shortDesc', 'fullDesc',
        'imageUrl', 'icon', 'features', 'plans', 'specs', 'specifications',
        'deliverables', 'equipmentList', 'faqs', 'ctaText', 'pricingRange',
        'order', 'isActive', 'createdAt', 'updatedAt'
      ]);
    } else {
      targetServiceTable = serviceColRes.rows[0].table_name;
      serviceColumns = new Set(serviceColRes.rows.map((r: any) => r.column_name));
    }

    // 2. Inspect contact_requests table
    const contactColRes = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND (table_name = 'contact_requests' OR table_name = 'ContactRequest');
    `);

    if (contactColRes.rows.length === 0) {
      console.log('[PostgreSQL] Creating public."contact_requests" table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS public."contact_requests" (
          id TEXT PRIMARY KEY,
          "referenceId" TEXT UNIQUE,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          company TEXT,
          service TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'NEW',
          notes TEXT,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        );
      `);
      targetContactTable = 'contact_requests';
      contactColumns = new Set([
        'id', 'referenceId', 'name', 'email', 'phone', 'company',
        'service', 'message', 'status', 'notes', 'createdAt', 'updatedAt'
      ]);
    } else {
      targetContactTable = contactColRes.rows[0].table_name;
      contactColumns = new Set(contactColRes.rows.map((r: any) => r.column_name));
    }

    // 3. Inspect artists table
    const artistColRes = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND (table_name = 'artists' OR table_name = 'Artist');
    `);
    if (artistColRes.rows.length > 0) {
      targetArtistTable = artistColRes.rows[0].table_name;
      artistColumns = new Set(artistColRes.rows.map((r: any) => r.column_name));
    }

    // Sync all services
    const servicesToSync = cachedServices.length > 0 ? cachedServices : initialServices;
    for (const s of servicesToSync) {
      await syncServiceToPostgres(s);
    }
    console.log(`[PostgreSQL] ✅ Synced ${servicesToSync.length} services to public."${targetServiceTable}"!`);

    // Sync all contact requests / inquiries
    const contactsToSync = cachedContacts.length > 0 ? cachedContacts : initialContacts;
    for (const c of contactsToSync) {
      await syncContactRequestToPostgres(c);
    }
    console.log(`[PostgreSQL] ✅ Synced ${contactsToSync.length} inquiries to public."${targetContactTable}"!`);

    // Sync all artists
    const artistsToSync = cachedArtists.length > 0 ? cachedArtists : initialArtists;
    for (const a of artistsToSync) {
      const artSocials = cachedSocials.filter((s) => s.artistId === a.id);
      await syncArtistToPostgres(a, artSocials);
    }
    console.log(`[PostgreSQL] ✅ Synced ${artistsToSync.length} artists directly to public."${targetArtistTable}"!\n`);

    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL Init Warning]:', err.message);
    isConnected = false;
    pool = null;
    if (!retryTimer) {
      retryTimer = setInterval(async () => {
        const ok = await initPostgresSync(cachedServices, cachedContacts, cachedArtists, cachedSocials);
        if (ok && retryTimer) {
          clearInterval(retryTimer);
          retryTimer = null;
        }
      }, 3000);
    }
    return false;
  }
}

export async function syncServiceToPostgres(service: Service) {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const fields: string[] = [];
    const values: any[] = [];
    const placeholders: string[] = [];

    const addField = (colName: string, val: any) => {
      const matchingCol = Array.from(serviceColumns).find(
        (c) => c === colName || c.toLowerCase() === colName.toLowerCase()
      );
      if (matchingCol) {
        fields.push(`"${matchingCol}"`);
        values.push(val);
        placeholders.push(`$${values.length}`);
      }
    };

    const now = new Date();
    const createdAt = service.createdAt ? new Date(service.createdAt) : now;
    const updatedAt = service.updatedAt ? new Date(service.updatedAt) : now;

    addField('id', service.id);
    addField('number', service.number || '01');
    addField('title', service.title);
    addField('slug', service.slug || service.id);
    addField('category', service.category || 'Production');
    addField('description', service.shortDesc || service.fullDesc || '');
    addField('shortDesc', service.shortDesc || '');
    addField('fullDesc', service.fullDesc || service.shortDesc || '');
    addField('imageUrl', service.imageUrl || '');
    addField('icon', service.icon || 'Music');
    addField('features', Array.isArray(service.features) ? JSON.stringify(service.features) : (service.features || '[]'));
    addField('plans', (service as any).plans ? JSON.stringify((service as any).plans) : '[]');
    addField('specs', (service as any).specs ? JSON.stringify((service as any).specs) : '[]');
    addField('specifications', (service as any).specs ? JSON.stringify((service as any).specs) : '[]');
    addField('deliverables', (service as any).deliverables ? JSON.stringify((service as any).deliverables) : '[]');
    addField('equipmentList', (service as any).deliverables ? JSON.stringify((service as any).deliverables) : '[]');
    addField('faqs', (service as any).faqs ? JSON.stringify((service as any).faqs) : '[]');
    addField('ctaText', service.ctaText || 'INITIATE PROJECT');
    addField('pricingRange', service.pricingRange || null);
    addField('order', typeof service.order === 'number' ? service.order : 0);
    addField('isActive', service.isActive !== false);
    addField('createdAt', createdAt);
    addField('updatedAt', updatedAt);

    if (fields.length > 0) {
      const updateClause = fields
        .filter((f) => f !== '"id"')
        .map((f) => `${f} = EXCLUDED.${f}`)
        .join(', ');

      const query = `
        INSERT INTO public."${targetServiceTable}" (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT ("id") DO UPDATE SET ${updateClause};
      `;

      await client.query(query, values);
    }
  } catch (err: any) {
    console.warn(`[PostgreSQL Service Sync Error for "${service.title}"]:`, err.message);
  }
}

export async function deleteServiceFromPostgres(serviceId: string) {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    await client.query(`DELETE FROM public."${targetServiceTable}" WHERE "id" = $1`, [serviceId]);
  } catch (err: any) {
    console.warn(`[PostgreSQL Service Delete Error for "${serviceId}"]:`, err.message);
  }
}

export async function syncContactRequestToPostgres(contact: ContactRequest) {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    const fields: string[] = [];
    const values: any[] = [];
    const placeholders: string[] = [];

    const addField = (colName: string, val: any) => {
      const matchingCol = Array.from(contactColumns).find(
        (c) => c === colName || c.toLowerCase() === colName.toLowerCase()
      );
      if (matchingCol) {
        fields.push(`"${matchingCol}"`);
        values.push(val);
        placeholders.push(`$${values.length}`);
      }
    };

    const now = new Date();
    const createdAt = contact.createdAt ? new Date(contact.createdAt) : now;
    const updatedAt = contact.updatedAt ? new Date(contact.updatedAt) : now;

    addField('id', contact.id);
    addField('referenceId', contact.referenceId || `VXO-${Date.now().toString(36).toUpperCase()}`);
    addField('name', contact.name);
    addField('email', contact.email);
    addField('phone', contact.phone || null);
    addField('company', contact.company || null);
    addField('service', contact.service);
    addField('message', contact.message);
    addField('status', contact.status || 'NEW');
    addField('notes', contact.notes || null);
    addField('createdAt', createdAt);
    addField('updatedAt', updatedAt);

    if (fields.length > 0) {
      const updateClause = fields
        .filter((f) => f !== '"id"')
        .map((f) => `${f} = EXCLUDED.${f}`)
        .join(', ');

      const query = `
        INSERT INTO public."${targetContactTable}" (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT ("id") DO UPDATE SET ${updateClause};
      `;

      await client.query(query, values);
      console.log(`[PostgreSQL] ✅ Saved inquiry "${contact.name}" (${contact.referenceId}) to live DB!`);
    }
  } catch (err: any) {
    console.warn(`[PostgreSQL Inquiry Sync Error for "${contact.name}"]:`, err.message);
  }
}

export async function deleteContactRequestFromPostgres(contactId: string) {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    await client.query(`DELETE FROM public."${targetContactTable}" WHERE "id" = $1`, [contactId]);
    console.log(`[PostgreSQL] 🗑️ Deleted inquiry "${contactId}" from live DB.`);
  } catch (err: any) {
    console.warn(`[PostgreSQL Inquiry Delete Error for "${contactId}"]:`, err.message);
  }
}

export async function syncArtistToPostgres(artist: Artist, socials?: ArtistSocial[]) {
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

    const query = `
      INSERT INTO public."${targetArtistTable}" (
        "id", "name", "slug", "role", "avatarUrl", "coverUrl", "bio",
        "monthlyListeners", "genres", "featured", "isComingSoon", "order",
        "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "slug" = EXCLUDED."slug",
        "role" = EXCLUDED."role",
        "avatarUrl" = EXCLUDED."avatarUrl",
        "coverUrl" = EXCLUDED."coverUrl",
        "bio" = EXCLUDED."bio",
        "monthlyListeners" = EXCLUDED."monthlyListeners",
        "genres" = EXCLUDED."genres",
        "featured" = EXCLUDED."featured",
        "isComingSoon" = EXCLUDED."isComingSoon",
        "order" = EXCLUDED."order",
        "updatedAt" = EXCLUDED."updatedAt";
    `;

    const values = [
      artist.id,
      artist.name,
      slug,
      artist.role || 'Recording Artist',
      avatarUrl,
      artist.coverUrl || null,
      artist.bio || null,
      typeof artist.monthlyListeners === 'number' ? artist.monthlyListeners : 0,
      genres,
      Boolean(artist.featured),
      Boolean(artist.isComingSoon),
      typeof artist.order === 'number' ? artist.order : 0,
      createdAt,
      updatedAt,
    ];

    await client.query(query, values);
    console.log(`[PostgreSQL] ✅ Saved artist "${artist.name}" (${artist.id}) to live DB!`);

    // Sync socials if provided
    if (socials && socials.length > 0) {
      await client.query('DELETE FROM public.artist_socials WHERE "artistId" = $1', [artist.id]);
      for (const s of socials) {
        const socQuery = `
          INSERT INTO public.artist_socials ("id", "artistId", "platform", "url", "order", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT ("id") DO UPDATE SET
            "platform" = EXCLUDED."platform",
            "url" = EXCLUDED."url",
            "order" = EXCLUDED."order",
            "updatedAt" = EXCLUDED."updatedAt";
        `;
        await client.query(socQuery, [
          s.id || `soc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          artist.id,
          s.platform,
          s.url,
          s.order || 0,
          createdAt,
          updatedAt,
        ]);
      }
    }
  } catch (err: any) {
    console.warn(`[PostgreSQL Artist Sync Error for "${artist.name}"]:`, err.message);
  }
}

export async function deleteArtistFromPostgres(artistId: string) {
  const client = getPostgresPool();
  if (!client || !isConnected) return;

  try {
    await client.query(`DELETE FROM public.artist_socials WHERE "artistId" = $1`, [artistId]);
    await client.query(`DELETE FROM public."${targetArtistTable}" WHERE "id" = $1`, [artistId]);
    console.log(`[PostgreSQL] 🗑️ Deleted artist "${artistId}" from live DB.`);
  } catch (err: any) {
    console.warn(`[PostgreSQL Artist Delete Error for "${artistId}"]:`, err.message);
  }
}
