import type { Env } from '../index.js';

const DEFAULT_RATE_LIMIT = 60;
const DEFAULT_CACHE_TTL = 90;

export const resolveRateLimit = (env: Env): number => {
  const configured = env.RATE_LIMIT_REQUESTS_PER_MINUTE;
  if (!configured) {
    return DEFAULT_RATE_LIMIT;
  }
  const parsed = Number.parseInt(configured, 10);
  return Number.isNaN(parsed) ? DEFAULT_RATE_LIMIT : parsed;
};

export const resolveCacheTtl = (env: Env): number => {
  const configured = env.CACHE_TTL_SECONDS;
  if (!configured) {
    return DEFAULT_CACHE_TTL;
  }
  const parsed = Number.parseInt(configured, 10);
  return Number.isNaN(parsed) ? DEFAULT_CACHE_TTL : parsed;
};
