# ShopSphere Rollback Plan

## Overview
This document describes the process for detecting failed releases and restoring to the previous stable version in production.

## Release Monitoring

### Health Check Monitoring
All three services expose health check endpoints that are monitored in production:

- **Backend API**: `https://eyouth-30901091601518-shopsphere.vercel.app/api/health`
- **Review Service**: `https://eyouth-30901091601518-shopsphere-review.vercel.app/api/health`
- **Stats Function**: `https://eyouth-30901091601518-shopsphere-st.vercel.app/api/health`

**Monitoring Interval**: Check every 5 minutes in production

### Success Criteria
A release is considered successful if:
1. All health endpoints return HTTP 200 with `{ status: 'ok' }`
2. Database connectivity is verified (MongoDB for reviews, PostgreSQL for main backend)
3. API endpoints respond within 2 seconds
4. Frontend loads and routes work (can access homepage and product pages)

### Failure Detection
A release has failed if:
1. Health endpoint returns 5xx error or is unreachable for >10 minutes
2. API requests to `/api/products`, `/api/categories`, `/api/reviews/*` fail with 404 or 5xx
3. Frontend shows 404 on direct URL access (not from homepage navigation)
4. Database connection times out
5. Secrets/credentials are exposed in logs

## Rollback Procedures

### For Backend API (Vercel)

**Automatic Detection**: Vercel deployment fails → No new functions deployed

**Manual Rollback**:
1. Go to Vercel Dashboard → Backend Project
2. Click "Deployments" tab
3. Find the last successful deployment (marked with green checkmark)
4. Click the three-dot menu → "Promote to Production"
5. Verify health check: `curl https://eyouth-30901091601518-shopsphere.vercel.app/api/health`

**Expected Recovery Time**: 2-3 minutes

### For Review Service (Vercel)

**Automatic Detection**: Vercel deployment fails → No new functions deployed

**Manual Rollback**:
1. Go to Vercel Dashboard → Review Service Project
2. Click "Deployments" tab
3. Find the last successful deployment
4. Click the three-dot menu → "Promote to Production"
5. Verify health check: `curl https://your-review-service-url/api/health`

**Expected Recovery Time**: 2-3 minutes

### For Frontend (Vercel)

**Automatic Detection**: Vercel deployment fails → No new files deployed

**Manual Rollback**:
1. Go to Vercel Dashboard → Frontend Project
2. Click "Deployments" tab
3. Find the last successful deployment
4. Click the three-dot menu → "Promote to Production"
5. Clear browser cache or use incognito window
6. Test: Navigate to homepage then to product page → both should load

**Expected Recovery Time**: 2-3 minutes

### For GitHub Actions Workflow Failure

**Detection**: GitHub Actions shows red X on commit

**Resolution**:
1. Go to GitHub → Actions tab
2. Click the failed workflow
3. Review logs for specific error
4. Common fixes:
   - Missing/expired `VERCEL_TOKEN` → Regenerate in Vercel Account Settings
   - Wrong `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID` → Verify in GitHub Secrets
   - Database connection failure → Check environment variables on hosting platform

**To Manually Trigger Deployment**:
1. Go to GitHub → Actions
2. Select "Deploy to Production" workflow
3. Click "Run workflow" → Select main branch → Confirm
4. Monitor logs until "Deploy to Vercel Production" completes

## Post-Rollback Steps

After rolling back:
1. Check all health endpoints ✓
2. Test key user flows:
   - Browse products (homepage)
   - View product detail (click product)
   - View reviews (scroll down)
   - Add to cart (if available)
3. Monitor logs for 15 minutes for any new errors
4. Notify team if rollback occurred

## Preventing Rollbacks

### Pre-Deployment Checks
- Run tests locally: `npm test`
- Check for console errors: `npm run build`
- Verify environment variables are set correctly
- Review secrets are NOT in code or logs

### CI/CD Pipeline Protection
- GitHub Actions runs on every push to `main`
- Only successful builds can be promoted to production
- Secrets are validated before deployment

## Incident Response

**If production is down**:
1. Immediately roll back to last known good version
2. Document what happened in git commit message
3. Investigate root cause before deploying again
4. Open incident ticket if applicable

**Escalation Path**:
- Level 1: Auto-rollback on deployment failure
- Level 2: Manual rollback via Vercel Dashboard
- Level 3: Restore from database backups (if data corruption suspected)

## Logging & Observability

All logs are available in:
- **Vercel Logs**: Project Settings → Logs tab
- **Console Logs**: All errors logged to stdout
- **Database Logs**: Check MongoDB and PostgreSQL connection strings for issues

Failed releases are identified by:
- Deployment status: Failed (in Vercel)
- Health check: Returns 5xx or timeout
- API errors: Consistent 404 or 503 responses
