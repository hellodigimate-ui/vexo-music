import { generateId } from '../lib/crypto.js';
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
import {
  initPostgresSync,
  syncHomepageToPostgres,
  syncSiteSettingsToPostgres,
  syncServiceToPostgres,
  deleteServiceFromPostgres,
  syncContactRequestToPostgres,
  deleteContactRequestFromPostgres,
  syncArtistToPostgres,
  deleteArtistFromPostgres,
  syncAlbumToPostgres,
  deleteAlbumFromPostgres,
  syncTrackToPostgres,
  deleteTrackFromPostgres,
  syncVideoToPostgres,
  deleteVideoFromPostgres,
  syncEventToPostgres,
  deleteEventFromPostgres,
  syncMediaToPostgres,
  deleteMediaFromPostgres,
  syncAdminUserToPostgres,
  deleteAdminUserFromPostgres,
  syncActivityLogToPostgres,
  syncPreWeddingToPostgres,
} from './postgres.js';

function createEmptyDatabase(): DatabaseSchema {
  return {
    adminUsers: [],
    artists: [],
    artistSocials: [],
    albums: [],
    tracks: [],
    events: [],
    eventArtists: [],
    videos: [],
    services: [],
    media: [],
    contactRequests: [],
    homepage: null as any,
    siteSettings: null as any,
    activityLogs: [],
    preWedding: null as any,
  };
}

class DatabaseStore {
  private data: DatabaseSchema;
  private syncPromise: Promise<boolean> | null = null;

  constructor() {
    this.data = createEmptyDatabase();
    this.syncPromise = initPostgresSync((authoritativeData) => {
      this.hydrateFromPostgres(authoritativeData);
    }).catch((err) => {
      console.warn('[DatabaseStore] PostgreSQL initialization error:', err?.message || err);
      return false;
    });
  }

  public async waitForSync(timeoutMs: number = 8000): Promise<boolean> {
    if (!this.syncPromise) return false;
    return Promise.race([
      this.syncPromise,
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
    ]);
  }

  public hydrateFromPostgres(pgData: Partial<DatabaseSchema>) {
    this.data.homepage = pgData.homepage || (null as any);
    this.data.siteSettings = pgData.siteSettings || (null as any);
    this.data.preWedding = pgData.preWedding || (null as any);

    this.data.services = Array.isArray(pgData.services) ? pgData.services : [];
    this.data.contactRequests = Array.isArray(pgData.contactRequests) ? pgData.contactRequests : [];
    this.data.artists = Array.isArray(pgData.artists) ? pgData.artists : [];
    this.data.artistSocials = Array.isArray(pgData.artistSocials) ? pgData.artistSocials : [];
    this.data.albums = Array.isArray(pgData.albums) ? pgData.albums : [];
    this.data.tracks = Array.isArray(pgData.tracks) ? pgData.tracks : [];
    this.data.events = Array.isArray(pgData.events) ? pgData.events : [];
    this.data.eventArtists = Array.isArray(pgData.eventArtists) ? pgData.eventArtists : [];
    this.data.videos = Array.isArray(pgData.videos) ? pgData.videos : [];
    this.data.media = Array.isArray(pgData.media) ? pgData.media : [];
    this.data.adminUsers = Array.isArray(pgData.adminUsers) ? pgData.adminUsers : [];
    this.data.activityLogs = Array.isArray(pgData.activityLogs) ? pgData.activityLogs : [];

    console.log('[DatabaseStore] ✅ Store successfully hydrated directly from PostgreSQL database.');
  }

  public get snapshot(): DatabaseSchema {
    return this.data;
  }

  public async reload(): Promise<DatabaseSchema> {
    await initPostgresSync((authoritativeData) => {
      this.hydrateFromPostgres(authoritativeData);
    });
    return this.data;
  }

  public persist() {
    // Database (PostgreSQL) is the sole live data source.
  }

