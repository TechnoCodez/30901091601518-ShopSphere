# EYOUTH-30901091601518-ShopSphere

## Project Overview
ShopSphere is a full-stack e-commerce application built using a microservices architecture. It is deployed live on Vercel with a polyglot database setup utilizing PostgreSQL (Supabase) and MongoDB Atlas.

## Live Production URLs
- **Main Application (Frontend)**: https://eyouth-30901091601518-shopsphere.vercel.app
- **Backend Monolith API**: https://eyouth-30901091601518-shopsphere.vercel.app/api
- **Review Microservice**: https://eyouth-30901091601518-shopsphere-review.vercel.app
- **Stats Serverless Function**: https://eyouth-30901091601518-shopsphere-st.vercel.app

## Architecture & Databases
- **Frontend**: React 19 (Vite) single-page application hosted on Vercel.
- **Backend Monolith**: Express.js serverless app for core API, auth, and cart management backed by PostgreSQL (Supabase via Prisma ORM).
- **Review Service**: Independent Express.js microservice managing user reviews backed by MongoDB Atlas.
- **Stats Function**: Standalone serverless analytics function accessing PostgreSQL data.

## CI/CD Pipeline
- **Automated Workflow**: Configured via GitHub Actions (`.github/workflows/deploy.yml`).
- **Trigger**: Automatic build and production deployment executes automatically on every push or merge to the `main` branch.

## Submission Deliverables
- `EYOUTH-30901091601518-ShopSphere-Architecture.png` (Architecture Diagram)
- `EYOUTH-30901091601518-ShopSphere-Classification.md` (Cloud Service Classification)
- `EYOUTH-30901091601518-ShopSphere-Rollback.md` (Rollback Procedures)
- `EYOUTH-30901091601518-ShopSphere-k8s-dev.yaml` (Development Kubernetes Manifest)
- `EYOUTH-30901091601518-ShopSphere-k8s-staging.yaml` (Staging Kubernetes Manifest)