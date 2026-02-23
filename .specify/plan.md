# Implementation Plan: Space City Eidolons Community Hub

**Branch**: `001-community-hub-website` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)

## Summary

Build a full-featured community hub website for Space City Eidolons gaming community with user authentication, profiles, event calendar, game pages, and admin management. The implementation will preserve the existing React-based site while incrementally adding backend services and complex frontend features, deployed to Azure with CI/CD automation.

## Technical Context

### Frontend Stack

**Language/Version**: TypeScript 5.9 (already in place)  
**Framework**: React 19.2 with React Router 7 for client-side routing  
**Build Tool**: Vite 7.3 (already in place) with SWC for fast builds  
**State Management**: React Context API + React Query (TanStack Query v5) for server state  
**Form Handling**: React Hook Form with Zod schema validation  
**UI Components**: Headless UI for accessibility + Custom CSS (maintain existing design system)  
**Date/Time**: date-fns for calendar operations (lightweight, tree-shakeable)  
**HTTP Client**: Axios with interceptors for auth tokens  

**Project Type**: Single Page Application (SPA) with client-side routing  
**Performance Goals**: 
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse score > 90 for all categories
**Constraints**: Must maintain existing deployment, no breaking changes to current URL structure  
**Scale/Scope**: ~15 pages/views, 5 user roles (guest/member/admin), 50+ UI components

### Backend Stack

**Language/Version**: TypeScript 5.9 + Node.js 20 LTS  
**Framework**: Fastify 5.x (high performance, TypeScript-first, good DX)  
**API Style**: RESTful JSON APIs with consistent error handling  
**Authentication**: Discord OAuth 2.0 + JWT (access + refresh tokens) for session management  
**Validation**: Zod schemas (shared with frontend where possible)  
**ORM/Database Client**: Prisma 6.x for type-safe database access  
**Storage**: Azure Database for PostgreSQL Flexible Server (v16)  
**Testing**: Vitest for unit tests, Supertest for API integration tests  
**Logging**: Pino (structured JSON logging, Fastify-native)  
**Email**: Azure Communication Services for invite notifications (future phase)

**Project Type**: RESTful API service  
**Performance Goals**: 
- p95 latency < 200ms for reads
- p95 latency < 500ms for writes  
- Handle 100 concurrent requests
**Constraints**: Stateless API for horizontal scaling, JWT must expire, Discord OAuth scopes limited to `identify email`  
**Scale/Scope**: ~35 API endpoints, 6 database entities, role-based access control

### Azure Infrastructure

**Frontend Hosting**: Azure Static Web Apps (automatic SSL, CDN, preview environments)  
**Backend Hosting**: Azure App Service (Linux, Node.js 20 runtime, auto-scaling)  
**Database**: Azure Database for PostgreSQL Flexible Server (Burstable B1ms tier initially)  
**Storage**: Azure Blob Storage for future media uploads (out of scope for v1)  
**CI/CD**: GitHub Actions (already in place, will be updated)  
**Monitoring**: Azure Application Insights for logs, metrics, and traces  
**Secrets Management**: Azure Key Vault for database credentials and JWT secrets

### Development Tools

**Package Manager**: npm (already in place)  
**Code Quality**: ESLint (already configured), Prettier for formatting  
**Type Checking**: TypeScript strict mode enabled  
**Git Workflow**: Feature branches, pull requests, protected main branch  
**API Documentation**: OpenAPI 3.1 spec generated from Fastify routes  
**Database Migrations**: Prisma Migrate for version-controlled schema changes

## Constitution Check

### Pre-Implementation Gates ✅

- [x] **Specification approved**: Complete specification with 8 prioritized user stories
- [x] **Tests written and approved**: Will be written per phase before implementation (see Phase breakdown)
- [x] **Plan reviewed and approved**: This document (pending approval)

### Code Quality Standards (Principle VI)

**Adherence Strategy:**
- TypeScript strict mode enforces type safety
- ESLint with React and TypeScript rules for code consistency  
- Prettier for consistent formatting
- Code review required for all PRs
- Naming conventions: PascalCase for components, camelCase for functions/variables, UPPER_CASE for constants
- Max function length: 50 lines (enforced in code review)
- Max component complexity: 10 (will refactor when exceeded)

### Testing Standards (Principles IX-X)

**Test Strategy:**
- **Unit Tests (70%+)**: All services, utilities, hooks, and pure components
- **Integration Tests (20%)**: API endpoints with test database, component interactions
- **E2E Tests (10%)**: Critical user paths (login, create event, admin approval) with Playwright

