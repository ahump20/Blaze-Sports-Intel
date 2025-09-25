import { handleMLB } from './providers/mlb.statsapi.js';
import { handleNFL } from './providers/nfl.sportsdataio.js';
import { handleNBA } from './providers/nba.sportsdataio.js';
import { handleTrack } from './providers/track.provider.stub.js';
import { json, notFound } from './lib/http.js';
import type { Env } from './index.js';

type RouterHandler = (req: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;

const trimTrailingSlash = (path: string): string => path.replace(/\/$/, '');

export const router: { handle: RouterHandler } = {
  async handle(req, env, ctx) {
    const url = new URL(req.url);
    const pathname = trimTrailingSlash(url.pathname);

    if (pathname === '' || pathname === '/health') {
      return json({ ok: true, ts: new Date().toISOString() });
    }

    if (!pathname.startsWith('/v1')) {
      return notFound('Use /v1');
    }

    if (pathname.startsWith('/v1/baseball')) {
      return handleMLB(req, env, ctx);
    }
    if (pathname.startsWith('/v1/football')) {
      return handleNFL(req, env, ctx);
    }
    if (pathname.startsWith('/v1/basketball')) {
      return handleNBA(req, env, ctx);
    }
    if (pathname.startsWith('/v1/track')) {
      return handleTrack(req, env, ctx);
    }

    return notFound('Route not found');
  },
};
