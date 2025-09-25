import { describe, expect, it, vi } from 'vitest';

import { LiveSportsIntelError, LiveSportsIntelFetcher } from '../liveSportsIntelFetcher';

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <title>Blaze Baseball Intelligence</title>
    <meta name="description" content="Live MLB analysis for Blaze Intelligence." />
    <meta name="keywords" content="baseball, analytics, cardinals" />
    <meta property="og:title" content="Blaze Baseball Intelligence" />
    <meta property="og:description" content="Live MLB trends" />
    <link rel="canonical" href="https://insights.blazesportsintel.com/live-baseball" />
    <meta property="article:modified_time" content="2024-08-30T12:00:00Z" />
  </head>
  <body>
    <main>
      <h1 id="overview">MLB Decision Room</h1>
      <p>The Cardinals are pacing the division with a 0.612 win rate over the last 30 games.</p>
      <p>Blaze Intelligence surfaces pitch-level data refreshed every 15 minutes.</p>
      <h2 id="trends">Performance Trends</h2>
      <p>Slugging percentage climbed 8% against left-handed pitching.</p>
      <ul>
        <li>Starting rotation holds opponents to 2.3 runs per game.</li>
      </ul>
      <a href="/live-baseball">Internal Link</a>
      <a href="https://www.mlb.com">External MLB</a>
    </main>
    <script type="application/ld+json">{
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      "name": "Blaze Intelligence Cardinals Tracker",
      "sport": "Baseball"
    }</script>
  </body>
</html>`;

function createFetchMock(html = SAMPLE_HTML) {
  return vi.fn(async () =>
    new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }),
  );
}

describe('LiveSportsIntelFetcher', () => {
  it('parses Blaze Intelligence domain pages into actionable intel', async () => {
    const fetchMock = createFetchMock();
    const fetcher = new LiveSportsIntelFetcher({ fetchImpl: fetchMock, cacheTtlMs: 1000 });

    const result = await fetcher.fetchIntel({ target: 'insights.blazesportsintel.com', path: '/live-baseball' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.metadata.title).toBe('Blaze Baseball Intelligence');
    expect(result.metadata.description).toContain('Live MLB analysis');
    expect(result.metadata.canonicalUrl).toBe('https://insights.blazesportsintel.com/live-baseball');
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.metrics.internalLinkCount).toBeGreaterThanOrEqual(1);
    expect(result.metrics.externalLinkCount).toBeGreaterThanOrEqual(1);
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.insights.length).toBeGreaterThan(0);
    expect(result.fragments[0]).toContain('Cardinals');
    expect(result.cache.hit).toBe(false);
    expect(result.sources).toEqual(['https://insights.blazesportsintel.com/live-baseball']);
    expect(result.structuredData).toBeDefined();
    expect(result.structuredData?.length).toBe(1);
  });

  it('reuses cached entries for repeat requests', async () => {
    const fetchMock = createFetchMock();
    const fetcher = new LiveSportsIntelFetcher({ fetchImpl: fetchMock, cacheTtlMs: 60_000 });

    await fetcher.fetchIntel({ target: 'analytics.blazesportsintel.com/football-dashboard' });
    const second = await fetcher.fetchIntel({ target: 'analytics.blazesportsintel.com/football-dashboard' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second.cache.hit).toBe(true);
  });

  it('blocks unsupported domains before making network requests', async () => {
    const fetchMock = vi.fn();
    const fetcher = new LiveSportsIntelFetcher({ fetchImpl: fetchMock });

    await expect(fetcher.fetchIntel({ target: 'https://example.com' })).rejects.toMatchObject({
      code: 'DOMAIN_NOT_ALLOWED',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects unsupported protocols', async () => {
    const fetcher = new LiveSportsIntelFetcher({ fetchImpl: vi.fn() });

    await expect(fetcher.fetchIntel({ target: 'ftp://insights.blazesportsintel.com' })).rejects.toBeInstanceOf(
      LiveSportsIntelError,
    );
  });
});
