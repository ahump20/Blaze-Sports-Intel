import { badRequest, notConfigured } from '@blaze/core';
import { json, error } from '../lib/http.js';
import { enforceRateLimit } from '../lib/rateLimit.js';
import { resolveRateLimit } from '../util/config.js';
import type { Env } from '../index.js';

export async function handleTrack(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  if (!env.TRACK_PROVIDER_API_KEY) {
    return error(notConfigured('Track provider not configured'));
  }

  const ip = req.headers.get('cf-connecting-ip') ?? 'anonymous';
  const limited = await enforceRateLimit(env, `track:${ip}`, resolveRateLimit(env));
  if (limited) {
    return limited;
  }

  const url = new URL(req.url);
  const path = url.pathname.replace('/v1/track', '');

  if (path === '/meets') {
    const date = url.searchParams.get('date');
    if (!date) {
      return error(badRequest('date is required'));
    }
    return json({ provider: 'stub', date, items: [] });
  }

  return error(badRequest('Track route unsupported'));
}
