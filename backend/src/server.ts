import fs from 'node:fs';
import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { authPlugin } from './plugins/auth.js';
import { apiRoutes } from './routes/index.js';
import { getStorageProvider, LocalStorageProvider } from './services/storage/index.js';

import { db } from './db/index.js';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*').replace(/\/+$/, '');

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

async function start() {
  try {
    // CORS plugin registration
    await server.register(cors, {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const cleanOrigin = origin.replace(/\/+$/, '');
        if (
          CORS_ORIGIN === '*' ||
          cleanOrigin === CORS_ORIGIN ||
          cleanOrigin.startsWith('http://localhost:') ||
          cleanOrigin.startsWith('http://127.0.0.1:') ||
          cleanOrigin === 'http://localhost' ||
          cleanOrigin === 'http://127.0.0.1' ||
          cleanOrigin.endsWith('.vercel.app') ||
          cleanOrigin.endsWith('.onrender.com') ||
          cleanOrigin.startsWith('https://')
        ) {
          return cb(null, true);
        }
        return cb(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // Register Authentication Plugin
    await server.register(authPlugin);

    // Root Welcome Endpoint
    server.get('/', async () => {
      return {
        service: 'VEXO Music Entertainment Pvt. Ltd. API',
        tagline: 'Pioneering original soundscapes, artist management, and digital distribution.',
        documentation: '/api/health',
        endpoints: {
          health: '/api/health',
          homepage: '/api/homepage',
          siteSettings: '/api/site-settings',
          albums: '/api/albums',
          tracks: '/api/tracks',
          artists: '/api/artists',
          events: '/api/events',
          services: '/api/services',
          videos: '/api/videos',
          contact: '/api/contact (POST)',
          admin: '/api/admin/*',
        },
      };
    });

    // Static file serving for uploads directory: GET /uploads/*
    server.get('/uploads/*', async (request, reply) => {
      const storage = getStorageProvider() as LocalStorageProvider;
      const baseDir = typeof storage.getBaseDir === 'function' ? storage.getBaseDir() : path.resolve(process.cwd(), 'uploads');
      const relativePath = (request.params as any)['*'] || '';
      const safePath = path.resolve(baseDir, relativePath.replace(/^[/\\]+/, '').replace(/\.\./g, ''));

      if (!safePath.startsWith(path.resolve(baseDir)) || !fs.existsSync(safePath)) {
        return reply.code(404).send({ success: false, message: 'Media file not found.' });
      }

      const stat = fs.statSync(safePath);
      if (stat.isDirectory()) {
        return reply.code(403).send({ success: false, message: 'Directory listing not permitted.' });
      }

      const ext = path.extname(safePath).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.aac': 'audio/aac',
        '.flac': 'audio/flac',
        '.m4a': 'audio/mp4',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.pdf': 'application/pdf',
      };

      const contentType = mimeMap[ext] || 'application/octet-stream';
      reply.header('Content-Type', contentType);
      reply.header('Cache-Control', 'public, max-age=31536000, immutable');

      const stream = fs.createReadStream(safePath);
      return reply.send(stream);
    });

    // Register all API routes under `/api` prefix
    await server.register(apiRoutes, { prefix: '/api' });

    // Global Not Found Handler
    server.setNotFoundHandler((request, reply) => {
      reply.code(404).send({
        success: false,
        message: `Endpoint ${request.method} ${request.url} not found.`,
      });
    });

    // Global Error Handler
    server.setErrorHandler((error, request, reply) => {
      server.log.error(error);
      reply.code(error.statusCode || 500).send({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    });

    // Hydrate in-memory store from Supabase PostgreSQL
    server.log.info('Hydrating live data store from Supabase PostgreSQL...');
    await db.waitForSync(8000);

    await server.listen({ port: PORT, host: HOST });
    server.log.info(`VEXO API Server running on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Start Fastify server
start();