**Test Organization:**
- Frontend: `src/**/__tests__/` using Vitest + React Testing Library
- Backend: `api/tests/` split into `unit/` and `integration/`
- E2E: `e2e/` directory in project root

### User Experience Standards (Principles XI-XIV)

**Adherence Strategy:**
- **Consistency**: Design system with documented components and patterns
- **Accessibility**: WCAG 2.1 AA compliance, tested with axe-core, keyboard navigation required
- **Performance**: Monitored with Lighthouse CI, bundle size budget enforced
- **Error Handling**: Standardized error display component, all API errors have user-friendly messages

### Documentation (Principle XV)

**Documentation Plan:**
- `README.md`: Setup instructions, architecture overview, deployment guide
- `CONTRIBUTING.md`: Development workflow, code standards, PR process
- `API.md`: Auto-generated API documentation from OpenAPI spec
- `ARCHITECTURE.md`: System design, data flow, technology decisions
- Inline JSDoc comments for complex functions
- Storybook for component documentation (future enhancement)

## Project Structure

### Documentation (this feature)

```text
.specify/
├── spec.md                  # Feature specification (complete)
├── plan.md                  # This file - implementation plan
├── constitution.md          # Development principles (complete)
├── tasks/                   # Phase-specific task files (created per phase)
│   ├── phase-0-tasks.md    # Infrastructure & setup tasks
│   ├── phase-1-tasks.md    # P1 user story tasks
│   ├── phase-2-tasks.md    # P2 user story tasks
│   └── ...
└── templates/              # Templates for specs, plans, tasks (already exist)
```

### Source Code (monorepo structure)

```text
spacecityeidolons-website-new/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # Updated: Azure deployment
│       ├── test-frontend.yml       # New: Frontend CI
│       └── test-backend.yml        # New: Backend CI
├── .specify/                       # Spec Kit files (already exists)
├── api/                            # New: Backend API
│   ├── src/
│   │   ├── index.ts               # Fastify server entry point
│   │   ├── app.ts                 # App setup, plugins, routes
│   │   ├── config/                # Configuration (env vars, constants)
│   │   ├── routes/                # Route handlers by domain
│   │   │   ├── auth.ts           # Authentication routes
│   │   │   ├── users.ts          # User management routes
│   │   │   ├── profiles.ts       # Profile CRUD routes
│   │   │   ├── events.ts         # Calendar event routes
│   │   │   ├── games.ts          # Game page routes
│   │   │   └── invites.ts        # Invite request routes
│   │   ├── services/              # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── profile.service.ts
│   │   │   ├── event.service.ts
│   │   │   ├── game.service.ts
│   │   │   └── invite.service.ts
│   │   ├── middleware/            # Fastify middleware
│   │   │   ├── auth.middleware.ts # JWT verification
│   │   │   ├── role.middleware.ts # Role-based access control
│   │   │   └── error.middleware.ts # Error handling
│   │   ├── schemas/               # Zod validation schemas
│   │   │   └── *.schema.ts       # One per entity
│   │   ├── types/                 # TypeScript interfaces
│   │   └── utils/                 # Helpers (password hashing, tokens, etc.)
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── migrations/            # Database migrations
│   │   └── seed.ts                # Seed data for development
│   ├── tests/
│   │   ├── unit/                  # Service & utility tests
│   │   ├── integration/           # API endpoint tests
│   │   └── setup.ts               # Test configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── src/                            # Frontend (already exists, will expand)
│   ├── main.tsx                   # Entry point (already exists)
│   ├── App.tsx                    # Root component (will expand)
│   ├── App.css                    # Base styles (already exists)
│   ├── components/                # New: Reusable UI components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Loading.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordResetForm.tsx
│   │   ├── profile/
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   └── PrivacyToggle.tsx
│   │   ├── calendar/
│   │   │   ├── Calendar.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── EventDetails.tsx
│   │   ├── games/
│   │   │   ├── GameCard.tsx
│   │   │   ├── GameForm.tsx
│   │   │   └── GameRequestForm.tsx
│   │   └── admin/
│   │       ├── UserTable.tsx
│   │       ├── InviteRequestTable.tsx
│   │       └── GameRequestTable.tsx
│   ├── pages/                     # New: Page-level components
│   │   ├── HomePage.tsx           # Landing page (refactor from App.tsx)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ProfileEditPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── EventCreatePage.tsx
│   │   ├── GamesPage.tsx
│   │   ├── GameDetailsPage.tsx
│   │   ├── GameRequestPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminUsersPage.tsx
│   │   ├── AdminInvitesPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/                     # New: Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProfile.ts
│   │   ├── useEvents.ts
│   │   ├── useGames.ts
│   │   └── useInvites.ts
│   ├── services/                  # New: API client functions
│   │   ├── api.ts                # Axios instance with interceptors
│   │   ├── auth.service.ts
│   │   ├── profile.service.ts
│   │   ├── event.service.ts
│   │   ├── game.service.ts
│   │   └── invite.service.ts
│   ├── context/                   # New: React context providers
│   │   └── AuthContext.tsx        # Auth state management
│   ├── types/                     # New: TypeScript types (shared with API)
│   │   └── index.ts
│   ├── utils/                     # New: Helper functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   └── assets/                    # Static assets (already exists)
├── e2e/                           # New: End-to-end tests
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   ├── profile.spec.ts
│   │   ├── calendar.spec.ts
│   │   └── admin.spec.ts
│   └── playwright.config.ts
├── public/                        # Static files (already exists)
│   └── logo.svg
├── dist/                          # Build output (gitignored)
├── node_modules/                  # Dependencies (gitignored)
├── ARCHITECTURE.md                # New: Architecture documentation
├── API.md                         # New: API documentation
├── CONTRIBUTING.md                # New: Contribution guide
├── package.json                   # Root package.json (already exists)
├── vite.config.ts                 # Vite config (already exists)
├── tsconfig.json                  # TS config (already exists)
├── index.html                     # HTML template (already exists)
└── README.md                      # Update: Comprehensive setup guide
```

