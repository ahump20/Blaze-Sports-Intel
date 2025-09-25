import { load } from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import { z } from 'zod';

const BLAZE_DOMAIN_PATTERN = /(^|\.)blazesportsintel\.com$/i;

export type LiveSportsIntelErrorCode =
  | 'INVALID_TARGET'
  | 'DOMAIN_NOT_ALLOWED'
  | 'NETWORK_ERROR'
  | 'UNSUPPORTED_CONTENT';

export class LiveSportsIntelError extends Error {
  public readonly code: LiveSportsIntelErrorCode;
  public readonly details?: unknown;

  constructor(code: LiveSportsIntelErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'LiveSportsIntelError';
    this.code = code;
    this.details = options?.cause;
  }
}

const fetchIntelInputSchema = z.object({
  target: z.string().min(1, 'target is required'),
  path: z.string().optional(),
  includeLinks: z.boolean().optional(),
  includeStructuredData: z.boolean().optional(),
});

export type FetchIntelInput = z.infer<typeof fetchIntelInputSchema>;

export interface LinkInfo {
  href: string;
  text: string;
  isSecure: boolean;
}

export interface SectionSummary {
  heading: string;
  level: 'h1' | 'h2' | 'h3';
  summary: string;
  anchor?: string;
}

export interface PageMetadata {
  title: string | null;
  description: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  openGraph: Record<string, string>;
  lastModified: string | null;
  language: string | null;
}

export interface PageMetrics {
  wordCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  structuredDataCount: number;
}

export interface CacheMetadata {
  hit: boolean;
  cachedAt: string;
  expiresAt: string;
}

export interface DomainIntel {
  requestedUrl: string;
  fetchedAt: string;
  metadata: PageMetadata;
  metrics: PageMetrics;
  summary: string;
  sections: SectionSummary[];
  insights: string[];
  fragments: string[];
  sources: string[];
  links?: {
    internal: LinkInfo[];
    external: LinkInfo[];
  };
  structuredData?: unknown[];
  cache: CacheMetadata;
}

interface DomainIntelBase extends Omit<DomainIntel, 'cache'> {}

interface CacheEntry {
  timestamp: number;
  intel: DomainIntelBase;
  cache: CacheMetadata;
}

export interface LiveSportsIntelFetcherOptions {
  cacheTtlMs?: number;
  requestTimeoutMs?: number;
  fetchImpl?: typeof fetch;
  maxFragments?: number;
}

const DEFAULT_OPTIONS: Required<Omit<LiveSportsIntelFetcherOptions, 'fetchImpl'>> = {
  cacheTtlMs: 5 * 60_000,
  requestTimeoutMs: 10_000,
  maxFragments: 6,
};

function toAbsoluteUrl(base: URL, value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, base).toString();
  } catch (error) {
    return null;
  }
}

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function extractMetadata($: CheerioAPI, url: URL): PageMetadata {
  const title = sanitizeText($('title').first().text() ?? '');
  const description = sanitizeText($('meta[name="description"]').attr('content') ?? '');
  const keywordsRaw = $('meta[name="keywords"]').attr('content') ?? '';
  const canonicalRaw = $('link[rel="canonical"]').attr('href') ?? '';
  const language = $('html').attr('lang') ?? null;
  const lastModified =
    $('meta[property="article:modified_time"]').attr('content') ??
    $('meta[name="last-modified"]').attr('content') ??
    null;

  const keywords = keywordsRaw
    .split(',')
    .map((item) => sanitizeText(item))
    .filter((item) => item.length > 0);

  const openGraphEntries: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, element) => {
    const property = $(element).attr('property');
    const content = $(element).attr('content');
    if (!property || !content) {
      return;
    }

    const key = property.replace(/^og:/, '');
    openGraphEntries[key] = sanitizeText(content);
  });

  return {
    title: title.length > 0 ? title : null,
    description: description.length > 0 ? description : null,
    keywords,
    canonicalUrl: toAbsoluteUrl(url, canonicalRaw),
    openGraph: openGraphEntries,
    lastModified,
    language,
  };
}

function extractFragments($: CheerioAPI, maxFragments: number): string[] {
  const fragments: string[] = [];
  $('main p, article p, body p').each((_, element) => {
    const text = sanitizeText($(element).text());
    if (text.length === 0) {
      return;
    }

    fragments.push(text);
    if (fragments.length >= maxFragments) {
      return false;
    }

    return undefined;
  });

  return fragments;
}

