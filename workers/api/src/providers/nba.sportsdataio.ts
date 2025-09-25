import { badRequest, notConfigured, upstreamError } from '@blaze/core';
import { json, error } from '../lib/http.js';
import { enforceRateLimit } from '../lib/rateLimit.js';
import { resolveRateLimit } from '../util/config.js';
import type { Env } from '../index.js';

const SPORTS_DATA_BASE = 'https://api.sportsdata.io/v3/nba/scores/json';

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(String(res.status));
  }
  return (await res.json()) as T;
};

export async function handleNBA(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const key = env.SPORTSDATA_NBA_API_KEY || env.SPORTRADAR_NBA_API_KEY;
  if (!key) {
    return error(notConfigured('NBA provider not configured'));
  }
  if (!env.SPORTSDATA_NBA_API_KEY) {
    return error(notConfigured('Sportradar integration not yet implemented'));
  }

  const ip = req.headers.get('cf-connecting-ip') ?? 'anonymous';
  const limited = await enforceRateLimit(env, `nba:${ip}`, resolveRateLimit(env));
  if (limited) {
    return limited;
  }

  const url = new URL(req.url);
  const path = url.pathname.replace('/v1/basketball', '');

  try {
    if (path === '/standings') {
      const season = url.searchParams.get('season') ?? String(new Date().getFullYear());
      const data = await fetchJson<unknown>(`${SPORTS_DATA_BASE}/Standings/${season}?key=${env.SPORTSDATA_NBA_API_KEY}`);
      return json(data);
    }

    if (path === '/schedule') {
      const date = url.searchParams.get('date');
      if (!date) {
        return error(badRequest('date is required (YYYY-MM-DD)'));
      }
      const data = await fetchJson<unknown>(
        `${SPORTS_DATA_BASE}/GamesByDate/${encodeURIComponent(date)}?key=${env.SPORTSDATA_NBA_API_KEY}`,
      );
      return json(data);
    }

    return error(badRequest('NBA route unsupported'));
  } catch (err) {
    const status = err instanceof Error ? Number.parseInt(err.message, 10) : 502;
    return error(upstreamError(Number.isNaN(status) ? 502 : status, 'NBA upstream error'));
  }
}
