import { ApiError } from './contracts.js';

export const notConfigured = (message: string, details?: unknown): ApiError => ({
  status: 501,
  code: 'NOT_CONFIGURED',
  message,
  details,
});

export const upstreamError = (status: number, message: string, details?: unknown): ApiError => ({
  status,
  code: 'UPSTREAM_ERROR',
  message,
  details,
});

export const rateLimited = (message = 'Rate limit exceeded'): ApiError => ({
  status: 429,
  code: 'RATE_LIMITED',
  message,
});

export const badRequest = (message = 'Bad request', details?: unknown): ApiError => ({
  status: 400,
  code: 'BAD_REQUEST',
  message,
  details,
});

export const internalError = (message = 'Internal error', details?: unknown): ApiError => ({
  status: 500,
  code: 'INTERNAL_ERROR',
  message,
  details,
});

export const notFound = (message = 'Not found', details?: unknown): ApiError => ({
  status: 404,
  code: 'NOT_FOUND',
  message,
  details,
});
