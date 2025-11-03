# GitHub Actions Secrets Setup

This document outlines the required secrets for the CI/CD pipeline to function properly.

## Required Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions to add these secrets.

### Deployment Secrets

#### Railway (Frontend Deployment)
- `RAILWAY_TOKEN` - Railway API token for deployment
- `RAILWAY_PROJECT_ID` - Railway project ID for staging
- `RAILWAY_FRONTEND_URL` - Staging frontend URL
- `RAILWAY_PROD_TOKEN` - Railway API token for production
- `RAILWAY_PROD_PROJECT_ID` - Railway production project ID  
- `RAILWAY_PROD_FRONTEND_URL` - Production frontend URL

#### Render (Backend & Zoho Mock Deployment)
- `RENDER_API_KEY` - Render API key for deployments
- `RENDER_SERVICE_ID` - Backend service ID on Render (staging)
- `RENDER_BACKEND_URL` - Backend staging URL
- `RENDER_ZOHO_SERVICE_ID` - Zoho mock service ID on Render
- `RENDER_ZOHO_URL` - Zoho mock staging URL
- `RENDER_PROD_API_KEY` - Production Render API key
- `RENDER_PROD_SERVICE_ID` - Backend production service ID
- `RENDER_PROD_BACKEND_URL` - Backend production URL

### Notification Secrets (Optional)
- `SLACK_WEBHOOK_URL` - Slack webhook for deployment notifications

### Code Quality Secrets (Optional)
- `SONAR_TOKEN` - SonarCloud token for code quality analysis

## How to Get These Values

### Railway Secrets
1. Login to Railway dashboard
2. Go to Account Settings → Tokens
3. Generate a new API token
4. Copy project ID from your project URL

### Render Secrets  
1. Login to Render dashboard
2. Go to Account Settings → API Keys
3. Generate a new API key
4. Get service IDs from service dashboard URLs

### Slack Webhook (Optional)
1. Go to your Slack workspace
2. Create a new Slack app
3. Add incoming webhook integration
4. Copy the webhook URL

### SonarCloud (Optional)
1. Login to SonarCloud
2. Go to My Account → Security
3. Generate a new token

## Environment Setup

The workflows are configured to work with:
- **Staging**: Automatic deployment on `main` branch push
- **Production**: Manual deployment via GitHub Actions dispatch

## Security Notes

- Never commit secrets to the repository
- Use GitHub's encrypted secrets feature
- Rotate secrets periodically
- Use different secrets for staging and production
- Limit secret scope to minimum required permissions