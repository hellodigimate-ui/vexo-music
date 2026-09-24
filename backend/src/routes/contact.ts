import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { verifyPostgresConnection } from '../db/postgres.js';
import type { ApiResponse, ContactFormData, ContactResponse } from '../types/index.js';

export const contactRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/contact
  fastify.post<{
    Body: ContactFormData;
  }>('/contact', async (request, reply) => {
    const { name, email, phone, company, service, message } = request.body || {};

    // Validation
    if (!name || !name.trim()) {
      return reply.code(400).send({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return reply.code(400).send({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    if (!service || !service.trim()) {
      return reply.code(400).send({
        success: false,
        message: 'Service is required.',
      });
    }

    if (!message || message.trim().length < 10) {
      return reply.code(400).send({
        success: false,
        message: 'Message must be at least 10 characters long.',
      });
    }

    if (phone && phone.trim()) {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return reply.code(400).send({
          success: false,
          message: 'Phone number must be a valid 10-digit number.',
        });
      }
    }

    try {
      // 1. Verify PostgreSQL connection is available before accepting inquiry
      await verifyPostgresConnection();

      // 2. Persist to database (Admin store + Supabase PostgreSQL)
      const saved = await db.contactRequests.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() ? phone.trim().replace(/\D/g, '').slice(0, 10) : null,
        company: company?.trim() || null,
        service: service.trim(),
        message: message.trim(),
      });

      fastify.log.info(
        { id: saved.id, name, email, phone, company, service, referenceId: saved.referenceId },
        'Received and successfully persisted contact request to Supabase & Admin Store'
      );

      const contactResult: ContactResponse = {
        success: true,
        message: `Thank you, ${name}! Your project inquiry for "${service}" has been received. Our production team will contact you at ${email} within 24 hours.`,
        referenceId: saved.referenceId,
        timestamp: saved.createdAt,
      };

      const response: ApiResponse<ContactResponse> = {
        success: true,
        data: contactResult,
      };

      return reply.code(201).send(response);
    } catch (err: any) {
      fastify.log.error(
        { err: err.message, stack: err.stack, name, email },
        'Failed to persist contact request to Supabase PostgreSQL'
      );

      return reply.code(500).send({
        success: false,
        message: `Unable to submit your project inquiry at this time. Database persistence failed: ${err.message || 'PostgreSQL error'}`,
      });
    }
  });
};
