# Space City Eidolons Community Hub

A full-featured community website for Space City Eidolons gaming community with user authentication, member profiles, event calendar, game pages, and admin management.

## � Project Status

| Phase | Status | Tasks | Details |
|-------|--------|-------|---------|
| **Phase 0** | ✅ COMPLETE | 47/47 | Infrastructure, database, monitoring |
| **Phase 1** | ⏳ READY | 21 | Shared types, frontend/backend foundations |
| **Phase 2+** | 📋 PLANNED | 380+ | User stories and features |

**Latest Update**: Phase 0 infrastructure complete. Backend API and database deployed to Azure. Health monitoring configured. Ready for Phase 1 foundational work.

**See [PHASE_0_COMPLETE.md](PHASE_0_COMPLETE.md) for detailed completion report.**

---

## �🚀 Tech Stack

### Frontend
- **React 19.2** + **TypeScript 5.9** + **Vite 7.3**
- React Router 7 for client-side routing
- React Query (TanStack Query) for server state management
- React Hook Form + Zod for form validation
- Axios for HTTP requests
- Custom CSS with existing design system

### Backend
- **Node.js 20 LTS** + **TypeScript 5.9**
- **Fastify 5.x** - High-performance web framework
- **Prisma 6.x** - Type-safe ORM
- **PostgreSQL 16** - Database
- JWT authentication with refresh tokens
- bcrypt for password hashing
- Pino for structured logging

### Infrastructure
- **Azure Static Web Apps** - Frontend hosting with CDN
- **Azure App Service** - Backend API hosting
- **Azure Database for PostgreSQL** - Managed database
- **Azure Key Vault** - Secrets management
- **Azure Application Insights** - Monitoring and logging
- **GitHub Actions** - CI/CD automation

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 16 (local development) or Azure Database for PostgreSQL (production)
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd spacecityeidolons-website-new
```

### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Copy environment example
cp .env.example .env.local

# Edit .env.local and set your variables
# VITE_API_URL=http://localhost:3000
```

### 3. Backend Setup

```bash
# Navigate to api directory
cd api

# Install backend dependencies
npm install

# Copy environment example
cp .env.example .env

# Edit .env and configure your database and secrets
# See Environment Variables section below
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

### 5. Run Development Servers

```bash
# Terminal 1: Start backend API (from api/ directory)
cd api
npm run dev
# API will run on http://localhost:3000

# Terminal 2: Start frontend (from root directory)
npm run dev
# Frontend will run on http://localhost:5173
```

## 🔐 Environment Variables

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3000
```

### Backend (api/.env)

```env
# Node Environment
NODE_ENV=development

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/spacecity_dev?schema=public

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Important**: Never commit real secrets to version control. Use `.env` files (which are gitignored) or Azure Key Vault in production.

## 🧪 Testing

### Frontend Tests

```bash
# Run frontend tests (once implemented)
npm test
npm run test:coverage
```

### Backend Tests

```bash
cd api

# Run unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# E2E tests with Playwright (once implemented)
npm run test:e2e
```

## 📦 Build & Deploy

### Frontend Build

```bash
npm run build
npm run preview  # Preview production build locally
```

### Backend Build

```bash
cd api
npm run build
npm start  # Run production build
```

### Deployment

The project uses GitHub Actions for automated deployment:
- Frontend deploys to Azure Static Web Apps
- Backend deploys to Azure App Service
- Database migrations run automatically on deployment

See `.github/workflows/` for CI/CD configuration.

## ☁️ Azure Deployment

### Prerequisites

1. **Azure Subscription** with appropriate permissions
2. **Azure CLI** installed locally (for manual deployment)
3. **GitHub Repository Secrets** configured

### Required GitHub Secrets

Configure these in your repository (Settings → Secrets and variables → Actions):

**Azure Authentication (Federated Credentials):**
- `AZURE_CLIENT_ID` - Service principal client ID
- `AZURE_TENANT_ID` - Azure AD tenant ID
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID

**Infrastructure Secrets:**
- `POSTGRES_ADMIN_USERNAME` - PostgreSQL admin username
- `POSTGRES_ADMIN_PASSWORD` - Secure password (min 8 chars, mixed case + digits)
- `JWT_SECRET` - Generate with: `openssl rand -base64 48`
- `JWT_REFRESH_SECRET` - Generate with: `openssl rand -base64 48`

### Standard PR Workflow for All Deployments

**All changes must go through a pull request workflow:**

1. Create a feature branch from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: Description of your changes"
   git push origin feature/your-feature-name
   ```

