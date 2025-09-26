# Cloudflare Deployment Inventory

## Primary Deployments

| Deployment | Status | Purpose | Key Issues / Notes | Related Config |
| --- | --- | --- | --- | --- |
| blazesportsintel.com | ⚠️ Partially functional | Canonical Blaze Intelligence domain | JavaScript bundles fail to load; parity issues with Pages mirror | `wrangler-blazesportsintel.toml`, `wrangler-championship.toml` |
| blaze-intelligence.pages.dev | ✅ Fully functional | Main production platform | Complete analytics experience live | `wrangler.toml` |

## Active Branch Deployments

| Deployment | Status | Purpose | Notes |
| --- | --- | --- | --- |
| blaze-intelligence-lsl.pages.dev | ✅ HTTP 200 | LSL-specific branch experience | Referenced from main Wrangler config |
| blazesportsintel.pages.dev | ✅ Functional with JS caveats | Pages mirror for branded domain | Shares JS loading issues with custom domain |

## Commit-Specific Deployments

| Deployment | Status | Purpose | Notes |
| --- | --- | --- | --- |
| e433017a.blaze-intelligence.pages.dev | ✅ Active | Enhanced v3.0.0 snapshot | Full HTML delivered |
| 56fd59ef.blaze-intelligence.pages.dev | ⚠️ HTTP 308 | Production v2.1.0 | Permanently redirects; safe to retire |
| a6613ab7.blaze-intelligence.pages.dev | ❓ Unverified | Preview environment | Needs validation |

## Worker Footprint

- `blazesportsintel-championship`: Championship team analytics API worker
- `LeagueScope Production`: League-wide analytics worker
- `Live Data Workers`: Real-time ingest and processing workers
- `API Workers`: Authentication, contact, reporting, storage microservices

## Cloudflare Storage & Data Services

### R2 Buckets (8)
- blaze-intelligence-videos
- blaze-media-assets
- blaze-coaching
- blaze-sports-data-lake
- blaze-youth-data
- blaze-vision-videos
- blaze-reports
- blaze-intelligence-data

### KV Namespaces
- `ANALYTICS_CACHE` (`championship_analytics_cache`)
- `CACHE_KV`

### D1 Databases
- `blaze-intelligence-production`
- `blaze-intelligence`

## Key Findings

1. **blazesportsintel.com JavaScript failures** prevent the canonical domain from delivering the full experience.
2. **blaze-intelligence.pages.dev is the most reliable** deployment with full functionality and performance.
3. **Configuration sprawl**: 31+ Wrangler files create fragmentation and drift.
4. **Redundant Pages deployments** add maintenance overhead without clear value.

## Priority Recommendations

1. Restore JavaScript asset loading on blazesportsintel.com and validate parity with the Pages deployment.
2. Consolidate Wrangler configs into ≤5 maintained variants with shared includes.
3. Implement redirects from all `*.pages.dev` hosts to the canonical domain once parity is achieved.
4. Decommission deprecated commits (e.g., `56fd59ef`) after confirming no active consumers.

## Follow-Up Actions

- Add automated smoke checks covering JavaScript bundle availability for the canonical domain.
- Inventory and tag Workers, KV namespaces, R2 buckets, and D1 databases in Wrangler for lifecycle management.
- Document deployment ownership and escalation paths to reduce configuration drift.
