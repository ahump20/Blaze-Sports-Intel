import { router } from './router.js';

export interface Env {
  BLAZE_KV_NAMESPACE: KVNamespace;
  RATE_LIMIT_REQUESTS_PER_MINUTE?: string;
  CACHE_TTL_SECONDS?: string;
  SPORTSDATA_NFL_API_KEY?: string;
  SPORTSDATA_NBA_API_KEY?: string;
  SPORTRADAR_NFL_API_KEY?: string;
  SPORTRADAR_NBA_API_KEY?: string;
  COLLEGEFOOTBALLDATA_API_KEY?: string;
  TRACK_PROVIDER_API_KEY?: string;
}

const worker: ExportedHandler<Env> = {
  fetch: (req, env, ctx) => router.handle(req, env, ctx),
};

export default worker;
