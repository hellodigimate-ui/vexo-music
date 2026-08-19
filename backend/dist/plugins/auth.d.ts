import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { type AdminTokenPayload } from '../lib/jwt.js';
import type { AdminUser } from '../db/types.js';
declare module 'fastify' {
    interface FastifyRequest {
        adminUser?: AdminUser;
        tokenPayload?: AdminTokenPayload;
    }
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}
export declare const authPlugin: FastifyPluginAsync;
