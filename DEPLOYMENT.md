# Smart Service Hub - Deployment Guide

Complete deployment guide for the Smart Service Hub project with all microservices.

## Project Architecture

```
Smart Service Hub
├── Frontend (React + Vite) - Port 5173
├── Backend API (Node.js) - Port 3001  
├── AI Microservice (Flask) - Port 5001
└── Zoho Mock API (Node.js) - Port 5002
```

## Deployment Options

### 1. Railway (Recommended) 🚂

**Benefits:**
- $5 free credits monthly
- No sleeping
- Automatic HTTPS
- GitHub integration
- Multiple service support

**Steps:**
1. Push to GitHub
2. Connect Railway to your repo
3. Deploy each service separately:
   - Backend: `./backend`
   - AI Service: `./ai-microservice` 
   - Zoho Mock: `./zoho-mock`
   - Frontend: `./` (root)

**Environment Variables to Set:**

**Backend Service:**
```
NODE_ENV=production
PORT=3001
AI_SERVICE_URL=https://your-ai-service.railway.app
ZOHO_API_URL=https://your-zoho-mock.railway.app
ZOHO_API_KEY=your-secure-api-key
```

**AI Service:**
```
FLASK_ENV=production
PORT=5001
```

**Zoho Mock:**
```
NODE_ENV=production
PORT=5002
ZOHO_API_KEY=your-secure-api-key
```

**Frontend:**
```
VITE_API_URL=https://your-backend.railway.app
VITE_AI_SERVICE_URL=https://your-ai-service.railway.app
```

### 2. Render 🎨

**Benefits:**
- 750 hours free
- Easy deployment
- Custom domains

**Limitations:**
- Services sleep after 15min inactivity
- Slower cold starts

### 3. Docker Compose (Local/VPS) 🐳

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Service URLs After Deployment

### Local Development
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- AI Service: http://localhost:5001
- Zoho Mock: http://localhost:5002

### Production (Railway)
- Frontend: https://smart-service-hub.railway.app
- Backend: https://smart-hub-backend.railway.app
- AI Service: https://smart-hub-ai.railway.app
- Zoho Mock: https://smart-hub-zoho.railway.app

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All environment variables configured
- [ ] Database paths updated for production
- [ ] CORS settings configured for production URLs
- [ ] All dependencies included in package.json/requirements.txt

### ✅ GitHub Repository
- [ ] All code committed and pushed
- [ ] .gitignore properly excludes sensitive files
- [ ] README.md updated with deployment info

### ✅ Service Configuration
- [ ] Backend connects to AI service URL
- [ ] Backend connects to Zoho mock URL
- [ ] Frontend points to backend API URL
- [ ] All health checks working

## Quick Deployment Commands

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Smart Service Hub full-stack application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-service-hub.git
git push -u origin main
```

### Railway CLI Deployment (Alternative)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

## Monitoring & Maintenance

### Health Checks
- Backend: `GET /health`
- AI Service: `GET /health` 
- Zoho Mock: `GET /health`

### Logs Access
```bash
# Docker Compose
docker-compose logs service-name

# Railway
# Use Railway dashboard or CLI
railway logs
```

### Database Backup
```bash
# Copy database from container
docker cp container_name:/app/database ./backup/
```

## Troubleshooting

### Common Issues

**Service Connection Errors:**
- Check environment variables match deployed URLs
- Verify all services are running
- Check CORS configuration

**Build Failures:**
- Ensure all dependencies in package.json
- Check Node.js/Python versions
- Review build logs

**Database Issues:**
- Verify database directory permissions
- Check volume mounts in Docker
- Ensure database initialization

### Debug Commands
```bash
# Check service status
curl https://your-service.railway.app/health

# Test API endpoints
curl -X POST https://your-backend.railway.app/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"...}'
```

## Production Optimizations

### Performance
- Enable gzip compression (nginx)
- Use CDN for static assets
- Database connection pooling
- Caching strategies

### Security
- Use environment variables for secrets
- Enable HTTPS only
- Implement rate limiting
- Regular security updates

### Scaling
- Horizontal scaling for high traffic
- Database replication
- Load balancing
- Monitoring and alerting

## Cost Optimization

### Railway Free Tier
- Monitor usage in dashboard
- Optimize resource usage
- Use sleep policies if acceptable

### Alternative Free Options
- Vercel (frontend only)
- Netlify (frontend only) 
- Heroku alternatives
- Free VPS providers

---

**Ready to Deploy!** 🚀

Choose your deployment platform and follow the specific steps above. All services are containerized and ready for production deployment.