**Structure Decision**: Monorepo structure with separate `api/` and `src/` directories. This keeps frontend and backend code organized while allowing shared TypeScript types. The existing React app in `src/` will be preserved and incrementally enhanced. GitHub Actions workflows will manage CI/CD for both frontend and backend independently.

## Complexity Tracking

### Justified Complexity

| Decision | Why Needed | Simpler Alternative Rejected Because |
|----------|------------|-------------------------------------|
| Separate Backend Service | Need server-side authentication, database, role-based access control, and secure API layer | Frontend-only with Firebase/Supabase would vendor-lock us and limit customization for complex auth/permissions logic |
| PostgreSQL Database | Need relational data (users→profiles, events→games), ACID transactions for invite approvals, and robust query capabilities | Simpler key-value stores (Redis) or file-based storage cannot handle complex relationships or provide transactional guarantees |
| Discord OAuth + JWT Session | Need secure authentication; community already uses Discord as primary platform; OAuth simplifies onboarding | Email/password requires complex password management, reset flows, and security overhead; pure OAuth without JWT complicates API auth |
| React Query | Need server state caching, automatic refetching, optimistic updates, and request deduplication | Raw fetch/axios with useState leads to race conditions, stale data, and excessive re-renders; Context API alone doesn't solve these |
| Monorepo Structure | Need shared TypeScript types between frontend/backend, coordinated deployments, and unified repository management | Separate repos create type drift, coordination overhead, and complicate local development setup |

### Complexity Avoided

- **No GraphQL**: REST is sufficient for our data access patterns; GraphQL adds complexity without clear benefit
- **No Microservices**: Single API service handles all domains; our scale doesn't justify distributed systems complexity
- **No Server-Side Rendering**: SPA with client routing is adequate; SSR adds deployment complexity for minimal SEO benefit (community site, not public-facing docs)
- **No UI Component Library**: Custom components with Headless UI for accessibility is cleaner than learning/customizing Material-UI or Chakra
- **No WebSockets**: Polling for new events/updates is sufficient; real-time features are explicitly out of scope

## Phase Breakdown

### Phase 0: Infrastructure & Foundation (Pre-Implementation)

**Goal**: Set up backend service, database, Azure infrastructure, and development environment without breaking existing site.

**Duration Estimate**: 3-5 days

**Tasks**:
1. Create `api/` directory with Fastify + TypeScript setup
2. Configure Prisma with PostgreSQL connection
3. Design and implement database schema (all entities from spec)
4. Create Azure resources (App Service, PostgreSQL, Static Web Apps)
5. Update GitHub Actions for dual deployment (frontend to Static Web Apps, backend to App Service)
6. Set up environment variables and secrets in Azure Key Vault
7. Create seed data for local development
8. Configure CORS for frontend-backend communication
9. Set up Application Insights for monitoring
10. Update README.md with setup instructions

