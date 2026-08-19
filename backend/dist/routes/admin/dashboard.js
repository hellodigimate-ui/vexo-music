import { db } from '../../db/index.js';
export const adminDashboardRoutes = async (fastify) => {
    // GET /api/admin/dashboard/stats
    fastify.get('/dashboard/stats', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const snapshot = db.snapshot;
        const totalArtists = snapshot.artists.length;
        const totalAlbums = snapshot.albums.length;
        const totalTracks = snapshot.tracks.length;
        const totalVideos = snapshot.videos.length;
        const totalEvents = snapshot.events.length;
        const totalServices = snapshot.services.length;
        const totalMedia = snapshot.media.length;
        const totalInquiries = snapshot.contactRequests.length;
        const newInquiries = snapshot.contactRequests.filter((c) => c.status === 'NEW').length;
        const totalMonthlyListeners = snapshot.artists.reduce((sum, a) => sum + (a.monthlyListeners || 0), 0);
        const totalVideoViews = snapshot.videos.reduce((sum, v) => sum + (v.views || 0), 0);
        const recentInquiries = snapshot.contactRequests.slice(0, 5);
        const recentActivity = snapshot.activityLogs.slice(0, 8);
        const upcomingEvents = snapshot.events.filter((e) => e.status === 'upcoming' || e.status === 'live').slice(0, 4);
        return reply.send({
            success: true,
            data: {
                kpis: {
                    totalArtists,
                    totalAlbums,
                    totalTracks,
                    totalVideos,
                    totalEvents,
                    totalServices,
                    totalMedia,
                    totalInquiries,
                    newInquiries,
                    totalMonthlyListeners,
                    totalVideoViews,
                },
                recentInquiries,
                recentActivity,
                upcomingEvents,
                serverUptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    });
};
