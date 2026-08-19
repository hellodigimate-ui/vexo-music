import { db } from '../../db/index.js';
export const adminActivityLogRoutes = async (fastify) => {
    // GET /api/admin/activity-logs
    fastify.get('/activity-logs', { preHandler: [fastify.authenticate] }, async (request) => {
        const limit = request.query.limit ? parseInt(request.query.limit, 10) : 50;
        const logs = db.activityLogs.findMany(limit);
        return {
            success: true,
            data: logs,
            total: logs.length,
        };
    });
};
