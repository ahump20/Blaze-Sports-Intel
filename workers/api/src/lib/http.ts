import type { ApiError } from '@blaze/core';
import { notFound as notFoundError } from '@blaze/core';

export const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
    ...init,
  });

export const error = (err: ApiError): Response =>
  json({ error: err }, { status: err.status });

export const notFound = (message = 'Not found'): Response => error(notFoundError(message));
