# CI/CD Pipeline Documentation

## Overview

Smart Service Hub implements a comprehensive CI/CD pipeline using GitHub Actions that provides:
- **Continuous Integration (CI)** - Automated testing, linting, security scanning
- **Continuous Deployment (CD)** - Automated deployment to staging and production
- **Docker Integration** - Containerized builds and multi-service testing
- **Security & Quality** - Vulnerability scanning and code quality checks

## Pipeline Structure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pull Request  │────│  CI Pipeline    │────│  Code Review    │
│   Push to Dev   │    │  Testing &      │    │  Approval       │
└─────────────────┘    │  Validation     │    └─────────────────┘
                       └─────────────────┘             │
┌─────────────────┐    ┌─────────────────┐             │
│  Push to Main   │────│  CD Pipeline    │◄────────────┘
│  Manual Deploy  │    │  Staging Deploy │
└─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Production    │
                       │   Manual Only   │
                       └─────────────────┘
```

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
- **Frontend Tests** - React tests, ESLint, build validation
- **Backend Tests** - Node.js tests, API validation  
- **AI Service Tests** - Python tests, ML model validation
- **Zoho Mock Tests** - Service integration testing
- **Integration Tests** - End-to-end service communication
- **Code Quality** - SonarCloud analysis, Trivy security scanning
- **Dependency Check** - npm audit, Python safety checks

**Features:**
- Parallel job execution for speed
- Coverage reporting with Codecov
- Security vulnerability detection
- Code quality metrics

### 2. CD Pipeline (`.github/workflows/cd.yml`)

**Triggers:**
- Push to `main` branch (automatic staging)
- Manual workflow dispatch (production)

**Environments:**
- **Staging** - Automatic deployment
- **Production** - Manual approval required

**Deployment Flow:**
```
Code Push → Build → Test → Deploy Staging → Health Check → ✅ Ready
     │
     └─→ Manual Trigger → Deploy Production → Health Check → 🚀 Live
```

**Services Deployed:**
- Frontend (Railway)
- Backend (Render) 
- AI Microservice (included in backend)
- Zoho Mock (Render)

### 3. Docker Pipeline (`.github/workflows/docker.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests
- Weekly scheduled builds (Monday 2 AM)

**Jobs:**
- **Docker Build** - Matrix build for all services
- **Integration Tests** - Docker Compose full stack testing
- **Security Scan** - Container vulnerability scanning

**Features:**
- Multi-service Docker builds
- Container registry publishing (GitHub Container Registry)
- Integration testing with real service communication
- Performance testing
- Security scanning with Trivy

## Service Architecture in CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Frontend      │    Backend      │    AI Service           │
│   (React/Vite)  │   (Node.js)     │    (Python/Flask)       │
│   Port: 5173    │   Port: 3001    │    Port: 5001           │
├─────────────────┼─────────────────┼─────────────────────────┤
│   Railway       │   Render        │    Embedded in Backend  │
│   Deployment    │   Deployment    │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
                         │
               ┌─────────────────┐
               │   Zoho Mock     │
               │   (Node.js)     │
               │   Port: 5002    │
               │   Render Deploy │
               └─────────────────┘
```

## Deployment Strategy

### Staging Environment
- **Automatic** deployment on `main` branch push
- **Purpose:** Integration testing, feature validation
- **URL:** Configured via secrets

### Production Environment  
- **Manual** deployment only
- **Approval:** Required through GitHub Environments
- **Purpose:** Live customer-facing application

### Rollback Strategy
- Automatic rollback trigger on deployment failure
- Manual rollback capability via GitHub Actions
- Previous version restoration

## Quality Gates

### Before Staging Deployment
✅ All unit tests pass  
✅ Integration tests pass  
✅ Security scans clean  
✅ Code quality meets standards  
✅ Docker builds successful  

### Before Production Deployment
✅ All staging checks pass  
✅ Manual approval granted  
✅ Staging environment validated  
✅ Health checks successful  

## Monitoring & Notifications

### Slack Integration
- Deployment status notifications
- Failure alerts with details
- Production deployment confirmations

### GitHub Integration
- PR status checks
- Security vulnerability reports
- Deployment status badges

## Performance Metrics

### Build Times
- CI Pipeline: ~8-12 minutes
- CD Pipeline: ~5-8 minutes  
- Docker Pipeline: ~10-15 minutes

### Success Rates
- Target: >95% pipeline success
- Monitoring via GitHub Actions metrics

## Security Features

### Vulnerability Scanning
- **Trivy** - Container and filesystem scanning
- **npm audit** - Node.js dependency scanning
- **Safety** - Python dependency scanning

### Secret Management
- GitHub encrypted secrets
- Environment-specific configurations
- No secrets in code or logs

### Access Control
- Branch protection rules
- Required PR reviews
- Environment protection rules

## Troubleshooting

### Common Issues

**Pipeline Failures:**
1. Check logs in GitHub Actions tab
2. Verify secret configurations
3. Check service health endpoints
4. Review dependency versions

**Deployment Failures:**
1. Verify platform API keys
2. Check service configurations
3. Review environment variables
4. Validate Docker builds locally

**Test Failures:**
1. Run tests locally first
2. Check test environment setup
3. Verify test data and mocks
4. Review service dependencies

### Debug Commands
```bash
# Local testing
npm test                    # Run frontend tests
npm run test:backend       # Run backend tests  
docker-compose up          # Test full stack
docker-compose logs        # Check service logs

# Docker testing
docker build -t test .     # Build single service
docker run --rm test       # Test container
```

## Best Practices

### Code Quality
- Write comprehensive tests
- Follow linting rules
- Maintain high coverage
- Regular dependency updates

### Security
- Regular secret rotation
- Minimal permission scope
- Security scanning integration
- Dependency vulnerability monitoring

### Deployment
- Test in staging first
- Monitor deployment health
- Document rollback procedures
- Maintain deployment logs

## Future Enhancements

### Planned Features
- [ ] Blue-green deployment strategy
- [ ] Canary releases
- [ ] Performance testing automation
- [ ] Infrastructure as Code (Terraform)
- [ ] Multi-region deployment
- [ ] Advanced monitoring (Datadog/New Relic)

### Pipeline Improvements
- [ ] Parallel test optimization
- [ ] Cache optimization
- [ ] Deployment approval workflows
- [ ] Automated security compliance
- [ ] Load testing integration

## Maintenance

### Regular Tasks
- [ ] Monthly secret rotation
- [ ] Quarterly pipeline review
- [ ] Dependency security updates
- [ ] Performance metrics analysis
- [ ] Disaster recovery testing

### Pipeline Updates
- [ ] GitHub Actions version updates
- [ ] New security tools integration
- [ ] Performance optimizations
- [ ] Feature flag management

---

## Quick Start

1. **Setup Secrets** - Configure required secrets in GitHub
2. **Test Locally** - Ensure all tests pass locally
3. **Create PR** - CI pipeline runs automatically
4. **Merge to Main** - Automatic staging deployment
5. **Deploy Production** - Manual trigger when ready

For detailed setup instructions, see [SECRETS_SETUP.md](.github/SECRETS_SETUP.md)