function getDefaultCache(): Cache {
  const defaultCacheObj = (caches as { default: unknown }).default;
  if (
    typeof caches === "object" &&
    caches !== null &&
    "default" in caches &&
    typeof defaultCacheObj === "object" &&
    defaultCacheObj !== null
  ) {
    return defaultCacheObj as Cache;
  }
  throw new Error("Cloudflare default cache is not available in this environment.");
}

const defaultCache = (): Cache => getDefaultCache();
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