**Testing**: 
- Database connection and migrations work locally and in Azure
- Frontend still builds and deploys to production (no breaking changes)
- Backend health check endpoint returns 200

**Success Criteria**:
- Existing site remains functional at production URL
- Backend API accessible at `api.spacecityeidolons.com` or subdirectory
- Database migrations run successfully
- CI/CD pipelines green for both frontend and backend

**Rollback Strategy**: Revert GitHub Actions changes, delete Azure resources, remove `api/` directory

---

### Phase 1: P1 - Public Landing Page & Invite Requests

**Goal**: Implement first user story - public landing page with community info and invite request forms.

**Duration Estimate**: 4-6 days

**Prerequisites**: Phase 0 complete

**Frontend Work**:
1. Refactor existing `App.tsx` into `HomePage.tsx`
2. Install and configure React Router
3. Create layout components (Header, Footer, Navigation)
4. Design and implement invite request forms (Discord and Matrix)
5. Create form validation with React Hook Form + Zod
6. Build public calendar view component
7. Create services for API communication
8. Add error handling and loading states
9. Maintain existing visual design and branding

**Backend Work**:
1. Create `/api/invites` endpoints (POST for create, GET for admin list)
2. Implement invite request service with database persistence
3. Add Zod validation schemas for invite requests
4. Create email notification service structure (emails not sent in v1, just logged)
5. Add API error handling middleware

**Database**:
- `invite_requests` table (already created in Phase 0 schema)

**Tests** (Written BEFORE implementation):
- **Frontend**: Render tests for invite forms, form validation, submission success/error
- **Backend**: API integration tests for POST/GET invite requests, validation edge cases
- **E2E**: Submit invite request, verify confirmation message

**Acceptance Validation**:
- All 8 acceptance scenarios from User Story 1 passing
- Existing "Coming Soon" page replaced with full landing page
- Invite requests stored in database
- Admin can view pending requests (basic API only, no UI yet)

**Rollback Strategy**: Feature flag to show old "Coming Soon" page, database rollback script for `invite_requests` table

---

### Phase 2: P2 - User Authentication & Registration

**Goal**: Implement Discord OAuth authentication system with automatic account creation on first login.

**Duration Estimate**: 4-6 days (simpler than email/password due to no password management complexity)

**Prerequisites**: Phase 1 complete, Discord OAuth application registered

**Frontend Work**:
1. Create AuthContext for global auth state
2. Build LoginPage with "Login with Discord" button
3. Build OAuth callback page at `/auth/callback` to handle Discord redirect
4. Create ProtectedRoute component for auth gating
5. Implement JWT token storage (localStorage) and refresh logic
6. Add axios interceptors for auth headers and token refresh
7. Create logout functionality
8. Show Discord username/avatar in navigation when logged in
9. Show login button in navigation when logged out

**Backend Work**:
1. Register Discord OAuth application and obtain client ID/secret
2. Implement `/api/auth/discord` endpoint to initiate OAuth flow (redirect to Discord)
3. Implement `/api/auth/discord/callback` endpoint to handle OAuth callback
4. Exchange Discord authorization code for access token
5. Fetch Discord user data (`identify` and `email` scopes)
6. Create User record on first login with Discord ID, username, email, avatar
7. Auto-create Profile record for new users
8. Generate JWT access + refresh tokens for session management
9. Implement `/api/auth/refresh` endpoint for token refresh
10. Implement `/api/auth/logout` endpoint (revoke refresh token)
11. Update JWT middleware to verify tokens on protected routes

**Database**:
- Update `users` table: add `discordId`, `discordUsername`, `avatarUrl`; remove `password` field
- `refresh_tokens` table for JWT session management (already created in Phase 0)
- Remove `password_reset_tokens` table (not needed with OAuth)

**Tests** (Written BEFORE implementation):
- **Frontend**: OAuth redirect flow, callback handling, token storage, protected route redirects
- **Backend**: OAuth code exchange, user creation logic, JWT generation/verification, auth middleware
- **E2E**: Complete Discord OAuth login flow, access protected pages, logout

**Acceptance Validation**:
- All 6 acceptance scenarios from User Story 2 passing
- Users can log in via Discord OAuth
- First-time users get account + profile auto-created
- Sessions persist across page refreshes
- Protected routes require authentication
- JWTs expire and refresh automatically
- Logout clears session correctly

**Rollback Strategy**: Disable OAuth routes, remove ProtectedRoute wrapper, database rollback for user table changes

---

### Phase 3: P3 - Member Profile Management

**Goal**: Implement member profiles with bio, Twitch URL, games played, and granular privacy controls.