function extractSections($: CheerioAPI): SectionSummary[] {
  const sections: SectionSummary[] = [];
  $('h1, h2, h3').each((_, element) => {
    const tagName = element.tagName?.toLowerCase();
    if (tagName !== 'h1' && tagName !== 'h2' && tagName !== 'h3') {
      return;
    }

    const heading = sanitizeText($(element).text());
    if (heading.length === 0) {
      return;
    }

    const anchor = $(element).attr('id') ?? undefined;
    const summaryParts: string[] = [];
    let nextNode = $(element).next();

    while (nextNode.length > 0) {
      const nextTagName = nextNode[0]?.tagName?.toLowerCase();
      if (nextTagName === 'h1' || nextTagName === 'h2' || nextTagName === 'h3') {
        break;
      }

      if (nextNode.is('p') || nextNode.is('li')) {
        const text = sanitizeText(nextNode.text());
        if (text.length > 0) {
          summaryParts.push(text);
        }
      }

      if (summaryParts.join(' ').length > 360) {
        break;
      }

      nextNode = nextNode.next();
    }

    sections.push({
      heading,
      level: tagName,
      summary: summaryParts.join(' ').slice(0, 360),
      anchor,
    });
  });

  return sections.slice(0, 12);
}

function extractLinks($: CheerioAPI, baseUrl: URL): { internal: LinkInfo[]; external: LinkInfo[] } {
  const internal = new Map<string, LinkInfo>();
  const external = new Map<string, LinkInfo>();

  $('a[href]').each((_, element) => {
    const rawHref = $(element).attr('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.toLowerCase().startsWith('javascript:')) {
      return;
    }

    try {
      const resolved = new URL(rawHref, baseUrl);
      const text = sanitizeText($(element).text());
      const info: LinkInfo = {
        href: resolved.toString(),
        text,
        isSecure: resolved.protocol === 'https:',
      };

      if (BLAZE_DOMAIN_PATTERN.test(resolved.hostname)) {
        if (!internal.has(info.href)) {
          internal.set(info.href, info);
        }
      } else if (!external.has(info.href)) {
        external.set(info.href, info);
      }
    } catch (error) {
      // Ignore malformed URLs
    }
  });

  return {
    internal: Array.from(internal.values()).slice(0, 50),
    external: Array.from(external.values()).slice(0, 50),
  };
}

function extractStructuredData($: CheerioAPI): unknown[] {
  const structured: unknown[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).contents().text();
    const content = sanitizeText(raw ?? '');
    if (content.length === 0) {
      return;
    }

    try {
      const parsed = JSON.parse(content);
      structured.push(parsed);
    } catch (error) {
      // Ignore invalid JSON-LD blocks
    }
  });

  return structured.slice(0, 10);
}

function generateInsights(metadata: PageMetadata, sections: SectionSummary[], fragments: string[]): string[] {
  const insights = new Set<string>();

  if (metadata.title) {
    insights.add(`Primary focus: ${metadata.title}`);
  }

  const interestingFragments = fragments.filter((fragment) =>
    /(score|points|ranking|record|win|loss|trend|analytics|performance|%|\d)/i.test(fragment),
  );

  for (const fragment of interestingFragments.slice(0, 3)) {
    const trimmed = fragment.length > 220 ? `${fragment.slice(0, 217)}...` : fragment;
    insights.add(trimmed);
  }

  for (const section of sections.slice(0, 2)) {
    if (section.summary.length > 0) {
      insights.add(`${section.heading}: ${section.summary}`);
    }
  }

  if (insights.size === 0 && fragments.length > 0) {
    insights.add(fragments[0]);
  }

  return Array.from(insights).slice(0, 5);
}

function countWords(text: string): number {
  if (!text) {
    return 0;
  }

  return text
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0).length;
}

