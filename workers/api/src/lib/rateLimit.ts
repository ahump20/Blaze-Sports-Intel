import { rateLimited } from '@blaze/core';
import { error } from './http.js';
import type { Env } from '../index.js';

const MINUTE_MS = 60_000;

export async function enforceRateLimit(env: Env, key: string, maxPerMinute: number): Promise<Response | null> {
  const now = Date.now();
  const windowBucket = Math.floor(now / MINUTE_MS);
  const compositeKey = `${key}:${windowBucket}`;
  const currentRaw = await env.BLAZE_KV_NAMESPACE.get(compositeKey);
  const current = currentRaw ? Number.parseInt(currentRaw, 10) : 0;

  if (Number.isNaN(current) || current >= maxPerMinute) {
    return error(rateLimited());
  }

  await env.BLAZE_KV_NAMESPACE.put(compositeKey, String(current + 1), { expirationTtl: 90 });
  return null;
}
