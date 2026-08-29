================================================================================
 FULL-STACK E-COMMERCE PLATFORM PROJECT
================================================================================

--------------------------------------------------------------------------------
PROJECT DESCRIPTION
--------------------------------------------------------------------------------

This is a complete full-stack e-commerce platform. It includes customer-facing shopping features (browse, search,
filter, sort, cart) and an admin dashboard for product management, backed by
a role-based authentication system, a relational database for core data, and
a separate NoSQL database for request/activity logging.

Core features:
  - User authentication with JWT (register, login, persistent sessions)
  - Role-based access control (Customer vs Admin)
  - Product catalog with search, category filtering, sorting, and pagination
  - Product image upload (Admin only)
  - Shopping cart (add, update quantity, remove items)
  - Admin dashboard for creating, editing, and deleting products
  - Request/activity logging to MongoDB (polyglot persistence)
  - Light/dark theme toggle
  - Automated backend tests (Jest unit tests + Supertest integration tests)
  - Automated frontend tests (Vitest + React Testing Library + MSW)
  - Fully containerized with Docker (backend, frontend, PostgreSQL, MongoDB)

--------------------------------------------------------------------------------
TECHNOLOGIES USED
--------------------------------------------------------------------------------

Backend:
  - Node.js + Express
  - PostgreSQL (via Prisma ORM) — users, products, cart
  - MongoDB (via Mongoose) — request/activity logs
  - JSON Web Tokens (JWT) for authentication
  - bcryptjs for password hashing
  - Multer for image uploads
  - Jest + Supertest for unit and integration testing

Frontend:
  - React (Vite)
  - React Router for client-side routing
  - Axios for API requests
  - React Context API for state management (auth, theme)
  - Vitest + React Testing Library + MSW (Mock Service Worker) for testing
  - Hand-written CSS with CSS variables (light/dark theming)

DevOps / Delivery:
  - Docker + Docker Compose (backend, frontend, PostgreSQL, MongoDB run
    together as a single stack)
  - Git / GitHub

--------------------------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------------------------

ecommerce-capstone/
  backend/            Express API, Prisma schema/migrations, Mongo models,
                       controllers, routes, middleware, tests, Dockerfile
  frontend/            React app (Vite), pages, components, context, API
                       client, tests, Dockerfile
  docker-compose.yml   Runs backend + frontend + PostgreSQL + MongoDB together
  README.txt           This file

--------------------------------------------------------------------------------
HOW TO RUN THE PROJECT
--------------------------------------------------------------------------------

There are two ways to run this project: with Docker (recommended, one
command, no local installs needed) or manually for local development.

--------------------------------------------------------------------------------
OPTION A — RUN WITH DOCKER (recommended)
--------------------------------------------------------------------------------

Requirements:
  - Docker Desktop installed and running

Steps:
  1. Clone the repository:
       git clone https://github.com/TechnoCodez/DECI-FullStack-E-commerce-website-Ahmed-Mohamed-Salem.git
       cd DECI-FullStack-E-commerce-website-Ahmed-Mohamed-Salem

  2. From the project root, run:
       docker compose up --build

  3. Wait until you see:
       - "Server is running on port 5000"  (backend)
       - "MongoDB connected"                (backend)
       - nginx startup messages             (frontend)

  4. See the "PROJECT URLS" section below once the containers are running.

  5. To stop everything:
       docker compose down

  To reset all data and start fully fresh:
       docker compose down -v
       docker compose up --build

--------------------------------------------------------------------------------
OPTION B — RUN MANUALLY (local development)
--------------------------------------------------------------------------------

Requirements:
  - Node.js (v20+)
  - PostgreSQL installed and running locally
  - MongoDB installed and running locally

Backend setup:
  1. cd backend
  2. npm install
  3. Copy .env.example to .env and fill in your own values:
       DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecommerce?schema=public
       MONGO_URI=mongodb://localhost:27017/ecommerce_logs
       JWT_SECRET=your_own_random_secret
       JWT_EXPIRES_IN=7d
       PORT=5000
  4. Run database migrations:
       npx prisma migrate dev
  5. Start the server:
       npm run dev
     Backend runs at http://localhost:5000

Frontend setup (in a separate terminal):
  1. cd frontend
  2. npm install
  3. npm run dev
     Frontend runs at http://localhost:5173

--------------------------------------------------------------------------------
RUNNING TESTS
--------------------------------------------------------------------------------

Backend tests (Jest unit tests + Supertest integration tests):
  cd backend
  npm test

Frontend tests (Vitest + React Testing Library + MSW):
  cd frontend
  npm test

Note: backend tests require PostgreSQL and MongoDB to be running (same as
normal development), since integration tests run against a real database.

--------------------------------------------------------------------------------
PROJECT URLS
--------------------------------------------------------------------------------

  Frontend:              http://localhost:5173
  Backend API:           http://localhost:5000
  Backend health check:  http://localhost:5000/api/health
  GitHub repository:     https://github.com/TechnoCodez/DECI-FullStack-E-commerce-website-Ahmed-Mohamed-Salem

  (Same URLs apply whether running via Docker or local dev — both use the
  same ports.)

--------------------------------------------------------------------------------
TEST ACCOUNT CREDENTIALS
--------------------------------------------------------------------------------

These accounts are seeded for demo/grading purposes only. Do not reuse these
credentials for anything outside this project.

  Admin account:
    Email:    admin@demo.com
    Password: Demo1234!
    Access:   Full access, including the Admin Dashboard (create/edit/delete
              products, image upload)

  Customer account:
    Email:    customer@demo.com
    Password: Demo1234!
    Access:   Browse products, use cart, standard customer features only
              (no Admin Dashboard access)

You can also register a brand new account at any time via the Register page —
new accounts default to the Customer role.

--------------------------------------------------------------------------------
IMPORTANT NOTES
--------------------------------------------------------------------------------

  - This project uses two databases intentionally: PostgreSQL for core
    relational data (users, products, cart) via Prisma, and MongoDB for
    request/activity logging via Mongoose — a deliberate polyglot
    persistence setup.
  - Uploaded product images are stored in backend/uploads and served
    statically by the backend at /uploads/<filename>.
  - Frontend testing uses Vitest (not Jest) since the frontend is built with
    Vite — Vitest is Vite's native test runner and is fully compatible with
    React Testing Library, satisfying the same testing requirement.
  - JWT_SECRET and database credentials in this repository's Docker Compose
    file are development-only placeholder values. Do not reuse them in any
    real deployment.
================================================================================