  // --- Admin User ---
  public get adminUsers() {
    return {
      findMany: () => this.data.adminUsers,
      findById: (id: string) => this.data.adminUsers.find((u) => u.id === id) || null,
      findByEmail: (email: string) =>
        this.data.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
      create: async (item: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const user: AdminUser = {
          ...item,
          id: generateId('adm'),
          createdAt: now,
          updatedAt: now,
        };
        await syncAdminUserToPostgres(user);
        this.data.adminUsers.push(user);
        return user;
      },
      update: async (id: string, updates: Partial<AdminUser>) => {
        const index = this.data.adminUsers.findIndex((u) => u.id === id);
        if (index === -1) return null;
        const updated: AdminUser = {
          ...this.data.adminUsers[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncAdminUserToPostgres(updated);
        this.data.adminUsers[index] = updated;
        return updated;
      },
      delete: async (id: string) => {
        const index = this.data.adminUsers.findIndex((u) => u.id === id);
        if (index === -1) return false;
        await deleteAdminUserFromPostgres(id);
        this.data.adminUsers.splice(index, 1);
        return true;
      },
    };
  }

  // --- Artists ---
  public get artists() {
    return {
      findMany: () => {
        return this.data.artists.map((artist) => ({
          ...artist,
          socials: this.data.artistSocials.filter((s) => s.artistId === artist.id),
        }));
      },
      findById: (id: string) => {
        const artist = this.data.artists.find((a) => a.id === id);
        if (!artist) return null;
        return {
          ...artist,
          socials: this.data.artistSocials.filter((s) => s.artistId === artist.id),
        };
      },
      findBySlug: (slug: string) => {
        const artist = this.data.artists.find((a) => a.slug === slug);
        if (!artist) return null;
        return {
          ...artist,
          socials: this.data.artistSocials.filter((s) => s.artistId === artist.id),
        };
      },
      create: async (item: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>, socials?: Array<{ platform: string; url: string }>) => {
        const now = new Date().toISOString();
        const id = generateId('art');
        const artist: Artist = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
        };

        const socialsList: ArtistSocial[] = [];
        if (socials && socials.length > 0) {
          socials.forEach((s, idx) => {
            socialsList.push({
              id: generateId('soc'),
              artistId: id,
              platform: s.platform,
              url: s.url,
              order: idx + 1,
              createdAt: now,
              updatedAt: now,
            });
          });
        }

        await syncArtistToPostgres(artist, socialsList);
        this.data.artists.push(artist);
        this.data.artistSocials.push(...socialsList);
        return this.artists.findById(id);
      },
      update: async (id: string, updates: Partial<Artist>, socials?: Array<{ platform: string; url: string }>) => {
        const index = this.data.artists.findIndex((a) => a.id === id);
        if (index === -1) return null;
        const now = new Date().toISOString();

        const updatedArtist: Artist = {
          ...this.data.artists[index],
          ...updates,
          updatedAt: now,
        };

        let updatedSocials: ArtistSocial[] | undefined = undefined;
        if (socials !== undefined) {
          updatedSocials = socials.map((s, idx) => ({
            id: generateId('soc'),
            artistId: id,
            platform: s.platform,
            url: s.url,
            order: idx + 1,
            createdAt: now,
            updatedAt: now,
          }));
        }

        await syncArtistToPostgres(updatedArtist, updatedSocials);
        this.data.artists[index] = updatedArtist;

        if (updatedSocials !== undefined) {
          this.data.artistSocials = this.data.artistSocials.filter((s) => s.artistId !== id);
          this.data.artistSocials.push(...updatedSocials);
        }

        return this.artists.findById(id);
      },
      delete: async (id: string) => {
        const index = this.data.artists.findIndex((a) => a.id === id);
        if (index === -1) return false;
        await deleteArtistFromPostgres(id);
        this.data.artists.splice(index, 1);
        this.data.artistSocials = this.data.artistSocials.filter((s) => s.artistId !== id);
        this.data.eventArtists = this.data.eventArtists.filter((ea) => ea.artistId !== id);
        return true;
      },
    };
  }

  // --- Artist Socials ---
  public get artistSocials() {
    return {
      findByArtistId: (artistId: string) => this.data.artistSocials.filter((s) => s.artistId === artistId),
    };
  }

  // --- Albums ---
  public get albums() {
    return {
      findMany: () => {
        return this.data.albums
          .slice()
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
          .map((album) => ({
            ...album,
            tracks: this.data.tracks.filter((t) => t.albumId === album.id),
          }));
      },
      findById: (id: string) => {
        const album = this.data.albums.find((a) => a.id === id);
        if (!album) return null;
        return {
          ...album,
          tracks: this.data.tracks.filter((t) => t.albumId === album.id),
        };
      },
      create: async (item: Omit<Album, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const album: Album = {
          ...item,
          id: generateId('alb'),
          createdAt: now,
          updatedAt: now,
        };
        await syncAlbumToPostgres(album);
        this.data.albums.push(album);
        return album;
      },
      update: async (id: string, updates: Partial<Album>) => {
        const index = this.data.albums.findIndex((a) => a.id === id);
        if (index === -1) return null;
        const updated: Album = {
          ...this.data.albums[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncAlbumToPostgres(updated);
        this.data.albums[index] = updated;
        return this.albums.findById(id);
      },
      delete: async (id: string) => {
        const index = this.data.albums.findIndex((a) => a.id === id);
        if (index === -1) return false;
        await deleteAlbumFromPostgres(id);
        this.data.albums.splice(index, 1);
        this.data.tracks.forEach((t) => {
          if (t.albumId === id) t.albumId = null;
        });
        return true;
      },
    };
  }

  // --- Tracks ---
  public get tracks() {
    return {
      findMany: () => this.data.tracks.slice().sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
      findById: (id: string) => this.data.tracks.find((t) => t.id === id) || null,
      findByAlbumId: (albumId: string) => this.data.tracks.filter((t) => t.albumId === albumId),
      findByArtistId: (artistId: string) => this.data.tracks.filter((t) => t.artistId === artistId),
      create: async (item: Omit<Track, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const track: Track = {
          ...item,
          id: generateId('trk'),
          createdAt: now,
          updatedAt: now,
        };
        await syncTrackToPostgres(track);
        this.data.tracks.push(track);
        // Update album trackCount
        if (track.albumId) {
          const album = this.data.albums.find((a) => a.id === track.albumId);
          if (album) {
            album.trackCount = this.data.tracks.filter((t) => t.albumId === album.id).length;
            await syncAlbumToPostgres(album).catch(() => {});
          }
        }
        return track;
      },
      update: async (id: string, updates: Partial<Track>) => {
        const index = this.data.tracks.findIndex((t) => t.id === id);
        if (index === -1) return null;
        const updated: Track = {
          ...this.data.tracks[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncTrackToPostgres(updated);
        this.data.tracks[index] = updated;
        return updated;
      },
      delete: async (id: string) => {
        const index = this.data.tracks.findIndex((t) => t.id === id);
        if (index === -1) return false;
        const albumId = this.data.tracks[index].albumId;
        await deleteTrackFromPostgres(id);
        this.data.tracks.splice(index, 1);
        if (albumId) {
          const album = this.data.albums.find((a) => a.id === albumId);
          if (album) {
            album.trackCount = this.data.tracks.filter((t) => t.albumId === album.id).length;
            await syncAlbumToPostgres(album).catch(() => {});
          }
        }
        return true;
      },
    };
  }

  // --- Events ---
  public get events() {
    return {
      findMany: () => {
        return this.data.events.map((event) => ({
          ...event,
          eventArtists: this.data.eventArtists
            .filter((ea) => ea.eventId === event.id)
            .map((ea) => ({
              ...ea,
              artist: this.data.artists.find((a) => a.id === ea.artistId),
            })),
        }));
      },
      findById: (id: string) => {
        const event = this.data.events.find((e) => e.id === id);
        if (!event) return null;
        return {
          ...event,
          eventArtists: this.data.eventArtists
            .filter((ea) => ea.eventId === event.id)
            .map((ea) => ({
              ...ea,
              artist: this.data.artists.find((a) => a.id === ea.artistId),
            })),
        };
      },
      create: async (item: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>, artistIds?: string[]) => {
        const now = new Date().toISOString();
        const id = generateId('e');
        const event: Event = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
        };

        const eventArtistsList: EventArtist[] = [];
        if (artistIds && artistIds.length > 0) {
          artistIds.forEach((artId, idx) => {
            eventArtistsList.push({
              id: generateId('ea'),
              eventId: id,
              artistId: artId,
              role: idx === 0 ? 'Headliner' : 'Supporting',
              order: idx + 1,
              createdAt: now,
              updatedAt: now,
            });
          });
        }

        await syncEventToPostgres(event, eventArtistsList);
        this.data.events.push(event);
        this.data.eventArtists.push(...eventArtistsList);
        return this.events.findById(id);
      },
      update: async (id: string, updates: Partial<Event>, artistIds?: string[]) => {
        const index = this.data.events.findIndex((e) => e.id === id);
        if (index === -1) return null;
        const now = new Date().toISOString();

        const updatedEvent: Event = {
          ...this.data.events[index],
          ...updates,
          updatedAt: now,
        };

        let updatedEventArtists: EventArtist[] | undefined = undefined;
        if (artistIds !== undefined) {
          updatedEventArtists = artistIds.map((artId, idx) => ({
            id: generateId('ea'),
            eventId: id,
            artistId: artId,
            role: idx === 0 ? 'Headliner' : 'Supporting',
            order: idx + 1,
            createdAt: now,
            updatedAt: now,
          }));
        }

        await syncEventToPostgres(updatedEvent, updatedEventArtists);
        this.data.events[index] = updatedEvent;

        if (updatedEventArtists !== undefined) {
          this.data.eventArtists = this.data.eventArtists.filter((ea) => ea.eventId !== id);
          this.data.eventArtists.push(...updatedEventArtists);
        }

        return this.events.findById(id);
      },
      delete: async (id: string) => {
        const index = this.data.events.findIndex((e) => e.id === id);
        if (index === -1) return false;
        await deleteEventFromPostgres(id);
        this.data.events.splice(index, 1);
        this.data.eventArtists = this.data.eventArtists.filter((ea) => ea.eventId !== id);
        return true;
      },
    };
  }

  // --- Videos ---
  public get videos() {
    return {
      findMany: () => this.data.videos,
      findById: (id: string) => this.data.videos.find((v) => v.id === id) || null,
      create: async (item: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const video: Video = {
          ...item,
          id: generateId('vid'),
          createdAt: now,
          updatedAt: now,
        };
        await syncVideoToPostgres(video);
        this.data.videos.push(video);
        return video;
      },
      update: async (id: string, updates: Partial<Video>) => {
        const index = this.data.videos.findIndex((v) => v.id === id);
        if (index === -1) return null;
        const updated: Video = {
          ...this.data.videos[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncVideoToPostgres(updated);
        this.data.videos[index] = updated;
        return updated;
      },
      delete: async (id: string) => {
        const index = this.data.videos.findIndex((v) => v.id === id);
        if (index === -1) return false;
        await deleteVideoFromPostgres(id);
        this.data.videos.splice(index, 1);
        return true;
      },
    };
  }

  // --- Services ---
  public get services() {
    return {
      findMany: () => [...this.data.services].sort((a, b) => (a.order || 0) - (b.order || 0)),
      findById: (id: string) => this.data.services.find((s) => s.id === id) || null,
      findBySlug: (slug: string) => this.data.services.find((s) => s.slug === slug || s.id === slug) || null,
      create: async (item: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const service: Service = {
          ...item,
          id: generateId('srv'),
          createdAt: now,
          updatedAt: now,
        };
        await syncServiceToPostgres(service);
        this.data.services.push(service);
        notifyServicesChanged();
        return service;
      },
      update: async (id: string, updates: Partial<Service>) => {
        const index = this.data.services.findIndex((s) => s.id === id);
        if (index === -1) return null;
        const updatedService: Service = {
          ...this.data.services[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncServiceToPostgres(updatedService);
        this.data.services[index] = updatedService;
        notifyServicesChanged();
        return updatedService;
      },
      reorder: async (serviceIds: string[]) => {
        if (Array.isArray(serviceIds)) {
          const updatedServices: Service[] = [];
          for (let idx = 0; idx < serviceIds.length; idx++) {
            const s = this.data.services.find((item) => item.id === serviceIds[idx]);
            if (s) {
              const updated: Service = {
                ...s,
                order: idx + 1,
                updatedAt: new Date().toISOString(),
              };
              await syncServiceToPostgres(updated);
              updatedServices.push(updated);
            }
          }
          for (const u of updatedServices) {
            const idx = this.data.services.findIndex((s) => s.id === u.id);
            if (idx !== -1) {
              this.data.services[idx] = u;
            }
          }
          notifyServicesChanged();
        }
        return this.services.findMany();
      },
      delete: async (id: string) => {
        const index = this.data.services.findIndex((s) => s.id === id);
        if (index === -1) return false;
        await deleteServiceFromPostgres(id);
        this.data.services.splice(index, 1);
        notifyServicesChanged();
        return true;
      },
    };
  }

  // --- Media ---
  public get media() {
    return {
      findMany: (filter?: { category?: string; search?: string }) => {
        let list = this.data.media;
        if (filter?.category && filter.category.toLowerCase() !== 'all') {
          const cat = filter.category.toLowerCase().trim();
          list = list.filter((m) => m.category.toLowerCase() === cat);
        }
        if (filter?.search) {
          const q = filter.search.toLowerCase().trim();
          list = list.filter(
            (m) =>
              m.filename.toLowerCase().includes(q) ||
              m.originalName.toLowerCase().includes(q) ||
              (m.altText && m.altText.toLowerCase().includes(q))
          );
        }
        return list;
      },
      findById: (id: string) => this.data.media.find((m) => m.id === id) || null,
      create: async (item: Omit<Media, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const media: Media = {
          ...item,
          id: generateId('med'),
          createdAt: now,
          updatedAt: now,
        };
        await syncMediaToPostgres(media);
        this.data.media.push(media);
        return media;
      },
      update: async (id: string, updates: Partial<Media>) => {
        const index = this.data.media.findIndex((m) => m.id === id);
        if (index === -1) return null;
        const updated: Media = {
          ...this.data.media[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncMediaToPostgres(updated);
        this.data.media[index] = updated;
        return updated;
      },
      delete: async (id: string) => {
        const index = this.data.media.findIndex((m) => m.id === id);
        if (index === -1) return false;
        await deleteMediaFromPostgres(id);
        this.data.media.splice(index, 1);
        return true;
      },
    };
  }

  // --- Contact Requests ---
  public get contactRequests() {
    return {
      findMany: () => this.data.contactRequests,
      findById: (id: string) => this.data.contactRequests.find((c) => c.id === id) || null,
      findByReferenceId: (refId: string) => this.data.contactRequests.find((c) => c.referenceId === refId) || null,
      create: async (item: Omit<ContactRequest, 'id' | 'referenceId' | 'status' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const randomRef = `VXO-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const contact: ContactRequest = {
          ...item,
          id: generateId('cnt'),
          referenceId: randomRef,
          status: 'NEW',
          notes: null,
          createdAt: now,
          updatedAt: now,
        };
        // Persist directly to Supabase first; throws if fails
        await syncContactRequestToPostgres(contact);
        this.data.contactRequests.unshift(contact);
        return contact;
      },
      update: async (id: string, updates: Partial<ContactRequest>) => {
        const index = this.data.contactRequests.findIndex((c) => c.id === id);
        if (index === -1) return null;
        const updated: ContactRequest = {
          ...this.data.contactRequests[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncContactRequestToPostgres(updated);
        this.data.contactRequests[index] = updated;
        return updated;
      },
      delete: async (id: string) => {
        const index = this.data.contactRequests.findIndex((c) => c.id === id);
        if (index === -1) return false;
        await deleteContactRequestFromPostgres(id);
        this.data.contactRequests.splice(index, 1);
        return true;
      },
    };
  }

  // --- Homepage ---
  public get homepage() {
    return {
      get: () => this.data.homepage,
      update: async (updates: Partial<Homepage>) => {
        const current = this.homepage.get() || ({ id: 'homepage-singleton' } as Homepage);
        const updated: Homepage = {
<<<<<<< HEAD
          ...current,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncHomepageToPostgres(updated);
        this.data.homepage = updated;
        return updated;
      },
    };
  }

  // --- Site Settings ---
  public get siteSettings() {
    return {
      get: () => this.data.siteSettings,
      update: async (updates: Partial<SiteSettings>) => {
=======
          ...current,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncHomepageToPostgres(updated);
        this.data.homepage = updated;
        return updated;
      },
    };
  }

  // --- Site Settings ---
  public get siteSettings() {
    return {
      get: () => {
        if (!this.data.siteSettings) {
          this.data.siteSettings = {
            id: 'site-settings-singleton',
            siteName: 'VEXO Music Entertainment Pvt. Ltd.',
            siteDescription: 'Premier record label, studio production house, and artist management company.',
            logoUrl: '/logo.svg',
            faviconUrl: '/favicon.ico',
            contactEmail: 'contact@vexomusic.com',
            contactPhone: '+91 72399 99966',
            officeAddress: 'SKY CROWN, Office No. 205 Chordiya City, Kamla Nehru Nagar, Ajmer Road Jaipur, Pin Code- 302021, Rajasthan, India',
            copyrightText: '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
            socialSpotify: 'https://spotify.com',
            socialYoutube: 'https://youtube.com/@vexomusicentertainment',
            socialInstagram: 'https://www.instagram.com/vexomusicentertainment',
            socialTwitter: 'https://x.com/vexomusicentertainment',
            socialFacebook: 'https://facebook.com',
            socialAppleMusic: null,
            socialSoundcloud: null,
            maintenanceMode: false,
            updatedAt: new Date().toISOString(),
          } as SiteSettings;
        }
        return this.data.siteSettings;
      },
      update: async (updates: Partial<SiteSettings>) => {
>>>>>>> 6c6f775 (Initial commit)
        const current = this.siteSettings.get() || ({ id: 'site-settings-singleton' } as SiteSettings);
        const updated: SiteSettings = {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await syncSiteSettingsToPostgres(updated);
        this.data.siteSettings = updated;
        return updated;
      },
    };
  }

  // --- Activity Log ---
  public get activityLogs() {
    return {
      findMany: (limit = 50) => this.data.activityLogs.slice(0, limit),
      log: (entry: Omit<ActivityLog, 'id' | 'createdAt'>) => {
        const log: ActivityLog = {
          ...entry,
          id: generateId('log'),
          createdAt: new Date().toISOString(),
        };
        this.data.activityLogs.unshift(log);
        if (this.data.activityLogs.length > 200) {
          this.data.activityLogs = this.data.activityLogs.slice(0, 200);
        }
        syncActivityLogToPostgres(log).catch((err) => {
          console.warn('[DatabaseStore] ActivityLog sync warning:', err.message);
        });
        return log;
      },
    };
  }

  // --- Pre-Wedding Studio ---
  public get preWedding() {
    return {
      get: () => this.data.preWedding,
      update: async (updates: Partial<PreWeddingPageData>) => {
        const current = this.preWedding.get() || ({ id: 'pre-wedding-singleton' } as PreWeddingPageData);
        const updated: PreWeddingPageData = {
          ...current,
          ...updates,
          studioInfo: {
            ...current.studioInfo,
            ...(updates.studioInfo || {}),
          },
          directorInfo: {
            ...current.directorInfo,
            ...(updates.directorInfo || {}),
          },
          heroStats: updates.heroStats || current.heroStats || [],
          processSteps: updates.processSteps || current.processSteps || [],
          videos: updates.videos || current.videos || [],
          portfolioGallery: updates.portfolioGallery || current.portfolioGallery || [],
          coverageTypes: updates.coverageTypes || current.coverageTypes || [],
          coupleStories: updates.coupleStories || current.coupleStories || [],
          packages: updates.packages || current.packages || [],
          weddingPackages: updates.weddingPackages || current.weddingPackages || [],
          weddingDayStories: updates.weddingDayStories !== undefined ? updates.weddingDayStories : current.weddingDayStories,
          customServices: updates.customServices || current.customServices || [],
          addOns: updates.addOns || current.addOns || [],
          whyUsPillars: updates.whyUsPillars || current.whyUsPillars || [],
          updatedAt: new Date().toISOString(),
        };
        await syncPreWeddingToPostgres(updated);
        this.data.preWedding = updated;
        return updated;
      },
    };
  }
}

// Global Singleton Database Instance
export const db = new DatabaseStore();

type ServicesChangeListener = () => void;
const servicesChangeListeners: ServicesChangeListener[] = [];

export function onServicesChange(listener: ServicesChangeListener): () => void {
  servicesChangeListeners.push(listener);
  return () => {
    const idx = servicesChangeListeners.indexOf(listener);
    if (idx !== -1) {
      servicesChangeListeners.splice(idx, 1);
    }
  };
}

export function notifyServicesChanged(): void {
  servicesChangeListeners.forEach((fn) => {
    try {
      fn();
    } catch { }
  });
}