3. Create a pull request:
   ```bash
   gh pr create --base main --head feature/your-feature-name \
     --title "feat: Your feature title" \
     --body "## Changes
   - Details of changes"
   ```

4. Merge to main when ready:
   ```bash
   # Via GitHub UI or CLI:
   gh pr merge <pr-number> --merge
   ```

**GitHub Actions automatically triggers on merge to main:**
- Infrastructure validation
- Backend and frontend tests
- Deployment to Azure services

**For more details, see [DEPLOYMENT_WARNINGS.md](DEPLOYMENT_WARNINGS.md#standard-pr-workflow-for-future-deployments)**

### Automated Deployment (Recommended)

**1. Deploy Infrastructure:**
```bash
# Via GitHub Actions UI:
Actions → "Deploy Azure Infrastructure" → Run workflow → Select environment (dev/staging/prod)
```

This creates:
- Azure PostgreSQL Flexible Server
- Azure App Service (Backend API)
- Azure Static Web App (Frontend)
- Azure Key Vault (Secrets)
- Azure Application Insights (Monitoring)

**2. Deploy Backend API:**
```bash
# Via GitHub Actions UI:
Actions → "Deploy Backend API" → Run workflow → Select same environment
```

Automatically:
- Builds Node.js application
- Deploys to App Service
- Runs database migrations
- Configures environment variables

**3. Deploy Frontend:**
```bash
# Via GitHub Actions UI:
Actions → "Deploy Frontend" → Run workflow → Select same environment
```

Automatically:
- Builds React application with correct API URL
- Deploys to Static Web App
- Configures CDN

### Manual Deployment

See detailed instructions in [infrastructure/README.md](infrastructure/README.md).

Quick steps:
```bash
# 1. Login to Azure
az login

# 2. Create resource group
az group create --name rg-spacecity-dev --location eastus

# 3. Deploy infrastructure
cd infrastructure/bicep
az deployment group create \
  --resource-group rg-spacecity-dev \
  --template-file main.bicep \
  --parameters @main.parameters.dev.json

# 4. Deploy applications (see infrastructure/README.md for details)
```

### Monitoring

After deployment, monitor your application:
- **Application Insights**: Azure Portal → Resource Group → Application Insights
- **Backend Logs**: `az webapp log tail --name <app-name> --resource-group <rg-name>`
- **Frontend**: Azure Portal → Static Web App → Browse

### Cost Estimation

**Development Environment**: ~$30-40/month
- PostgreSQL B1ms: ~$13
- App Service B1: ~$13
- Static Web App: Free tier
- Key Vault + App Insights: ~$5

**Production Environment**: ~$250-350/month
- Includes higher-tier services and redundancy
- See [infrastructure/README.md](infrastructure/README.md) for details

## 🗂️ Project Structure

```
spacecityeidolons-website-new/
├── api/                      # Backend API
│   ├── prisma/              # Database schema and migrations
│   │   ├── schema.prisma    # Prisma schema definition
│   │   └── seed.ts          # Database seed script
│   ├── src/
│   │   ├── config/          # Configuration management
│   │   ├── middleware/      # Fastify middleware
│   │   ├── routes/          # API routes
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── services/        # Business logic
│   │   ├── app.ts           # Fastify app setup
│   │   └── index.ts         # Server entry point
│   ├── tests/               # Backend tests
│   └── package.json
├── src/                     # Frontend source
│   ├── components/          # React components
│   ├── services/            # API client
│   ├── types/               # TypeScript types
│   └── main.tsx             # App entry point
├── .github/workflows/       # CI/CD workflows
├── .specify/                # Specification documents
└── package.json
```

## 🔑 Default Test Credentials

After running database seed (`npm run prisma:seed`):

**Admin User:**
- Email: `admin@spacecityeidolons.com`
- Password: `Admin123!@#`

**Member User:**
- Email: `member@example.com`
- Password: `Member123!@#`

**⚠️ Change these credentials immediately in production!**

## 📚 API Documentation

Once the backend is running, API documentation is available at:
- Health Check: `http://localhost:3000/health`
- OpenAPI Spec: `http://localhost:3000/documentation` (once implemented)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow the code style (ESLint + Prettier)
3. Write tests for new features
4. Submit a pull request

## 📝 License

MIT

## 🆘 Support

For issues or questions, please contact the development team or create an issue in the repository.
