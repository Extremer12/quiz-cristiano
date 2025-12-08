# Vercel Deployment Guide

## Current Status
⚠️ Vercel deployment workflow is temporarily disabled

## To Re-enable Vercel Deployment

### 1. Create a New Vercel Project
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (run from project root)
vercel link
```

### 2. Get Your Project IDs
After linking, you'll find these in `.vercel/project.json`:
- `orgId` → This is your `VERCEL_ORG_ID`
- `projectId` → This is your `VERCEL_PROJECT_ID`

### 3. Get Your Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy the token value

### 4. Configure GitHub Secrets
Go to your repository settings → Secrets and variables → Actions

Add these secrets:
- `VERCEL_TOKEN` - Your Vercel token
- `VERCEL_ORG_ID` - From `.vercel/project.json`
- `VERCEL_PROJECT_ID` - From `.vercel/project.json`

### 5. Re-enable the Workflow
Uncomment the content in `.github/workflows/deploy.yml`

## Manual Deployment (Alternative)
If you prefer manual deployments:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Current Configuration
The project is configured with:
- PayPal API integration
- Firebase backend
- Static site hosting
- API routes for payments

See `vercel.json` for full configuration.
