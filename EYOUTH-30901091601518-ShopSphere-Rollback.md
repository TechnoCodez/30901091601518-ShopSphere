# EYOUTH-30901091601518-ShopSphere

## Project Overview
ShopSphere is a full-stack e-commerce application with microservices architecture, deployed on Vercel with PostgreSQL (Supabase) and MongoDB databases.

## Production URLs

### Frontend
- **Main Application**: https://eyouth-30901091601518-shopsphere.vercel.app
- **Features**:
  - Browse products by category
  - View detailed product information
  - Submit and view product reviews
  - Add products to cart
  - User authentication (login/register)
  - Dark mode support

### Backend API
- **Base URL**: https://eyouth-30901091601518-shopsphere.vercel.app/api
- **Health Check**: https://eyouth-30901091601518-shopsphere.vercel.app/api/health
- **Note**: Backend and Frontend are on same domain

### Review Service (Microservice)
- **Base URL**: https://eyouth-30901091601518-shopsphere-review.vercel.app
- **Health Check**: https://eyouth-30901091601518-shopsphere-review.vercel.app/api/health
- **API Base**: `/api` (all review calls from frontend)

### Stats Function (Serverless)
- **Base URL**: https://eyouth-30901091601518-shopsphere-st.vercel.app
- **Health Check**: https://eyouth-30901091601518-shopsphere-st.vercel.app/api/health

## Databases

### PostgreSQL (Supabase)
- **Provider**: Supabase
- **Purpose**: Core application data (products, users, categories, cart)
- **Connection**: Via environment variable `DATABASE_URL`
- **Schema**: Managed by Prisma ORM
- **Backup**: Automatic daily backups via Supabase

### MongoDB
- **Purpose**: Reviews and ratings data
- **Connection**: Via environment variable `MONGO_URI`
- **Collections**: Review (stores productId, userId, userName, rating, comment, timestamps)
- **Backup**: Manual backup required (if needed)

## Technology Stack

### Frontend
- **Framework**: React 19 with Vite
- **UI**: Custom CSS with CSS variables for theming
- **State Management**: React Context API (Auth, Theme)
- **HTTP Client**: Axios
- **Router**: React Router v7

### Backend
- **Runtime**: Node.js 20 on Vercel
- **Framework**: Express.js
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **Middleware**: CORS, Helmet, Rate Limiting
- **Database**: PostgreSQL (Supabase)

### Review Service
- **Runtime**: Node.js 20 on Vercel
- **Framework**: Express.js
- **Database**: MongoDB
- **Isolation**: Completely separate from main backend

### Stats Function
- **Type**: Vercel Serverless Function
- **Purpose**: Compute and return system statistics
- **Triggers**: On-demand via API endpoint
- **Database**: Prisma to PostgreSQL

## Deployment Architecture

### Frontend Deployment
- **Hosting**: Vercel
- **Build**: `npm run build` → Vite outputs to `dist/`
- **SPA Routing**: vercel.json rewrites all non-asset routes to `/index.html`
- **Assets**: Served from `/assets/` folder
- **Environment**: Production

### Backend Deployment
- **Hosting**: Vercel Functions (Serverless)
- **Build**: Vercel auto-builds from `api/index.js`
- **Entry Point**: `api/index.js` exports Express app
- **Environment Variables**: Set in Vercel dashboard
- **Logging**: Console output to Vercel logs

### Review Service Deployment
- **Hosting**: Vercel Functions (Serverless)
- **Build**: Vercel auto-builds from `api/index.js`
- **Entry Point**: `api/index.js` exports Express app
- **MongoDB**: Connected on app initialization
- **Separate Project**: Independent Vercel project from backend

### Stats Function Deployment
- **Type**: Vercel Serverless Function
- **Build**: Vercel auto-builds from `api/stats.js`
- **Endpoint**: `/api/stats`
- **Database**: Prisma connection to PostgreSQL
- **Execution**: Fire-and-forget, auto-scales

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secret-key
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database
FRONTEND_URL=https://eyouth-30901091601518-shopsphere.vercel.app
```

### Review Service (.env)
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/reviews-database
```

### Frontend (.env)
```
VITE_API_URL=https://eyouth-30901091601518-shopsphere.vercel.app/api
VITE_REVIEW_API_BASE_URL=https://eyouth-30901091601518-shopsphere-review.vercel.app/api
```

## CI/CD Pipeline

### GitHub Actions
- **Workflow File**: `.github/workflows/deploy.yml`
- **Trigger**: Automatic execution on push/merge to `main` branch
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20
  3. Install Vercel CLI
  4. Pull Vercel environment info
  5. Build with Vercel
  6. Deploy to production
- **Secrets Required**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Vercel Auto-Deployment
- **Primary Method**: Automatic on every push to `main` branch
- **Handles**: Frontend, Backend, Review Service
- **No Manual Action**: Deploys instantly

## Microservices Architecture

### Service Isolation
1. **Frontend** (React SPA) - User interface
2. **Backend** (Express) - Core API, PostgreSQL
3. **Review Service** (Express) - Reviews API, MongoDB
4. **Stats Function** (Serverless) - Analytics, PostgreSQL

### Communication
- Frontend calls Backend API for products, auth, cart
- Frontend calls Review Service API for reviews
- Backend does NOT call Review Service
- All services exposed via public HTTPS URLs

### Database Separation
- PostgreSQL: Products, users, categories, cart
- MongoDB: Reviews only

## Security

### Secrets Management
- All secrets stored as GitHub Secrets or Vercel Environment Variables
- No secrets in repository or logs
- JWT tokens used for API authentication
- Rate limiting: 100 requests per 15 minutes on `/api` routes

### Network Security
- HTTPS enforced on all URLs
- CORS configured for frontend domain
- Helmet.js for security headers
- Trust proxy headers for Vercel deployment

## Monitoring & Health Checks

### Production Monitoring
- Frontend: Accessible from homepage and direct URLs
- Backend: Health endpoint responds with 200 and `{ status: 'ok' }`
- Review Service: Health endpoint responds with 200 and `{ status: 'ok' }`
- Databases: Connection verified on service startup

### Logging
- Backend logs to stdout (visible in Vercel logs)
- All requests logged with method, path, status code
- Errors logged with timestamp and severity level
- No MongoDB logging to prevent timeouts

## Known Issues & Solutions

### Issue: 404 on direct product page URL access
- **Symptom**: Works from homepage navigation but not direct URL
- **Cause**: SPA routing requires vercel.json rewrite
- **Solution**: Ensure assets routes preserved before catch-all rewrite
- **Config**: 
  ```json
  {
    "rewrites": [
      { "source": "/assets/(.*)", "destination": "/assets/$1" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### Issue: MongoDB logging timeouts
- **Symptom**: Requests timeout with "buffering timeout" error
- **Solution**: Removed MongoDB logging, use console.log only
- **Result**: No more timeout errors

## Support & Rollback

See `ROLLBACK_PLAN.md` for:
- Health check endpoints
- Failure detection procedures
- Rollback steps for each service
- Post-rollback verification

## Team Access

All team members need access to:
1. **GitHub Repository**: For code changes and CI/CD
2. **Vercel Dashboard**: For deployment monitoring and manual rollback
3. **Supabase Dashboard**: For database management
4. **MongoDB Atlas**: For review database management

---

**Last Updated**: 2026-08-29
**Status**: Production Ready ✓
