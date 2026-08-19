import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { Media } from '../../db/types.js';
import { getStorageProvider } from '../../services/storage/index.js';

export const adminMediaRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/media
  fastify.get<{
    Querystring: {
      category?: string;
      search?: string;
    };
  }>(
    '/media',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const { category, search } = request.query;
      const media = db.media.findMany({
        category: category || 'all',
        search: search ? String(search).trim() : undefined,
      });

      return {
        success: true,
        data: media,
        total: media.length,
      };
    }
  );

  // GET /api/admin/media/:id
  fastify.get<{
    Params: { id: string };
  }>(
    '/media/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const media = db.media.findById(id);
      if (!media) {
        return reply.code(404).send({
          success: false,
          message: `Media with id '${id}' not found.`,
        });
      }
      return {
        success: true,
        data: media,
      };
    }
  );

  // POST /api/admin/media/upload (Base64 file buffer upload)
  fastify.post<{
    Body: {
      fileData: string; // Base64 or Data URI
      originalName: string;
      mimeType: string;
      altText?: string;
      category?: 'image' | 'audio' | 'video' | 'document';
    };
  }>(
    '/media/upload',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { fileData, originalName, mimeType, altText, category } = request.body;

      if (!fileData || !originalName || !mimeType) {
        return reply.code(400).send({
          success: false,
          message: 'Missing required fields: fileData, originalName, and mimeType are mandatory.',
        });
      }

      try {
        // Strip data URI prefix if present (e.g. data:image/png;base64,...)
        const base64Content = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        const buffer = Buffer.from(base64Content, 'base64');

        const storage = getStorageProvider();
        const uploadResult = await storage.upload(buffer, originalName, mimeType, {
          altText,
          category,
        });

        const created = db.media.create({
          filename: uploadResult.filename,
          originalName: uploadResult.originalName,
          mimeType: uploadResult.mimeType,
          size: uploadResult.size,
          url: uploadResult.url,
          path: uploadResult.path,
          altText: altText || uploadResult.originalName,
          category: uploadResult.category,
          uploadedBy: user.id,
        });

        db.activityLogs.log({
          adminUserId: user.id,
          adminUserName: user.name,
          action: 'UPLOAD_MEDIA',
          entityType: 'Media',
          entityId: created.id,
          details: {
            filename: created.filename,
            originalName: created.originalName,
            category: created.category,
            size: created.size,
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'] || '',
        });

        return reply.code(201).send({
          success: true,
          data: created,
          message: `Asset "${created.originalName}" uploaded successfully.`,
        });
      } catch (err: any) {
        return reply.code(400).send({
          success: false,
          message: err.message || 'File upload failed validation.',
        });
      }
    }
  );

  // POST /api/admin/media (Direct URL reference creation)
  fastify.post<{
    Body: {
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
      path?: string;
      altText?: string;
      category?: 'image' | 'audio' | 'video' | 'document';
    };
  }>(
    '/media',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const body = request.body;

      if (!body.filename || !body.url) {
        return reply.code(400).send({
          success: false,
          message: 'Filename and URL are required.',
        });
      }

      const created = db.media.create({
        filename: body.filename,
        originalName: body.originalName || body.filename,
        mimeType: body.mimeType || 'image/jpeg',
        size: Number(body.size) || 0,
        url: body.url,
        path: body.path || null,
        altText: body.altText || null,
        category: body.category || 'image',
        uploadedBy: user.id,
      });

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'CREATE_MEDIA_REF',
        entityType: 'Media',
        entityId: created.id,
        details: { filename: body.filename, url: body.url },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.code(201).send({
        success: true,
        data: created,
        message: 'Media reference created successfully.',
      });
    }
  );

  // DELETE /api/admin/media/:id
  fastify.delete<{
    Params: { id: string };
  }>(
    '/media/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;

      const existing = db.media.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Media with id '${id}' not found.`,
        });
      }

      // Delete physical file from disk via StorageProvider
      const storage = getStorageProvider();
      if (existing.path) {
        await storage.delete(existing.path);
      } else if (existing.filename) {
        await storage.delete(`${existing.category}/${existing.filename}`);
      }

      // Delete record from database
      db.media.delete(id);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'DELETE_MEDIA',
        entityType: 'Media',
        entityId: id,
        details: { deletedFilename: existing.filename, category: existing.category },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        message: `Media "${existing.filename}" deleted successfully.`,
      });
    }
  );
};
