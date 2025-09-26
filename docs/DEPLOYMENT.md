# 🚀 Deployment Guide for blazesportsintel.com

## Prerequisites

1. **Cloudflare Account** with Pages enabled
2. **Wrangler CLI** installed globally
3. **Domain Configuration** for blazesportsintel.com
4. **Environment Variables** properly configured

## Quick Deployment

### Production Deployment
```bash
# Build and deploy to production
npm run deploy:production
```

### Staging Deployment  
```bash
# Build and deploy to staging
npm run deploy:staging
```

## Manual Deployment Steps

### 1. Build the Project
```bash
npm run build
```

### 2. Deploy with Wrangler
```bash
# Production
wrangler pages publish dist --project-name=blaze-sports-intel --env production

# Staging
wrangler pages publish dist --project-name=blaze-sports-intel-staging
```

### 3. Verify Deployment
- Production: https://blazesportsintel.com
- Staging: https://staging.blazesportsintel.com

## Environment Configuration

### Required Environment Variables
```
NODE_VERSION=18
API_BASE_URL=https://blazesportsintel.com
ENVIRONMENT=production
CACHE_TTL=300
MAX_API_CALLS=1000
```

### Cloudflare KV Namespaces
- **BLAZE_CACHE**: `blaze_analytics_cache_prod`
- **Preview**: `blaze_analytics_cache_dev`

### R2 Storage Buckets
- **SPORTS_DATA**: `blaze-sports-data`

## DNS Configuration

### Required DNS Records
```
Type    Name                    Content
CNAME   blazesportsintel.com    blaze-sports-intel.pages.dev
CNAME   www                     blazesportsintel.com
CNAME   staging                 blaze-sports-intel-staging.pages.dev
```

### SSL Configuration
- SSL/TLS encryption mode: **Full (strict)**
- Always Use HTTPS: **On**
- HSTS: **Enabled**

## Performance Optimization

### Cloudflare Settings
- **Browser Cache TTL**: 4 hours
- **Edge Cache TTL**: 8 hours
- **Minification**: HTML, CSS, JavaScript
- **Brotli Compression**: Enabled
- **HTTP/2**: Enabled
- **HTTP/3**: Enabled

### Build Configuration
- **Bundle Analysis**: Use `npm run build -- --analyze`
- **Code Splitting**: Automatic via Vite
- **Tree Shaking**: Enabled
- **Minification**: Production builds only

## Security Headers

Configured in `_headers` file:
- Content Security Policy
- HSTS headers
- XSS Protection
- Frame Options
- CORS for APIs

## Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Monitored via Cloudflare Analytics
- **Real User Monitoring**: Enabled
- **Performance Insights**: Available in Cloudflare dashboard

### Error Tracking
- **JavaScript Errors**: Captured via Cloudflare
- **404 Errors**: Logged and monitored
- **API Errors**: Custom error handling

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Deployment Failures**
```bash
# Check Wrangler authentication
wrangler auth list

# Verify project settings
wrangler pages project list
```

**DNS Issues**
- Verify CNAME records point to correct Pages domain
- Check SSL/TLS settings in Cloudflare
- Clear DNS cache: `dig blazesportsintel.com`

### Support Resources
- **Cloudflare Pages**: https://pages.cloudflare.com
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **DNS Checker**: https://dnschecker.org/

## Rollback Procedure

### Emergency Rollback
```bash
# List deployments
wrangler pages deployment list --project-name=blaze-sports-intel

# Rollback to specific deployment
wrangler pages deployment rollback [DEPLOYMENT_ID] --project-name=blaze-sports-intel
```

### Gradual Rollback
1. Deploy to staging first
2. Test thoroughly
3. Deploy to production
4. Monitor for issues

---

**🎯 Championship-Level Deployment Standards**  
*Built with Austin's Four Pillars Framework*