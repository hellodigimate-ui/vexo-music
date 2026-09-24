import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { db, onServicesChange } from '../db/index.js';
import type { ApiResponse, ServiceItem } from '../types/index.js';

let cachedDetailedResponse: ApiResponse<ServiceItem[]> | null = null;

export function invalidateServicesCache() {
  cachedDetailedResponse = null;
}

// Invalidate cache whenever CMS admin modifies services
onServicesChange(() => {
  invalidateServicesCache();
});

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
      pricingRange: s.pricingRange || undefined,
      plans: (s as any).plans || [],
      specs: (s as any).specs || (s as any).specifications || [],
      processSteps: (s as any).processSteps || [],
      deliverables: (s as any).deliverables || [],
      faqs: (s as any).faqs || [],
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

  const getDetailedServicesHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
    const startTime = process.hrtime();

    if (cachedDetailedResponse) {
      const diff = process.hrtime(startTime);
      const ms = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
      reply.header('X-Response-Time', `${ms}ms`);
      reply.header('X-Cache', 'HIT');
      return cachedDetailedResponse;
    }

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
      plans: (s as any).plans || [],
      specs: (s as any).specs || (s as any).specifications || [],
      processSteps: (s as any).processSteps || [],
      deliverables: (s as any).deliverables || [],
      faqs: (s as any).faqs || [],
    }));

    const response: ApiResponse<ServiceItem[]> = {
      success: true,
      data: formatted,
      total: formatted.length,
    };

    cachedDetailedResponse = response;

    const diff = process.hrtime(startTime);
    const ms = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
    reply.header('X-Response-Time', `${ms}ms`);
    reply.header('X-Cache', 'MISS');
    return response;
  };

  // GET /api/services/detailed
  fastify.get('/services/detailed', getDetailedServicesHandler);

  // GET /api/detailed (direct route / alias for compatibility)
  fastify.get('/detailed', getDetailedServicesHandler);

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
      pricingRange: s.pricingRange || undefined,
      plans: (s as any).plans || [],
      specs: (s as any).specs || (s as any).specifications || [],
      processSteps: (s as any).processSteps || [],
      deliverables: (s as any).deliverables || [],
      faqs: (s as any).faqs || [],
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