export class LiveSportsIntelFetcher {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly options: Required<Omit<LiveSportsIntelFetcherOptions, 'fetchImpl'>>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: LiveSportsIntelFetcherOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      cacheTtlMs: options.cacheTtlMs ?? DEFAULT_OPTIONS.cacheTtlMs,
      requestTimeoutMs: options.requestTimeoutMs ?? DEFAULT_OPTIONS.requestTimeoutMs,
      maxFragments: options.maxFragments ?? DEFAULT_OPTIONS.maxFragments,
    };

    const nativeFetch = typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null;

    const fallbackFetch: typeof fetch = async (
      input: Parameters<typeof fetch>[0],
      init?: Parameters<typeof fetch>[1],
    ) => {
      if (!nativeFetch) {
        throw new LiveSportsIntelError('NETWORK_ERROR', 'Global fetch is not available');
      }

      return nativeFetch(input, init);
    };

    this.fetchImpl = options.fetchImpl ?? fallbackFetch;
  }

  async fetchIntel(rawInput: FetchIntelInput): Promise<DomainIntel> {
    const input = fetchIntelInputSchema.parse(rawInput);
    const url = this.buildUrl(input.target, input.path);
    const includeLinks = input.includeLinks ?? true;
    const includeStructuredData = input.includeStructuredData ?? true;
    const cacheKey = this.buildCacheKey(url, includeLinks, includeStructuredData);
    const now = Date.now();

    const cached = this.cache.get(cacheKey);
    if (cached && now - cached.timestamp < this.options.cacheTtlMs) {
      return {
        ...cached.intel,
        cache: {
          ...cached.cache,
          hit: true,
        },
      };
    }

    const html = await this.downloadHtml(url);
    const baseIntel = this.transformHtml(html, url, { includeLinks, includeStructuredData });
    const expiresAt = new Date(now + this.options.cacheTtlMs).toISOString();
    const cacheMeta: CacheMetadata = {
      hit: false,
      cachedAt: baseIntel.fetchedAt,
      expiresAt,
    };

    const enriched: DomainIntel = {
      ...baseIntel,
      cache: cacheMeta,
    };

    this.cache.set(cacheKey, { timestamp: now, intel: baseIntel, cache: cacheMeta });
    return enriched;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private buildCacheKey(url: URL, includeLinks: boolean, includeStructuredData: boolean): string {
    return `${url.toString()}|links=${includeLinks}|structured=${includeStructuredData}`;
  }

  private buildUrl(target: string, path?: string): URL {
    const trimmedTarget = target.trim();
    let url: URL;

    try {
      url = trimmedTarget.includes('://') ? new URL(trimmedTarget) : new URL(`https://${trimmedTarget}`);
    } catch (error) {
      throw new LiveSportsIntelError('INVALID_TARGET', 'Invalid target domain or URL', { cause: error });
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new LiveSportsIntelError('INVALID_TARGET', 'Only HTTP and HTTPS protocols are supported.');
    }

    if (path) {
      const normalizedPath = path.startsWith('http') ? path : path.startsWith('/') ? path : `/${path}`;
      url = new URL(normalizedPath, url.origin);
    }

    this.assertAllowedHost(url.hostname);
    url.hash = '';
    return url;
  }

  private assertAllowedHost(host: string): void {
    if (!BLAZE_DOMAIN_PATTERN.test(host)) {
      throw new LiveSportsIntelError(
        'DOMAIN_NOT_ALLOWED',
        'Only blazesportsintel.com domains and subdomains are supported by this API.',
      );
    }
  }

  private async downloadHtml(url: URL): Promise<string> {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    const timeout = controller
      ? setTimeout(() => {
          controller.abort();
        }, this.options.requestTimeoutMs)
      : undefined;

    try {
      const response = await this.fetchImpl(url.toString(), {
        method: 'GET',
        signal: controller?.signal,
        headers: {
          'User-Agent': 'BlazeSportsIntelLive/1.0 (+https://blazesportsintel.com)',
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new LiveSportsIntelError(
          'NETWORK_ERROR',
          `Failed to load ${url.toString()} - ${response.status} ${response.statusText}`,
        );
      }

      const contentType = response.headers.get('content-type');
      if (
        contentType &&
        !contentType.includes('text/html') &&
        !contentType.includes('application/xhtml+xml')
      ) {
        throw new LiveSportsIntelError(
          'UNSUPPORTED_CONTENT',
          `Unsupported content type for ${url.toString()}: ${contentType}`,
        );
      }

      const body = await response.text();
      if (body.trim().length === 0) {
        throw new LiveSportsIntelError('UNSUPPORTED_CONTENT', 'Received empty response body');
      }

      return body;
    } catch (error) {
      if (error instanceof LiveSportsIntelError) {
        throw error;
      }

      if ((error as Error)?.name === 'AbortError') {
        throw new LiveSportsIntelError('NETWORK_ERROR', `Request to ${url.toString()} timed out`, { cause: error });
      }

      throw new LiveSportsIntelError('NETWORK_ERROR', `Unable to load ${url.toString()}`, { cause: error });
    } finally {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    }
  }

  private transformHtml(
    html: string,
    url: URL,
    options: { includeLinks: boolean; includeStructuredData: boolean },
  ): DomainIntelBase {
    const $ = load(html);
    const metadata = extractMetadata($, url);
    const fragments = extractFragments($, this.options.maxFragments);
    const sections = extractSections($);
    const links = options.includeLinks ? extractLinks($, url) : { internal: [], external: [] };
    const structuredData = options.includeStructuredData ? extractStructuredData($) : [];
    const allText = fragments.join(' ');

    const metrics: PageMetrics = {
      wordCount: countWords(allText),
      internalLinkCount: links.internal.length,
      externalLinkCount: links.external.length,
      structuredDataCount: structuredData.length,
    };

    const summarySource = fragments.slice(0, 2).join(' ');
    const summary = summarySource.length > 640 ? `${summarySource.slice(0, 637)}...` : summarySource;
    const insights = generateInsights(metadata, sections, fragments);

    const intel: DomainIntelBase = {
      requestedUrl: url.toString(),
      fetchedAt: new Date().toISOString(),
      metadata,
      metrics,
      summary,
      sections,
      insights,
      fragments,
      sources: [url.toString()],
    };

    if (options.includeLinks) {
      intel.links = links;
    }

    if (options.includeStructuredData && structuredData.length > 0) {
      intel.structuredData = structuredData;
    }

    return intel;
  }
}