**Duration Estimate**: 6-8 days

**Prerequisites**: Phase 2 complete

**Frontend Work**:
1. Create ProfilePage to view profiles
2. Create ProfileEditPage for editing
3. Build ProfileCard component
4. Build ProfileEditor component with sections (bio, Twitch, games)
5. Implement PrivacyToggle component for per-field visibility
6. Create game tag selector (autocomplete or multi-select)
7. Add Twitch URL validation
8. Show different views based on role (guest/member/admin)
9. Add profile link to navigation when logged in

**Backend Work**:
1. Implement `/api/profiles/:userId` endpoints (GET, PUT)
2. Implement `/api/profiles` endpoint (GET all, with privacy filtering)
3. Create profile service with privacy enforcement logic
4. Add Twitch URL format validation
5. Create games list endpoint for tag selection
6. Implement auto-profile-creation on user registration
7. Add middleware to enforce users can only edit their own profiles (unless admin)

**Database**:
- `profiles` table (already created in Phase 0 schema)
- Privacy settings stored as JSON or separate columns

**Tests** (Written BEFORE implementation):
- **Frontend**: Profile editing, privacy toggle changes, different role views
- **Backend**: Profile CRUD, privacy filtering logic, authorization checks, Twitch URL validation
- **E2E**: Create profile, set fields to private, verify guest cannot see them

**Acceptance Validation**:
- All 10 acceptance scenarios from User Story 3 passing
- Members can edit their profiles
- Privacy settings correctly hide/show fields based on viewer role
- Guests only see public fields
- Admins see all fields

**Rollback Strategy**: Hide profile pages with feature flag, database rollback for profiles table

---

### Phase 4: P3 - Public Calendar & Event Discovery

**Goal**: Display community calendar with public events visible to all users.

**Duration Estimate**: 5-7 days

**Prerequisites**: Phase 2 complete (can run parallel to Phase 3)

**Frontend Work**:
1. Create CalendarPage with month/week/day views
2. Build Calendar component using date-fns for date logic
3. Build EventCard component for event display
4. Build EventDetails modal/page
5. Add date range filtering
6. Add game filtering (show only events for specific game)
7. Implement different event visibility based on user role
8. Add calendar link to navigation

**Backend Work**:
1. Implement `/api/events` endpoint (GET with filters: date range, visibility, game)
2. Implement `/api/events/:id` endpoint (GET single event)
3. Create event service with visibility filtering logic
4. Add query parameter validation for filters

**Database**:
- `events` table (already created in Phase 0 schema)

**Tests** (Written BEFORE implementation):
- **Frontend**: Calendar rendering, date navigation, event filtering, visibility logic
- **Backend**: Event retrieval with filters, visibility enforcement
- **E2E**: View calendar, filter by date, click event details

**Acceptance Validation**:
- All 6 acceptance scenarios from User Story 4 passing
- Calendar displays public events to all users
- Members see their own private events
- Admins see all events
- Date filtering works correctly

**Rollback Strategy**: Hide calendar page with feature flag, no database changes needed

---

### Phase 5: P4 - Private Event Creation

**Goal**: Allow non-admin members to create private calendar events.

**Duration Estimate**: 4-6 days

**Prerequisites**: Phase 4 complete

**Frontend Work**:
1. Create EventCreatePage with form
2. Build EventForm component with validation
3. Add "Create Event" button to calendar
4. Implement event editing (own events only)
5. Implement event deletion (own events only)
6. Add game association selector (optional)
7. Private visibility is default for non-admin users

**Backend Work**:
1. Implement `/api/events` POST endpoint (create event)
2. Implement `/api/events/:id` PUT endpoint (update event)
3. Implement `/api/events/:id` DELETE endpoint (delete event)
4. Add authorization middleware (users can only edit/delete their own events)
5. Validate event data (date not in past, required fields)

**Database**:
- Uses existing `events` table

**Tests** (Written BEFORE implementation):
- **Frontend**: Event form validation, create/edit/delete flows
- **Backend**: Event CRUD with authorization, validation rules
- **E2E**: Create private event, edit it, delete it, verify non-creator cannot edit

**Acceptance Validation**:
- All 8 acceptance scenarios from User Story 5 passing
- Members can create private events
- Events default to private visibility
- Members can edit and delete their own events
- Other members cannot see private events

**Rollback Strategy**: Remove create event button and form, disable POST/PUT/DELETE endpoints

---

### Phase 6: P4 - Game Page Request Workflow

