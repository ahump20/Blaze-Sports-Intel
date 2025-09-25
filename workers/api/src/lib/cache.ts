const defaultCache = (): Cache => (caches as unknown as { default: Cache }).default;

export const cacheKey = (prefix: string, url: string): string => `${prefix}:${new URL(url).toString()}`;

export async function cachedFetch(request: Request, ttlSeconds: number): Promise<Response> {
  const cache = defaultCache();
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const upstream = await fetch(request);
  if (!upstream.ok) {
    return upstream;
  }

  const response = new Response(upstream.body, upstream);
  response.headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);
  await cache.put(request, response.clone());
  return response;
}
