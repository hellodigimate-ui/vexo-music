import { healthRoutes } from './health.js';
import { albumRoutes } from './albums.js';
import { artistRoutes } from './artists.js';
import { eventRoutes } from './events.js';
import { serviceRoutes } from './services.js';
import { videoRoutes } from './videos.js';
import { contactRoutes } from './contact.js';
import { publicHomepageRoutes } from './homepage.js';
import { publicSiteSettingsRoutes } from './siteSettings.js';
import { adminRoutes } from './admin/index.js';
export const apiRoutes = async (fastify) => {
    // Public Client Routes
    await fastify.register(healthRoutes);
    await fastify.register(albumRoutes);
    await fastify.register(artistRoutes);
    await fastify.register(eventRoutes);
    await fastify.register(serviceRoutes);
    await fastify.register(videoRoutes);
    await fastify.register(contactRoutes);
    await fastify.register(publicHomepageRoutes);
    await fastify.register(publicSiteSettingsRoutes);
    // Authenticated Admin Routes (/api/admin/*)
    await fastify.register(adminRoutes, { prefix: '/admin' });
};
