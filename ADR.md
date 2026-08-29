# Architecture Decision Record (ADR)

## 1. Review Service Extraction

**Status:** Adopted

**Extracted Service:** Review & Ratings Microservice (`EYOUTH-30901091601518-ShopSphere-ReviewService`)
- **Service Type**: Independent Vercel Serverless Functions
- **Database**: Standalone MongoDB cluster
- **API URL**: `https://review-service-url.vercel.app/api/reviews`
- **Isolation Level**: Complete - no direct database access to main PostgreSQL

**Justification:**
- Reviews rely on document-oriented MongoDB (unstructured, high-volume writes)
- Core business logic uses PostgreSQL (structured, transactional)
- Prevents review traffic spikes from blocking order/payment processing
- Enables independent scaling of review service
- Allows separate SLA and deployment cadence

**Trade-offs:**
- (+) Independent database: Review data doesn't impact core data integrity
- (+) Async isolation: Frontend waits for reviews separately from product data
- (-) Network latency: Extra API call to fetch reviews
- (-) Consistency: Eventual consistency model (reviews may lag slightly)

**API Contracts:**
```
GET /api/reviews/:productId - Returns array of reviews
POST /api/reviews/:productId - Creates review (requires userId, rating, comment, userName)
```

**Verification:**
- Health endpoint: `GET /api/health` returns `{ status: 'ok' }`
- MongoDB connection verified on service startup
- Tested: ProductDetail.jsx calls `reviewApi` to separate endpoint ✓

---

## 2. Serverless Workload Integration

**Status:** Adopted

**Serverless Workload:** Platform Analytics & System Health (`api/stats.js`)
- **Type**: Vercel Serverless Function
- **Trigger**: On-demand HTTP request
- **Execution**: Fire-and-forget (no server keeps running)
- **Database Access**: PostgreSQL via Prisma ORM
- **Response Time**: <2 seconds

**Justification:**
- Stats computation is non-critical, intermittent task
- No continuous polling or scheduled execution needed
- Scales automatically with request volume
- No idle container overhead
- Cost-efficient (pay per invocation)

**Trade-offs:**
- (+) Cost efficiency: No idle resources
- (+) Auto-scaling: Handles traffic spikes naturally
- (+) Separation: Analytics doesn't affect main API performance
- (-) Cold start: First request may take 1-2 seconds
- (-) No persistent connections: Each invocation is fresh

**API Endpoint:**
```
GET /api/stats - Returns system statistics (CPU, memory, active users, etc.)
```

**Verification:**
- Deployed separately from backend
- Tested: Test file `test-stats.js` confirms execution ✓

---

## 3. Polyglot Database Strategy

**Status:** Adopted

**Core Decision:** Separate PostgreSQL and MongoDB for different workloads

**Configuration:**
| Service | Database | Provider | Purpose |
|---------|----------|----------|---------|
| Backend API | PostgreSQL | Supabase | Products, users, orders, cart, categories |
| Review Service | MongoDB | MongoDB Atlas | Reviews, ratings, user feedback |
| Stats Function | PostgreSQL | Supabase | Analytics, system health metrics |

**Justification:**
- PostgreSQL: ACID compliance needed for transactions (orders, payments)
- MongoDB: Flexible schema for reviews, high write throughput
- No cross-database joins: Each database handles its domain completely

**Namespace Isolation:**
- Frontend → Backend (ProductDetail, Cart, etc.)
- Frontend → Review Service (Reviews only)
- Backend does NOT call Review Service
- Each service has own environment variables (`DATABASE_URL` vs `MONGO_URI`)

**Verified Isolation:**
- Backend imports only `./config/prismaClient.js` ✓
- Review Service imports only `./config/mongoClient.js` ✓
- No `@vercel/postgres` in review-service/package.json ✓

---

## 4. SPA Routing with Vercel Static Hosting

**Status:** Adopted

**Decision:** Single-Page Application (React) served statically with client-side routing