**Goal**: Allow members to request new game pages with admin approval and auto-creation.

**Duration Estimate**: 5-7 days

**Prerequisites**: Phase 2 complete (can run parallel to other P4 work)

**Frontend Work**:
1. Create GamesPage listing all game pages
2. Create GameDetailsPage for individual game pages
3. Create GameRequestPage with request form
4. Build GameRequestForm component
5. Display request status for users who submitted
6. Add "Request New Game" button to games page
7. Show duplicate detection message

**Backend Work**:
1. Implement `/api/games` endpoints (GET all, POST create)
2. Implement `/api/games/:id` endpoint (GET single game)
3. Implement `/api/game-requests` endpoints (POST create, GET user's requests)
4. Create game page template structure
5. Add duplicate game detection logic
6. Validate game request data

**Database**:
- `games` table (already created in Phase 0 schema)
- `game_page_requests` table

**Tests** (Written BEFORE implementation):
- **Frontend**: Game page display, request form, status display
- **Backend**: Game CRUD, request creation, duplicate detection
- **E2E**: Submit game request, check status, detect duplicates

**Acceptance Validation**:
- All 7 acceptance scenarios from User Story 6 passing
- Members can request new game pages
- System detects duplicate requests
- Request status is visible to requester

**Rollback Strategy**: Hide game request feature with feature flag, database rollback for game requests table

---

### Phase 7: P5 - Admin User Management

**Goal**: Provide admin interface for managing users, roles, and invite requests.

**Duration Estimate**: 5-7 days

**Prerequisites**: Phases 1-2 complete

**Frontend Work**:
1. Create AdminDashboard with navigation to admin features
2. Create AdminUsersPage with user table
3. Create UserTable component with actions (promote, suspend, view)
4. Create AdminInvitesPage with invite request table
5. Build InviteRequestTable component with approve/reject actions
6. Add admin-only navigation items
7. Implement confirmation modals for destructive actions

**Backend Work**:
1. Implement `/api/admin/users` endpoints (GET all, PUT update role/status)
2. Implement `/api/admin/invites/:id/approve` endpoint (approve invite, create invite link/code)
3. Implement `/api/admin/invites/:id/reject` endpoint (reject with reason)
4. Add admin role middleware for all admin routes
5. Create invite approval logic (send notification - logged only in v1)
6. Implement user suspension logic (prevent login)

**Database**:
- Uses existing `users` and `invite_requests` tables

**Tests** (Written BEFORE implementation):
- **Frontend**: Admin pages render, user actions work, authorization checks
- **Backend**: Admin endpoints with role checks, user management operations, invite approval flow
- **E2E**: Login as admin, promote user, suspend user, approve invite request

**Acceptance Validation**:
- All 7 acceptance scenarios from User Story 7 passing
- Admins can view all users
- Admins can promote/demote roles
- Admins can suspend accounts
- Admins can approve/reject invites

**Rollback Strategy**: Remove admin navigation, disable admin endpoints with middleware

---

### Phase 8: P5 - Admin Game Page & Public Event Management

**Goal**: Complete admin capabilities for creating game pages, approving requests, and managing public events.

**Duration Estimate**: 5-7 days

**Prerequisites**: Phases 4, 6, and 7 complete

**Frontend Work**:
1. Add "Create Game Page" admin feature to games page
2. Build GameForm component for admins
3. Create AdminGameRequestsPage for reviewing pending requests
4. Build GameRequestTable component with approve/reject actions
5. Add admin approval workflow UI
6. Allow admins to create public events (extend EventForm)
7. Allow admins to edit any event (add admin edit button)
8. Allow admins to delete any event

**Backend Work**:
1. Implement `/api/admin/games` POST endpoint (direct game creation)
2. Implement `/api/admin/games/:id` PUT endpoint (edit game page)
3. Implement `/api/admin/game-requests` GET endpoint (all pending requests)
4. Implement `/api/admin/game-requests/:id/approve` endpoint (auto-create game page)
5. Implement `/api/admin/game-requests/:id/reject` endpoint (reject with reason)
6. Update event endpoints to allow admins to edit/delete any event
7. Add public visibility option for admin-created events
8. Create game page from template on approval

**Database**:
- Uses existing `games`, `game_page_requests`, and `events` tables

**Tests** (Written BEFORE implementation):
- **Frontend**: Admin game creation, request approval, public event creation
- **Backend**: Admin game operations, auto-creation on approval, admin event permissions
- **E2E**: Login as admin, create game page, approve game request (verify page created), create public event

**Acceptance Validation**:
- All 8 acceptance scenarios from User Story 8 passing
- Admins can create game pages directly
- Admins can approve game requests with auto-creation
- Admins can create public events
- Admins can edit/delete any event

**Rollback Strategy**: Remove admin game features, disable admin game endpoints

---

### Phase 9: Polish & Optimization

**Goal**: Performance optimization, accessibility improvements, and user experience polish.

**Duration Estimate**: 4-5 days

**Prerequisites**: All previous phases complete

**Tasks**:
1. Run Lighthouse audits and fix performance issues
2. Optimize bundle size (code splitting, lazy loading)
3. Run axe-core accessibility audit and fix issues
4. Add loading skeletons for better perceived performance
5. Implement optimistic updates for common actions
6. Add error boundaries for graceful failure handling
7. Improve mobile responsive design
8. Add keyboard shortcuts for power users
9. Review and improve all error messages
10. Add success notifications/toasts
11. Final cross-browser testing
12. Security audit (SQL injection prevention, XSS checks, CSRF protection)

**Testing**:
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS, Android)
- Accessibility testing with screen readers
- Load testing with k6 or Artillery
- Security testing with OWASP ZAP

