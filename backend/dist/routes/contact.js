import { db } from '../db/index.js';
export const contactRoutes = async (fastify) => {
    // POST /api/contact
    fastify.post('/contact', async (request, reply) => {
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
        // Persist to database
        const saved = db.contactRequests.create({
            name: name.trim(),
            email: email.trim(),
            phone: phone?.trim() ? phone.trim().replace(/\D/g, '').slice(0, 10) : null,
            company: company?.trim() || null,
            service: service.trim(),
            message: message.trim(),
        });
        fastify.log.info({ name, email, phone, company, service, referenceId: saved.referenceId }, 'Received and saved new contact request');
        const contactResult = {
            success: true,
            message: `Thank you, ${name}! Your project inquiry for "${service}" has been received. Our production team will contact you at ${email} within 24 hours.`,
            referenceId: saved.referenceId,
            timestamp: saved.createdAt,
        };
        const response = {
            success: true,
            data: contactResult,
        };
        return reply.code(201).send(response);
    });
};
