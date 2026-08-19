import { db } from '../../db/index.js';
import { comparePassword, hashPassword } from '../../lib/crypto.js';
import { signJwt } from '../../lib/jwt.js';
export const adminAuthRoutes = async (fastify) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'vexo-music-admin-super-secret-jwt-key-2026';
    // POST /api/admin/auth/login
    fastify.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body || {};
        if (!email || !password) {
            return reply.code(400).send({
                success: false,
                message: 'Email and password are required.',
            });
        }
        const user = db.adminUsers.findByEmail(email);
        if (!user) {
            return reply.code(401).send({
                success: false,
                message: 'Invalid email or password credentials.',
            });
        }
        if (!user.isActive) {
            return reply.code(403).send({
                success: false,
                message: 'This admin account has been deactivated.',
            });
        }
        const isMatch = comparePassword(password, user.passwordHash);
        if (!isMatch) {
            return reply.code(401).send({
                success: false,
                message: 'Invalid email or password credentials.',
            });
        }
        // Update lastLoginAt
        const now = new Date().toISOString();
        db.adminUsers.update(user.id, { lastLoginAt: now });
        const token = signJwt({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }, JWT_SECRET);
        // Audit log
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'ADMIN_LOGIN',
            entityType: 'AdminUser',
            entityId: user.id,
            details: { email: user.email },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.send({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    lastLoginAt: now,
                },
            },
            message: `Welcome back, ${user.name}!`,
        });
    });
    // GET /api/admin/auth/me
    fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        return reply.send({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
            },
        });
    });
    // POST /api/admin/auth/logout
    fastify.post('/auth/logout', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'ADMIN_LOGOUT',
            entityType: 'AdminUser',
            entityId: user.id,
            details: null,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.send({
            success: true,
            message: 'Successfully logged out.',
        });
    });
    // PUT /api/admin/auth/password
    fastify.put('/auth/password', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const { currentPassword, newPassword } = request.body || {};
        if (!currentPassword || !newPassword) {
            return reply.code(400).send({
                success: false,
                message: 'Both current password and new password are required.',
            });
        }
        if (newPassword.length < 6) {
            return reply.code(400).send({
                success: false,
                message: 'New password must be at least 6 characters long.',
            });
        }
        const isMatch = comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) {
            return reply.code(400).send({
                success: false,
                message: 'Current password does not match.',
            });
        }
        const newHash = hashPassword(newPassword);
        db.adminUsers.update(user.id, { passwordHash: newHash });
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'PASSWORD_CHANGE',
            entityType: 'AdminUser',
            entityId: user.id,
            details: null,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.send({
            success: true,
            message: 'Password updated successfully.',
        });
    });
};