**Success Criteria**:
- Lighthouse score > 90 for all categories
- WCAG 2.1 AA compliance validated
- No critical security vulnerabilities
- Load time < 3 seconds on 3G connection
- API can handle 100 concurrent users

---

### Phase 10: Documentation & Deployment

**Goal**: Complete documentation and prepare for production launch.

**Duration Estimate**: 2-3 days

**Prerequisites**: Phase 9 complete

**Tasks**:
1. Write comprehensive README.md
2. Create ARCHITECTURE.md with system design diagrams
3. Generate API.md from OpenAPI spec
4. Write CONTRIBUTING.md for future developers
5. Document environment variables and configuration
6. Create runbook for common operational tasks
7. Set up monitoring alerts in Application Insights
8. Create backup and disaster recovery plan
9. Final production deployment
10. Smoke test in production

**Deliverables**:
- Complete documentation set
- Production deployment with monitoring
- Backup procedures documented
- Team trained on operational procedures

## Migration Strategy

### Preserving Existing Site

**Current State**: Simple React SPA with "Coming Soon" message, deployed to server via SCP.

**Migration Approach**:

1. **Phase 0**: Deploy backend and update frontend build process without changing frontend code
   - Frontend continues to build and deploy as before
   - Backend deploys to new Azure App Service
   - No user-visible changes

2. **Phase 1**: Replace "Coming Soon" content with full landing page
   - Existing users see updated content at same URL
   - All new functionality is additive (invite forms)
   - No breaking changes to existing pages

3. **Gradual Feature Rollout**: Each phase adds new pages/features without modifying existing ones
   - Use React Router for new pages
   - Existing `/` route shows enhanced landing page
   - New routes like `/login`, `/calendar`, `/profile` added incrementally

4. **DNS and Deployment**: 
   - Migrate from SCP deployment to Azure Static Web Apps in Phase 0
   - Update DNS to point to Azure (if not already)
   - Backend API at `api.spacecityeidolons.com` or `spacecityeidolons.com/api`

### Rollback Plan

Each phase includes specific rollback strategy. General rollback approach:

1. **Frontend**: Feature flags can disable new pages/components, reverting to previous behavior
2. **Backend**: Gradual API deployment with health checks; rollback via GitHub Actions
3. **Database**: Prisma migrations support rollback; critical migrations have tested rollback scripts
4. **Infrastructure**: Azure resources can be deleted or reverted to previous configuration

**Zero-Downtime Deployment**: 
- Frontend: Azure Static Web Apps handles blue-green deployment automatically
- Backend: Azure App Service deployment slots allow testing before swapping to production
- Database: Migrations run during off-peak hours with backwards-compatible changes

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Database migration failure in production | Medium | High | Test migrations thoroughly in staging; write rollback scripts; backup before migration; use Prisma's shadow database feature |
| JWT token security vulnerability | Low | Critical | Use industry-standard libraries (jsonwebtoken); implement refresh token rotation; set appropriate expiration times; follow OWASP guidelines |
| Performance degradation with complex queries | Medium | Medium | Index database properly; use query profiling; implement caching with React Query; monitor with Application Insights |
| Accessibility issues not caught in testing | Medium | Medium | Use automated tools (axe-core, Lighthouse); manual testing with screen readers; follow WCAG guidelines strictly |
| Azure cost overrun | Low | Low | Start with smallest tiers (B1ms database, B1 App Service); monitor costs with Azure Cost Management; set up billing alerts |

