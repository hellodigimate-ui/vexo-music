import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import type { ApiResponse, ServiceItem } from '../types/index.js';

export const serviceRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/services
  fastify.get('/services', async () => {
    const list = db.services.findMany().filter((s) => s.isActive);
    const formatted: ServiceItem[] = list.map((s, idx) => ({
      id: s.id,
      number: s.number || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`),
      title: s.title,
      slug: s.slug || undefined,
      category: s.category || 'Production',
      shortDesc: s.shortDesc,
      fullDesc: s.fullDesc,
      imageUrl: s.imageUrl,
      icon: s.icon || 'Music',
      features: s.features || [],
      ctaText: s.ctaText || undefined,
      order: s.order,
      isActive: s.isActive,
    }));

    const response: ApiResponse<ServiceItem[]> = {
      success: true,
      data: formatted,
      total: formatted.length,
    };
    return response;
  });

  // GET /api/services/detailed
  fastify.get('/services/detailed', async () => {
    const list = db.services.findMany().filter((s) => s.isActive);
    const formatted: ServiceItem[] = list.map((s, idx) => ({
      id: s.id,
      number: s.number || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`),
      title: s.title,
      slug: s.slug || undefined,
      category: s.category || 'Production',
      shortDesc: s.shortDesc,
      fullDesc: s.fullDesc,
      imageUrl: s.imageUrl,
      icon: s.icon || 'Music',
      features: s.features || [],
      ctaText: s.ctaText || undefined,
      order: s.order,
      isActive: s.isActive,
      detailedDescription: s.fullDesc,
      specifications: s.specifications,
      equipmentList: s.equipmentList,
      pricingRange: s.pricingRange || undefined,
    }));

    const response: ApiResponse<ServiceItem[]> = {
      success: true,
      data: formatted,
      total: formatted.length,
    };
    return response;
  });

  // GET /api/services/:id
  fastify.get<{
    Params: { id: string };
  }>('/services/:id', async (request, reply) => {
    const { id } = request.params;
    const s = db.services.findBySlug(id) || db.services.findById(id);

    if (!s) {
      return reply.code(404).send({
        success: false,
        message: `Service with identifier '${id}' not found.`,
      });
    }

    const formatted: ServiceItem = {
      id: s.id,
      number: s.number,
      title: s.title,
      slug: s.slug || undefined,
      category: s.category || 'Production',
      shortDesc: s.shortDesc,
      fullDesc: s.fullDesc,
      imageUrl: s.imageUrl,
      icon: s.icon || 'Music',
      features: s.features || [],
      ctaText: s.ctaText || undefined,
      order: s.order,
      isActive: s.isActive,
    };

    const response: ApiResponse<ServiceItem> = {
      success: true,
      data: formatted,
    };
    return response;
  });
};