**Implementation:**
```json
// frontend/vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/assets/(.*)", "destination": "/assets/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Justification:**
- No server-side rendering overhead
- Static hosting is cheapest option on Vercel
- React Router handles all routing on client
- Build artifacts cached and CDN-delivered

**Route Handling:**
- Direct URL access (e.g., `/products/123`) → Rewrites to `/index.html` → React Router parses URL
- Asset requests (`/assets/*`) → Served directly (excluded from rewrite)
- API calls → Proxied to backend via axios

**Known Issue (Fixed):**
- Problem: Direct URL access to product page returned 404
- Cause: Rewrite rule was too broad, catching static assets
- Solution: Explicitly preserve `/assets/` before catch-all rewrite

---

## 5. Serverless Entry Points

**Status:** Adopted

**Decision:** Export Express app directly instead of calling `app.listen()`

**Implementation:**
```javascript
// api/index.js - Backend
const app = require('../src/app');
module.exports = app;  // Vercel wraps this as handler

// src/app.js - Connects to databases
const app = express();
app.use(middleware...);
app.use(routes...);
module.exports = app;
```

**Rationale:**
- Vercel serverless requires function export, not server binding
- Removes need for `app.listen(PORT)` in serverless
- Same pattern for backend and review-service
- Compatible with local development (can still call listen in server.js)

**Verified:**
- Backend: `api/index.js` exports app ✓
- Review Service: `api/index.js` exports app ✓
- MongoDB connection happens on app initialization ✓

---

## 6. No Database Logging in Serverless

**Status:** Adopted

**Decision:** Log only to console in production (no MongoDB writes)

**Rationale:**
- MongoDB logging causes buffering timeouts in Vercel serverless
- Each request tried to `Log.create()` → blocked response
- Cold starts + connection pooling = 10+ second delays
- Result: 404 errors on every request

**Solution:**
```javascript
// All logs go to console only
console.log(`[${level}] ${req.method} ${req.originalUrl} - ${res.statusCode}`);
// No more: await Log.create({ ... })
```

**Observation Location:**
- Vercel dashboard: Project → Logs tab
- All structured logging includes timestamp, method, path, status code

**Verified:**
- No `Log.create()` calls in production middleware ✓
- All errors logged to stdout ✓

---

## 7. GitHub Actions Workflow Strategy

**Status:** Adopted

**Decision:** Manual GitHub Actions workflow (workflow_dispatch) instead of auto-trigger

**Rationale:**
- **Problem**: Auto-trigger on every push + Vercel auto-deploy = race condition
- **Symptom**: Second deployment fails with 404
- **Solution**: Let Vercel handle all auto-deployments, GitHub Actions for manual only

**Workflow Configuration:**
```yaml
on:
  workflow_dispatch:  # Manual trigger via GitHub UI only
```

**Secrets Requirement:**
All three secrets must be configured in GitHub:
- `VERCEL_TOKEN` - Personal access token from Vercel
- `VERCEL_ORG_ID` - Organization ID from Vercel
- `VERCEL_PROJECT_ID` - Project ID for backend

**Usage:**
1. Go to GitHub → Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow" button
4. Monitor deployment in GitHub logs

**Verified:**
- Workflow file exists: `.github/workflows/deploy.yml` ✓
- Structured logging with timestamps ✓
- Environment set to `production` ✓

---

## 8. Security & Secrets Management

**Status:** Adopted

**Decision:** All secrets managed via environment variables on hosting platforms

**Implementation:**
- GitHub: Secrets stored securely, injected at workflow runtime
- Vercel: Environment variables in project settings (never in code)
- No `.env` files committed to repository
- Helmet.js security headers enabled
- Rate limiting: 100 req/15min on `/api` routes

**Verified:**
- No `MONGO_URI` in any source files ✓
- No `JWT_SECRET` in repository ✓
- No database credentials in logs ✓
- HTTPS enforced on all URLs ✓

---

## Summary

ShopSphere uses a **modular microservices architecture** deployed on Vercel with:
- ✅ Separate review service (MongoDB)
- ✅ Serverless stats function (PostgreSQL)
- ✅ Static SPA frontend (React Router)
- ✅ No database logging in serverless
- ✅ Manual GitHub Actions with secrets management
- ✅ Complete namespace isolation between services

This design achieves:
- **Scalability**: Each service scales independently
- **Reliability**: Service failures don't cascade
- **Cost Efficiency**: Serverless pay-per-invocation model
- **Maintainability**: Clear separation of concerns
- **Security**: Secrets never exposed, environment-based config

See `ROLLBACK_PLAN.md` and `EYOUTH-30901091601518-ShopSphere.md` for operational procedures and complete project documentation.