### Project Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Scope creep beyond 8 user stories | Medium | Medium | Strictly follow constitution; add new features only as new user stories with proper spec/plan; maintain "Out of Scope" list |
| Estimation errors causing delays | High | Low | Use incremental phases; deliver value early (P1 MVP); adjust subsequent phases based on learnings |
| Breaking existing site deployment | Low | High | Phase 0 deploys backend without frontend changes; test both old and new deployment methods; maintain rollback capability |
| Missing edge cases in specification | Medium | Medium | Detailed edge case section in spec; write tests first (TDD); code review for error handling |

### Dependencies

| Dependency | Risk Level | Impact if Unavailable | Contingency |
|------------|-----------|----------------------|-------------|
| Azure availability | Low | Cannot deploy or serve site | Multi-region setup for production (future); status page for incidents; local development unaffected |
| GitHub Actions | Low | Cannot deploy automatically | Manual deployment process documented; can deploy via Azure CLI |
| PostgreSQL | Medium | Data access fails | Database connection retry logic; health checks; failover replica (future) |
| Node.js 20 LTS | Low | Runtime unavailable | Pin specific version; Docker containers for consistency |

## Success Metrics

### Technical Metrics

- **Test Coverage**: > 80% line coverage for frontend and backend
- **Performance**: Lighthouse score > 90, API p95 < 200ms
- **Availability**: > 99.5% uptime (measured over 30 days)
- **Security**: Zero critical vulnerabilities in dependency scans
- **Build Time**: Frontend build < 2 minutes, backend build < 1 minute

### User Metrics

- **Engagement**: > 60% of registered users create a profile within first week
- **Stability**: < 5% error rate on critical user flows (login, profile creation, event creation)
- **Usability**: Users complete primary tasks (from spec success criteria) in specified time limits
- **Retention**: > 70% of registered users return within 7 days

### Process Metrics

- **Code Review**: All PRs reviewed within 24 hours
- **Issue Resolution**: Bugs triaged within 48 hours, critical bugs fixed within 1 week
- **Documentation**: All new features documented before merge
- **Constitution Compliance**: 100% of PRs pass constitutional checks

## Timeline Estimate

**Total Duration**: 10-14 weeks (phases can run in parallel where indicated)

- **Phase 0**: 1 week (Infrastructure)
- **Phase 1**: 1 week (P1 - Landing Page)
- **Phase 2**: 1.5 weeks (P2 - Auth)
- **Phase 3**: 1.5 weeks (P3 - Profiles)
- **Phase 4**: 1 week (P3 - Calendar) - Can parallel with Phase 3
- **Phase 5**: 1 week (P4 - Event Creation)
- **Phase 6**: 1 week (P4 - Game Requests) - Can parallel with Phase 5
- **Phase 7**: 1 week (P5 - Admin Users)
- **Phase 8**: 1 week (P5 - Admin Games)
- **Phase 9**: 1 week (Polish)
- **Phase 10**: 0.5 weeks (Documentation)

**Critical Path**: Phase 0 → Phase 1 → Phase 2 → Phase 5 → Phase 9 → Phase 10

**Parallel Opportunities**: Phases 3-4 can run together; Phases 5-6 can run together

## Open Questions

1. **Email Service**: Which Azure service for emails (Communication Services vs SendGrid)? Decision deferred to Phase 1.
2. **Profile Photos**: Allow users to upload profile pictures? Out of scope for v1, but database schema should accommodate.
3. **Time Zones**: How to handle user time zones for events? Default to server time in v1, add timezone support in future.
4. **Admin Bootstrap**: How is the first admin created? Manual database insert for v1, document in runbook.
5. **Rate Limiting**: Should API have rate limiting? Not in v1 (small scale), add when needed.
6. **Search**: Full-text search for profiles, events, games? Out of scope for v1, table pagination sufficient.
7. **Markdown Support**: Allow markdown in bios, event descriptions? Nice-to-have, not in v1.

## Next Steps

1. **Review this plan**: Team review for technical approach validation
2. **Get approval**: User/stakeholder approval before Phase 0
3. **Create Phase 0 tasks**: Generate detailed tasks.md for infrastructure phase
4. **Set up Azure resources**: Provision infrastructure for development environment
5. **Begin Phase 0**: Start infrastructure work while continuing planning for Phase 1

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-23  
**Status**: Draft - Awaiting Approval  
**Next Review**: After Phase 0 completion
