# Deployment Guide - Quiz Cristiano

## 🚀 Quick Deployment

### Prerequisites

- Node.js 18+ installed
- Vercel account
- PayPal Developer account
- Firebase project (optional)

### 1. Environment Setup

```bash
# Clone and setup
git clone your-repo
cd quiz-cristiano

# Setup environment variables
node scripts/setup-env.js

# Or manually copy and edit
cp .env.example .env
```

### 2. Automated Deployment

```bash
# Run deployment script
node scripts/deploy.js

# Or manual Vercel deployment
npm install -g vercel
vercel --prod
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] PayPal credentials added
- [ ] Tests passing
- [ ] Security rules updated
- [ ] Monitoring configured

### Vercel Configuration

- [ ] Project linked to Vercel
- [ ] Environment variables set in dashboard
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled

### PayPal Configuration

- [ ] Webhook URL updated to production domain
- [ ] Production credentials configured
- [ ] Webhook events enabled
- [ ] Return URLs updated

### Post-Deployment

- [ ] Health check endpoint working
- [ ] Payment flow tested
- [ ] Webhook processing verified
- [ ] Monitoring dashboard accessible

## 🔧 Configuration Files

### vercel.json

- API routes configuration
- Security headers
- Function timeouts and memory
- CORS settings

### firestore.rules

- User data protection
- Transaction security
- Payment history access
- Admin permissions

### .github/workflows/deploy.yml

- Automated CI/CD pipeline
- Testing before deployment
- Production deployment
- Health checks

## 🏥 Health Monitoring

### Health Check Endpoint

```
GET /api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "responseTime": "145ms",
  "checks": {
    "paypal": { "status": "healthy" },
    "firebase": { "status": "healthy" },
    "environment": { "status": "healthy" }
  }
}
```

### Monitoring Dashboard

Access at: `/monitoring/dashboard.html`

Tracks:

- Payment success rates
- API response times
- Error rates
- User activity
- Revenue metrics

## 🚨 Troubleshooting

### Common Issues

**Deployment fails**

- Check environment variables
- Verify API endpoints exist
- Review build logs

**PayPal integration not working**

- Verify client ID and secret
- Check webhook URL configuration
- Ensure HTTPS is enabled

**Webhook not receiving events**

- Confirm webhook URL is accessible
- Check PayPal webhook configuration
- Review webhook signature verification

### Debug Commands

```bash
# Check health
curl https://your-domain.com/api/health

# Test webhook locally
curl -X POST http://localhost:3000/api/paypal/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "event"}'

# View deployment logs
vercel logs your-deployment-url
```

## 🔐 Security Considerations

### Production Settings

```env
NODE_ENV=production
PAYPAL_ENVIRONMENT=production
FORCE_HTTPS=true
ENABLE_CORS_RESTRICTIONS=true
```

### Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Data Protection

- User data encrypted
- Payment info not stored
- Audit logs enabled
- Rate limiting active

## 📊 Performance Optimization

### Vercel Functions

- Webhook: 30s timeout, 1024MB memory
- Orders: 10s timeout, 512MB memory
- Capture: 15s timeout, 512MB memory

### Caching Strategy

- Static assets: 1 year
- API responses: No cache
- User data: Session cache

### Monitoring Metrics

- Payment success rate > 95%
- API response time < 2s
- Error rate < 1%
- Uptime > 99.9%
