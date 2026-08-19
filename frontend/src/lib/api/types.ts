/**
 * Standardized API Response contracts for VEXO Music Platform backend integration.
 * Designed to mirror Fastify + Prisma API responses.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
