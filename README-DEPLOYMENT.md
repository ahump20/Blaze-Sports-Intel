# 🚀 Blaze Intelligence Deployment Guide

This guide explains how to deploy the enhanced Blaze Intelligence platform across multiple platforms: Vercel, AWS WebSocket, and GitHub Pages.

## 🏗️ Architecture Overview

- **Vercel**: Hosts the main Node.js application and API endpoints
- **AWS WebSocket**: Provides real-time data streaming via API Gateway + Lambda
- **GitHub Pages**: Serves static frontend assets and documentation

## 📋 Prerequisites

### Required Accounts & Services
1. **Vercel Account** with CLI access
2. **AWS Account** with programmatic access
3. **GitHub Repository** with Pages enabled
4. **Domain** (optional - for custom domain setup)

### Required Secrets
Configure these in your GitHub repository secrets:

```bash
# Vercel Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# AWS Deployment
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Application Environment Variables (for Vercel)
DATABASE_URL=your-postgresql-connection-string
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

## 🚀 Deployment Process

### 1. Automatic Deployment (Recommended)

The platform automatically deploys when you push to the `main` branch:

```bash
git add .
git commit -m "Deploy enhanced platform"
git push origin main
```

This triggers the GitHub Actions workflow that:
1. Builds production assets
2. Deploys to Vercel (API + Backend)
3. Deploys to GitHub Pages (Frontend)
4. Deploys WebSocket to AWS

### 2. Manual Deployment

#### Deploy to Vercel
```bash
npm run deploy:vercel
```

#### Deploy to GitHub Pages
```bash
npm run deploy:github
```

#### Deploy AWS WebSocket
```bash
npm run deploy:aws
```

## 🌐 Platform-Specific Configuration

### Vercel Configuration

The `vercel.json` file configures:
- Node.js runtime for the backend
- Static file serving for frontend assets
- Environment variable mapping
- Route handling for API endpoints

Key routes:
- `/api/*` → Node.js backend
- `/enhanced-platform.html` → Enhanced platform page
- Static assets served from `/public`

### AWS WebSocket Configuration

The CloudFormation template (`aws/websocket-template.yml`) creates:
- API Gateway WebSocket API
- Lambda function for message handling
- IAM roles and permissions
- CloudWatch logging

Supported WebSocket routes:
- `$connect` - Client connection
- `$disconnect` - Client disconnection  
- `subscribe` - Subscribe to data streams
- `ping` - Health check

### GitHub Pages Configuration

Static assets are deployed to the `docs/` directory with:
- Custom domain via `CNAME`
- Jekyll configuration via `_config.yml`
- SEO optimization with sitemap and robots.txt

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Vercel Environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
AWS_WEBSOCKET_ENDPOINT=wss://api-id.execute-api.region.amazonaws.com/production

# Build Configuration
VERCEL_ENV=production
AWS_REGION=us-east-1
```

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| WebSocket | Local (ws://localhost:5000) | AWS (wss://api-gateway-url) |
| API | Local (http://localhost:5000/api) | Vercel (https://app.vercel.app/api) |
| Database | Local PostgreSQL | Vercel Postgres |
| Static Assets | Local files | GitHub Pages CDN |

## 🎯 Post-Deployment Configuration

### 1. Update Domain DNS

Point your custom domain to:
- **A Record**: GitHub Pages IP (for root domain)
- **CNAME**: `username.github.io` (for www subdomain)

### 2. Configure SSL/TLS

- Vercel: Automatic SSL certificates
- GitHub Pages: Automatic SSL with custom domains
- AWS: SSL termination at API Gateway

### 3. Update WebSocket Endpoints

After AWS deployment, update the WebSocket endpoint in your frontend files:

```javascript
// Replace in enhanced-platform.html and other files
const wsUrl = 'wss://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/production';
```

## 📊 Monitoring & Analytics

### Vercel Analytics
- Function execution logs
- Performance metrics
- Error tracking

### AWS CloudWatch
- WebSocket connection metrics
- Lambda function logs
- API Gateway access logs

### GitHub Pages
- Traffic analytics via GitHub Insights
- Build status monitoring

## 🔍 Troubleshooting

### Common Issues

1. **Vercel Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Review build logs in Vercel dashboard

2. **WebSocket Connection Issues**
   - Verify AWS credentials
   - Check CloudFormation stack status
   - Review Lambda function logs

3. **GitHub Pages 404 Errors**
   - Ensure `docs/` directory exists
   - Check CNAME configuration
   - Verify repository settings

### Debug Commands

```bash
# Check Vercel deployment status
vercel ls

# Check AWS WebSocket stack
aws cloudformation describe-stacks --stack-name blaze-intelligence-websocket

# Test WebSocket connection
wscat -c wss://your-api-id.execute-api.us-east-1.amazonaws.com/production
```

## 🚀 Performance Optimization

### Vercel Optimizations
- Function bundling and tree-shaking
- Edge caching for static assets
- Gzip compression enabled

### AWS Optimizations
- Lambda cold start mitigation
- Connection pooling for databases
- CloudFront CDN integration (optional)

### GitHub Pages Optimizations
- Asset minification and compression
- Progressive web app features
- Optimized image delivery

## 📈 Scaling Considerations

### Traffic Growth
- Vercel: Automatic scaling with usage-based pricing
- AWS: Lambda concurrency limits and API Gateway throttling
- GitHub Pages: Built-in CDN scaling

### Database Scaling
- Connection pooling in production
- Read replicas for analytics queries
- Caching layer for frequently accessed data

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to the repository
2. **API Rate Limiting**: Implemented via express-rate-limit
3. **CORS Configuration**: Restrictive CORS policies in production
4. **Input Validation**: Server-side validation for all inputs
5. **HTTPS Only**: Force HTTPS redirects across all platforms

## 📞 Support

For deployment issues:
1. Check the GitHub Actions logs
2. Review platform-specific dashboards
3. Consult the troubleshooting section above
4. Open an issue in the repository

---

**Deployment Status**: ✅ Ready for production deployment across all platforms