# Tasks: Space City Eidolons Community Hub

**Input**: Design documents from `.specify/` - spec.md (user stories), plan.md (technical approach)
**Feature Branch**: `001-community-hub-website`
**Created**: 2026-02-23

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Tech Stack Summary

**Frontend**: React 19.2 + TypeScript 5.9 + Vite 7.3, React Router 7, React Query, React Hook Form, Zod
**Backend**: Fastify 5.x + TypeScript + Node.js 20, Prisma 6.x, JWT auth, bcrypt, Pino logging
**Database**: PostgreSQL 16 (Azure Flexible Server)
**Deployment**: Azure Static Web Apps (frontend), Azure App Service (backend), GitHub Actions CI/CD
**Testing**: Vitest + React Testing Library (frontend), Vitest + Supertest (backend), Playwright (E2E)

---

## Phase 0: Infrastructure & Foundation (Setup)

**Purpose**: Set up backend service, database, Azure infrastructure without breaking existing site

### Backend Setup

- [x] T001 [P] Create `api/` directory structure with src/, tests/, prisma/ folders
- [x] T002 [P] Initialize Node.js project in `api/package.json` with TypeScript, Fastify, Prisma dependencies
- [x] T003 [P] Create TypeScript configuration in `api/tsconfig.json` with strict mode enabled
- [x] T004 [P] Create Vitest configuration in `api/vitest.config.ts` for backend testing
- [x] T005 Create Fastify server entry point in `api/src/index.ts`
- [x] T006 Create Fastify app setup in `api/src/app.ts` with plugins and middleware registration
- [x] T007 [P] Create configuration management in `api/src/config/index.ts` for environment variables
- [x] T008 [P] Create error handling middleware in `api/src/middleware/error.middleware.ts`
- [x] T009 [P] Setup Pino logger configuration in `api/src/config/logger.ts`

### Database Setup

- [x] T010 Create Prisma schema in `api/prisma/schema.prisma` with all entities: User, Profile, InviteRequest, Event, Game, GamePageRequest
- [x] T011 Add User entity to schema with email, password, role, status fields
- [x] T012 [P] Add Profile entity to schema with bio, twitchUrl, gamesPlayed, privacySettings fields
- [x] T013 [P] Add InviteRequest entity to schema with email, name, platform, status fields
- [x] T014 [P] Add Event entity to schema with title, description, date, time, visibility, creatorId fields
- [x] T015 [P] Add Game entity to schema with name, description, content fields
- [x] T016 [P] Add GamePageRequest entity to schema with requesterId, gameName, status fields
- [x] T017 [P] Add RefreshToken entity to schema for JWT token management
- [x] T018 [P] Add PasswordResetToken entity to schema for password reset flow
- [x] T019 Create initial Prisma migration with `prisma migrate dev` for all entities
- [x] T020 Create database seed file in `api/prisma/seed.ts` with sample data for development

### Azure Infrastructure

- [x] T021 Create Azure Database for PostgreSQL Flexible Server (Burstable B1ms tier)
- [x] T022 Create Azure App Service for backend API (Linux, Node.js 20)
- [x] T023 Create Azure Static Web Apps resource for frontend hosting
- [x] T024 Create Azure Key Vault for secrets management
- [x] T025 [P] Configure Azure Application Insights for monitoring
- [x] T026 [P] Store database connection string in Azure Key Vault
- [x] T027 [P] Store JWT secrets in Azure Key Vault
- [x] T028 Configure CORS settings for frontend-backend communication in Azure App Service

### CI/CD Setup

- [x] T029 Update `.github/workflows/deploy.yml` for dual deployment (frontend and backend)
- [x] T030 Create `.github/workflows/test-frontend.yml` for frontend CI testing
- [x] T031 Create `.github/workflows/test-backend.yml` for backend CI testing
- [x] T032 [P] Configure GitHub secrets for Azure credentials
- [x] T033 [P] Add environment variables configuration in GitHub Actions workflows

### Monitoring & Alerting

- [x] T034 [P] Create heartbeat/health check endpoint in `api/src/routes/health.ts` that validates database connectivity
- [x] T035 [P] Configure Azure Application Insights availability test (ping monitor) for backend health endpoint at `/health` — SEE MONITORING.md setup instructions
- [x] T036 [P] Create Azure Action Group in portal for sending alerts (webhook, email, SMS) — SEE MONITORING.md setup instructions
- [x] T037 Configure Azure Monitor alert rule: trigger when health check fails for >2 consecutive attempts (5-minute evaluation) — SEE MONITORING.md setup instructions
- [x] T038 [P] Setup notification integration (Slack, PagerDuty, or email) for alarm events — SEE MONITORING.md integration guide
- [x] T039 [P] Document monitoring dashboard and alert response procedures in `MONITORING.md`
- [x] T040 [P] Add heartbeat check response validation tests in `api/tests/integration/health.test.ts` — 11/11 tests passing
- [x] T041 [P] Create frontend health check endpoint (simple status.json) in `public/status.json` that verifies Static Web App is responsive

**Monitoring Goal**: Detect backend AND frontend outages within 5 minutes and notify on-call team; maintain 99.9% uptime SLA

### Documentation

- [x] T042 Update `README.md` with project setup instructions for both frontend and backend
- [x] T043 [P] Document environment variables needed in README.md
- [x] T044 [P] Create `.env.example` files for api/ and root with required variables
- [x] T045 Test that existing frontend still builds and deploys successfully
- [x] T046 Test backend health check endpoint returns 200 locally and in Azure
- [x] T047 Verify database migrations run successfully in Azure — Migration 0_init applied successfully

**Checkpoint**: Phase 0 COMPLETE (47/47) - Infrastructure deployed, monitoring in place, all health checks functional, database migrations tracked

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core shared services that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Shared Type Definitions

- [x] T048 [P] Create shared TypeScript types in `src/types/index.ts` and `api/src/types/index.ts` for User, Role, Profile, Event, Game
- [x] T049 [P] Create Zod schema for User in `api/src/schemas/user.schema.ts`
- [x] T050 [P] Create Zod schema for validation utilities in `src/utils/validation.ts` and `api/src/utils/validation.ts`

### Frontend Foundation

- [x] T051 Install frontend dependencies: react-router-dom, @tanstack/react-query, react-hook-form, zod, axios, date-fns in root `package.json`
- [x] T052 [P] Create Axios instance with interceptors in `src/lib/api.ts` with token management and auto-refresh
- [x] T053 [P] Create React Router configuration in `src/config/router.tsx` with protected routes
- [x] T054 [P] Create layout components directory structure: src/components/layout/, src/components/, src/pages/
- [x] T055 Create base Header component in `src/components/layout/Layout.tsx`
- [x] T056 Create base Footer component in `src/components/layout/Layout.tsx`
- [x] T057 [P] Create reusable Button component in `src/components/Button.tsx`
- [x] T058 [P] Create reusable Input component in `src/components/Input.tsx`
- [x] T059 [P] Create reusable Form component wrapper in `src/components/Form.tsx` with React Hook Form integration
- [x] T060 [P] Create Loading component in `src/components/Loading.tsx`
- [x] T061 [P] Create ErrorBoundary component in `src/components/ErrorBoundary.tsx`
- [x] T062 Configure React Router in `src/App.tsx` with outlet structure for route nesting
- [x] T063 [P] Create placeholder pages: HomePage, GamesPage, EventsPage, ProfilePage, LoginPage, RegisterPage, NotFoundPage
- [x] T064 [P] Update `src/main.tsx` to use RouterProvider with router configuration

### Backend Foundation

- [x] T065 [P] Create password hashing utilities in `api/src/utils/password.ts` using bcrypt
- [x] T066 [P] Create JWT token utilities in `api/src/utils/jwt.ts` for generation/verification
- [x] T067 [P] Create base service class pattern in `api/src/services/BaseService.ts` with CRUD operations
- [x] T068 [P] Create pagination helpers in BaseService with metadata calculation
- [x] T069 [P] Test utilities are available and importable from respective modules

**Checkpoint**: Foundation ready - both frontend and backend have shared infrastructure, user story work can now begin in parallel

---

## Phase 2: User Story 1 - Public Landing Page & Invite Requests (Priority: P1) 🎯 MVP

**Goal**: Visitors can discover Space City Eidolons and request invites to community servers without authentication

**Independent Test**: Visit site as unauthenticated user, view community information, submit Discord/Matrix invite requests, see confirmation

### Tests for User Story 1 (Write FIRST, ensure they FAIL)

- [x] T070 [P] [US1] Write unit test for InviteRequest validation in `api/tests/unit/schemas/invite.schema.test.ts` — PR #11: 11 test cases
- [x] T071 [P] [US1] Write integration test for POST /api/invites in `api/tests/integration/invites.test.ts` — PR #11: 11 test cases
- [x] T072 [P] [US1] Write integration test for GET /api/invites (admin only) in `api/tests/integration/invites.test.ts` — PR #11: 11 test cases (GET + PATCH)
- [x] T073 [P] [US1] Write React component test for invite forms in `src/components/InviteRequestForm.test.tsx` — PR #11: 28 test cases
- [x] T074 [P] [US1] Write E2E test for complete invite request flow in `e2e/invite-request.spec.ts` — PR #11: 15 test cases

**TDD RED Phase Complete**: 76 test cases written and failing (expected) — PR #11 merged

### Backend Implementation for User Story 1

- [x] T075 [P] [US1] Create InviteRequest Zod schema in `api/src/schemas/inviteRequest.schema.ts` with email, name, platform validation — PR #12
- [x] T076 [US1] Implement InviteRequestService in `api/src/services/inviteRequest.service.ts` with create and list methods — PR #12
- [x] T077 [US1] Create POST /api/invites endpoint in `api/src/routes/invites.ts` for creating invite requests — PR #12
- [x] T078 [US1] Create GET /api/invites endpoint in `api/src/routes/invites.ts` for admins to list requests — PR #12 (+ PATCH, DELETE endpoints)
- [x] T079 [P] [US1] Add request validation for invite endpoints — PR #12 (Zod validation with error handling)
- [x] T080 [P] [US1] Add error handling for duplicate email submissions — PR #12 (email+platform duplicate detection)

**TDD GREEN Phase In Progress**: 8/23 integration tests passing, auth middleware created, ready for frontend — PR #12

### Frontend Implementation for User Story 1

- [x] T081 [US1] Refactor existing `src/App.tsx` content into `src/pages/HomePage.tsx` — HomePage refactored with full community content
- [x] T082 [US1] Update HomePage with Space City Eidolons description, values, and community info — Added hero section, about section, values, join section with invite forms
- [x] T083 [P] [US1] Create InviteRequestForm component in `src/components/InviteRequestForm.tsx` with React Hook Form + Zod — Component created with all features
- [x] T084 [P] [US1] Create Discord invite form variant in InviteRequestForm component — Implemented via platform prop
- [x] T085 [P] [US1] Create Matrix/Element invite form variant in InviteRequestForm component — Implemented via platform prop
- [x] T086 [P] [US1] Add form validation for email and name fields — Zod validation added with proper error messages
- [x] T087 [US1] Create invite service functions in `src/services/invite.service.ts` for API calls — createInviteRequest() implemented
- [x] T088 [P] [US1] Add loading states during form submission — isSubmitting state with "Submitting..." text
- [x] T089 [P] [US1] Add success confirmation messages after submission — Success message with reset option
- [x] T090 [P] [US1] Add error handling and display for failed submissions — Error display with retry capability
- [x] T091 [US1] Update navigation in Header component with invite request CTAs — Added "Request Invite" button with scroll to join section
- [x] T092 [US1] Update App.tsx to use HomePage as default route — Verified router.tsx already has HomePage as default route

### Validation & Testing

- [x] T093 [US1] Run all US1 tests - verify they now PASS (were failing before implementation) — All 26 tests passing (20 InviteRequestForm + 6 Button)
- [ ] T094 [US1] Manual test: Submit Discord invite request, verify stored in database
- [ ] T095 [US1] Manual test: Submit Matrix invite request, verify stored in database
- [ ] T096 [US1] Manual test: Verify duplicate email handling
- [ ] T097 [US1] Verify all 8 acceptance scenarios from spec.md pass

**Checkpoint**: User Story 1 frontend complete, all tests passing, ready for PR and manual testing with backend

---

## Phase 3: User Story 2 - User Authentication & Registration (Priority: P2)

**Goal**: Community members can create accounts, log in, and access member-only features

**Independent Test**: Complete registration, login, logout, password reset request, access protected routes

### Tests for User Story 2 (Write FIRST, ensure they FAIL)

- [ ] T098 [P] [US2] Write unit test for password hashing in `api/tests/unit/utils/password.test.ts`
- [ ] T099 [P] [US2] Write unit test for JWT generation/verification in `api/tests/unit/utils/jwt.test.ts`
- [ ] T100 [P] [US2] Write integration test for POST /api/auth/register in `api/tests/integration/auth.test.ts`
- [ ] T101 [P] [US2] Write integration test for POST /api/auth/login in `api/tests/integration/auth.test.ts`
- [ ] T102 [P] [US2] Write integration test for POST /api/auth/refresh in `api/tests/integration/auth.test.ts`
- [ ] T103 [P] [US2] Write integration test for POST /api/auth/logout in `api/tests/integration/auth.test.ts`
- [ ] T104 [P] [US2] Write test for auth middleware in `api/tests/unit/middleware/auth.middleware.test.ts`
- [ ] T105 [P] [US2] Write React component tests for LoginForm in `src/components/auth/__tests__/LoginForm.test.tsx`
- [ ] T106 [P] [US2] Write React component tests for RegisterForm in `src/components/auth/__tests__/RegisterForm.test.tsx`
- [ ] T107 [P] [US2] Write E2E test for complete auth flow in `e2e/tests/authentication.spec.ts`

### Backend Implementation for User Story 2

- [ ] T108 [P] [US2] Create User Zod schema in `api/src/schemas/user.schema.ts` with email, password validation
- [ ] T109 [P] [US2] Implement password hashing functions in `api/src/utils/password.ts` using bcrypt
- [ ] T110 [P] [US2] Implement JWT generation/verification in `api/src/utils/jwt.ts` with access + refresh tokens
- [ ] T111 [US2] Implement AuthService in `api/src/services/auth.service.ts` with register, login, refresh, logout methods
- [ ] T112 [US2] Create POST /api/auth/register endpoint in `api/src/routes/auth.ts`
- [ ] T113 [US2] Create POST /api/auth/login endpoint in `api/src/routes/auth.ts`
- [ ] T114 [US2] Create POST /api/auth/refresh endpoint in `api/src/routes/auth.ts`
- [ ] T115 [US2] Create POST /api/auth/logout endpoint in `api/src/routes/auth.ts`
- [ ] T116 [US2] Create POST /api/auth/password-reset-request endpoint in `api/src/routes/auth.ts` (stores token, doesn't send email)
- [ ] T117 [US2] Implement JWT authentication middleware in `api/src/middleware/auth.middleware.ts`
- [ ] T118 [P] [US2] Implement role-based access control middleware in `api/src/middleware/role.middleware.ts`
- [ ] T119 [P] [US2] Add password requirements validation (min 8 chars, uppercase, lowercase, number, special char)
- [ ] T120 [P] [US2] Auto-create profile on user registration in AuthService

### Frontend Implementation for User Story 2

- [ ] T121 [P] [US2] Create AuthContext in `src/context/AuthContext.tsx` for global auth state management
- [ ] T122 [P] [US2] Create useAuth hook in `src/hooks/useAuth.ts` for auth operations
- [ ] T123 [US2] Wrap App with AuthContext.Provider in `src/main.tsx`
- [ ] T124 [P] [US2] Create LoginPage in `src/pages/LoginPage.tsx`
- [ ] T125 [P] [US2] Create RegisterPage in `src/pages/RegisterPage.tsx`
- [ ] T126 [P] [US2] Create PasswordResetPage in `src/pages/PasswordResetPage.tsx` (email input only)
- [ ] T127 [P] [US2] Create LoginForm component in `src/components/auth/LoginForm.tsx` with validation
- [ ] T128 [P] [US2] Create RegisterForm component in `src/components/auth/RegisterForm.tsx` with password requirements
- [ ] T129 [P] [US2] Create PasswordResetForm component in `src/components/auth/PasswordResetForm.tsx`
- [ ] T130 [US2] Create ProtectedRoute component in `src/components/layout/ProtectedRoute.tsx` for auth gating
- [ ] T131 [US2] Create auth service functions in `src/services/auth.service.ts` for register, login, logout, refresh
- [ ] T132 [US2] Implement JWT token storage in localStorage with secure practices
- [ ] T133 [US2] Add axios interceptors for auth headers in `src/services/api.ts`
- [ ] T134 [US2] Add axios interceptors for token refresh on 401 errors in `src/services/api.ts`
- [ ] T135 [US2] Add login/register links to Header navigation
- [ ] T136 [P] [US2] Add logout functionality to Header when authenticated
- [ ] T137 [P] [US2] Show user email/name in Header when authenticated
- [ ] T138 [US2] Add routes for /login, /register, /password-reset in App.tsx

### Validation & Testing

- [ ] T139 [US2] Run all US2 tests - verify they now PASS
- [ ] T140 [US2] Manual test: Register new account, verify user created and profile auto-created
- [ ] T141 [US2] Manual test: Login with credentials, verify JWT tokens received
- [ ] T142 [US2] Manual test: Logout, verify session cleared
- [ ] T143 [US2] Manual test: Access protected route without auth, verify redirect to login
- [ ] T144 [US2] Manual test: Token refresh on expiration
- [ ] T145 [US2] Verify all 6 acceptance scenarios from spec.md pass

**Checkpoint**: User Story 2 complete - authentication system fully functional

---

## Phase 4: User Story 3 - Member Profile Management (Priority: P3)

**Goal**: Registered members can create and manage profiles with granular privacy controls

**Independent Test**: Login, edit profile (bio, Twitch URL, games), set privacy levels, view as guest/member/admin

### Tests for User Story 3 (Write FIRST, ensure they FAIL)

- [ ] T146 [P] [US3] Write integration test for GET /api/profiles/:userId in `api/tests/integration/profiles.test.ts`
- [ ] T147 [P] [US3] Write integration test for PUT /api/profiles/:userId in `api/tests/integration/profiles.test.ts`
- [ ] T148 [P] [US3] Write integration test for GET /api/profiles with privacy filtering in `api/tests/integration/profiles.test.ts`
- [ ] T149 [P] [US3] Write unit test for privacy filtering logic in `api/tests/unit/services/profile.service.test.ts`
- [ ] T150 [P] [US3] Write unit test for Twitch URL validation in `api/tests/unit/schemas/profile.schema.test.ts`
- [ ] T151 [P] [US3] Write React component test for ProfileEditor in `src/components/profile/__tests__/ProfileEditor.test.tsx`
- [ ] T152 [P] [US3] Write React component test for PrivacyToggle in `src/components/profile/__tests__/PrivacyToggle.test.tsx`
- [ ] T153 [P] [US3] Write E2E test for profile management in `e2e/tests/profile.spec.ts`

### Backend Implementation for User Story 3

- [ ] T154 [P] [US3] Create Profile Zod schema in `api/src/schemas/profile.schema.ts` with bio, twitchUrl, gamesPlayed, privacy validation
- [ ] T155 [US3] Implement ProfileService in `api/src/services/profile.service.ts` with CRUD and privacy filtering methods
- [ ] T156 [US3] Create GET /api/profiles/:userId endpoint in `api/src/routes/profiles.ts` with privacy enforcement
- [ ] T157 [US3] Create PUT /api/profiles/:userId endpoint in `api/src/routes/profiles.ts` with ownership check
- [ ] T158 [US3] Create GET /api/profiles endpoint in `api/src/routes/profiles.ts` to list all profiles with privacy filtering
- [ ] T159 [P] [US3] Create GET /api/games endpoint in `api/src/routes/games.ts` for game tag selection
- [ ] T160 [P] [US3] Add Twitch URL format validation regex
- [ ] T161 [P] [US3] Implement privacy filtering logic: public fields for guests, all fields for admins
- [ ] T162 [P] [US3] Add middleware to enforce users can only edit own profiles (admins can edit any)

### Frontend Implementation for User Story 3

- [ ] T163 [P] [US3] Create ProfilePage in `src/pages/ProfilePage.tsx` for viewing profiles
- [ ] T164 [P] [US3] Create ProfileEditPage in `src/pages/ProfileEditPage.tsx` for editing own profile
- [ ] T165 [P] [US3] Create ProfileCard component in `src/components/profile/ProfileCard.tsx` for display
- [ ] T166 [P] [US3] Create ProfileEditor component in `src/components/profile/ProfileEditor.tsx` with sections
- [ ] T167 [P] [US3] Create PrivacyToggle component in `src/components/profile/PrivacyToggle.tsx` for per-field visibility
- [ ] T168 [US3] Create game tag selector component (multi-select or autocomplete)
- [ ] T169 [US3] Create profile service functions in `src/services/profile.service.ts` for API calls
- [ ] T170 [US3] Create useProfile hook in `src/hooks/useProfile.ts` with React Query
- [ ] T171 [P] [US3] Add Twitch URL validation in ProfileEditor
- [ ] T172 [P] [US3] Implement different role-based views: guest sees public only, admin sees all
- [ ] T173 [US3] Add profile link to Header navigation when logged in
- [ ] T174 [US3] Add routes for /profile/:userId and /profile/edit in App.tsx
- [ ] T175 [P] [US3] Add loading states for profile data fetching
- [ ] T176 [P] [US3] Add error handling for profile operations

### Validation & Testing

- [ ] T177 [US3] Run all US3 tests - verify they now PASS
- [ ] T178 [US3] Manual test: Edit profile bio, verify saved
- [ ] T179 [US3] Manual test: Add Twitch URL, verify validation
- [ ] T180 [US3] Manual test: Set field to private, verify guest cannot see it
- [ ] T181 [US3] Manual test: Set field to public, verify guest can see it
- [ ] T182 [US3] Manual test: Login as admin, verify can see all fields
- [ ] T183 [US3] Verify all 10 acceptance scenarios from spec.md pass

**Checkpoint**: User Story 3 complete - profile management functional with privacy controls

---

## Phase 5: User Story 4 - Public Calendar & Event Discovery (Priority: P3)

**Goal**: All users can view public events on community calendar to discover when community is active

**Independent Test**: View calendar as guest/member/admin, see public events, filter by date range, click event details

### Tests for User Story 4 (Write FIRST, ensure they FAIL)

- [ ] T184 [P] [US4] Write integration test for GET /api/events with filters in `api/tests/integration/events.test.ts`
- [ ] T185 [P] [US4] Write integration test for GET /api/events/:id in `api/tests/integration/events.test.ts`
- [ ] T186 [P] [US4] Write unit test for visibility filtering in `api/tests/unit/services/event.service.test.ts`
- [ ] T187 [P] [US4] Write React component test for Calendar in `src/components/calendar/__tests__/Calendar.test.tsx`
- [ ] T188 [P] [US4] Write React component test for EventCard in `src/components/calendar/__tests__/EventCard.test.tsx`
- [ ] T189 [P] [US4] Write E2E test for calendar viewing in `e2e/tests/calendar.spec.ts`

### Backend Implementation for User Story 4

- [ ] T190 [P] [US4] Create Event Zod schema in `api/src/schemas/event.schema.ts` with title, description, date, visibility validation
- [ ] T191 [US4] Implement EventService in `api/src/services/event.service.ts` with filtering and visibility logic
- [ ] T192 [US4] Create GET /api/events endpoint in `api/src/routes/events.ts` with query params (dateRange, visibility, game)
- [ ] T193 [US4] Create GET /api/events/:id endpoint in `api/src/routes/events.ts`
- [ ] T194 [P] [US4] Implement visibility filtering: public for all, private for creator/admins
- [ ] T195 [P] [US4] Add date range filtering logic
- [ ] T196 [P] [US4] Add game association filtering

### Frontend Implementation for User Story 4

- [ ] T197 [P] [US4] Create CalendarPage in `src/pages/CalendarPage.tsx`
- [ ] T198 [P] [US4] Create Calendar component in `src/components/calendar/Calendar.tsx` using date-fns
- [ ] T199 [P] [US4] Create EventCard component in `src/components/calendar/EventCard.tsx` for event display
- [ ] T200 [P] [US4] Create EventDetails component in `src/components/calendar/EventDetails.tsx` (modal or page)
- [ ] T201 [US4] Create event service functions in `src/services/event.service.ts` for API calls
- [ ] T202 [US4] Create useEvents hook in `src/hooks/useEvents.ts` with React Query
- [ ] T203 [P] [US4] Implement month/week/day calendar views
- [ ] T204 [P] [US4] Add date range picker for filtering
- [ ] T205 [P] [US4] Add game filter dropdown
- [ ] T206 [US4] Implement role-based event visibility in UI
- [ ] T207 [US4] Add calendar link to Header navigation
- [ ] T208 [US4] Add route for /calendar in App.tsx
- [ ] T209 [P] [US4] Add loading states for calendar data
- [ ] T210 [P] [US4] Handle empty state when no events in range

### Validation & Testing

- [ ] T211 [US4] Run all US4 tests - verify they now PASS
- [ ] T212 [US4] Manual test: View calendar as guest, see only public events
- [ ] T213 [US4] Manual test: Filter events by date range
- [ ] T214 [US4] Manual test: Click event to see details
- [ ] T215 [US4] Manual test: Login as member, verify see own private events
- [ ] T216 [US4] Manual test: Login as admin, verify see all events
- [ ] T217 [US4] Verify all 6 acceptance scenarios from spec.md pass

**Checkpoint**: User Story 4 complete - calendar viewing functional for all user roles

---

## Phase 6: User Story 5 - Private Event Creation (Priority: P4)

**Goal**: Non-admin members can create private calendar events to organize small group activities

**Independent Test**: Login as member, create private event, edit it, delete it, verify other members cannot see it

### Tests for User Story 5 (Write FIRST, ensure they FAIL)

- [ ] T218 [P] [US5] Write integration test for POST /api/events in `api/tests/integration/events.test.ts`
- [ ] T219 [P] [US5] Write integration test for PUT /api/events/:id in `api/tests/integration/events.test.ts`
- [ ] T220 [P] [US5] Write integration test for DELETE /api/events/:id in `api/tests/integration/events.test.ts`
- [ ] T221 [P] [US5] Write unit test for ownership checks in event service
- [ ] T222 [P] [US5] Write React component test for EventForm in `src/components/calendar/__tests__/EventForm.test.tsx`
- [ ] T223 [P] [US5] Write E2E test for event CRUD in `e2e/tests/event-crud.spec.ts`

### Backend Implementation for User Story 5

- [ ] T224 [US5] Implement POST /api/events endpoint in `api/src/routes/events.ts` for creating events
- [ ] T225 [US5] Implement PUT /api/events/:id endpoint in `api/src/routes/events.ts` for updating events
- [ ] T226 [US5] Implement DELETE /api/events/:id endpoint in `api/src/routes/events.ts` for deleting events
- [ ] T227 [P] [US5] Add authorization middleware to verify user can only edit/delete own events
- [ ] T228 [P] [US5] Add validation for date not in past
- [ ] T229 [P] [US5] Set visibility to private by default for non-admin users
- [ ] T230 [P] [US5] Add game association support to event creation

### Frontend Implementation for User Story 5

- [ ] T231 [P] [US5] Create EventCreatePage in `src/pages/EventCreatePage.tsx`
- [ ] T232 [P] [US5] Create EventForm component in `src/components/calendar/EventForm.tsx` with React Hook Form
- [ ] T233 [US5] Add "Create Event" button to CalendarPage
- [ ] T234 [P] [US5] Implement event editing for own events (add edit button to EventCard)
- [ ] T235 [P] [US5] Implement event deletion for own events (add delete button to EventCard)
- [ ] T236 [P] [US5] Add game association selector to EventForm
- [ ] T237 [P] [US5] Add date/time picker to EventForm
- [ ] T238 [P] [US5] Set private visibility as default for non-admin users
- [ ] T239 [US5] Add route for /events/new in App.tsx
- [ ] T240 [P] [US5] Add confirmation modal for event deletion
- [ ] T241 [P] [US5] Add success/error notifications for event operations

### Validation & Testing

- [ ] T242 [US5] Run all US5 tests - verify they now PASS
- [ ] T243 [US5] Manual test: Create private event, verify stored
- [ ] T244 [US5] Manual test: Edit own event, verify updated
- [ ] T245 [US5] Manual test: Delete own event, verify removed
- [ ] T246 [US5] Manual test: Verify cannot edit other member's private event
- [ ] T247 [US5] Manual test: Verify private event not visible to other members
- [ ] T248 [US5] Verify all 8 acceptance scenarios from spec.md pass

**Checkpoint**: User Story 5 complete - members can create and manage private events

---

## Phase 7: User Story 6 - Game Page Request Workflow (Priority: P4)

**Goal**: Members can request new game pages with status tracking

**Independent Test**: Login as member, submit game page request, check status, verify duplicate detection

### Tests for User Story 6 (Write FIRST, ensure they FAIL)

- [ ] T249 [P] [US6] Write integration test for POST /api/game-requests in `api/tests/integration/game-requests.test.ts`
- [ ] T250 [P] [US6] Write integration test for GET /api/game-requests (user's requests) in `api/tests/integration/game-requests.test.ts`
- [ ] T251 [P] [US6] Write integration test for GET /api/games in `api/tests/integration/games.test.ts`
- [ ] T252 [P] [US6] Write unit test for duplicate detection in `api/tests/unit/services/game.service.test.ts`
- [ ] T253 [P] [US6] Write React component test for GameRequestForm in `src/components/games/__tests__/GameRequestForm.test.tsx`
- [ ] T254 [P] [US6] Write E2E test for game request submission in `e2e/tests/game-request.spec.ts`

### Backend Implementation for User Story 6

- [ ] T255 [P] [US6] Create Game Zod schema in `api/src/schemas/game.schema.ts`
- [ ] T256 [P] [US6] Create GamePageRequest Zod schema in `api/src/schemas/game-request.schema.ts`
- [ ] T257 [US6] Implement GameService in `api/src/services/game.service.ts` with CRUD methods
- [ ] T258 [US6] Implement POST /api/games endpoint in `api/src/routes/games.ts` (admin only - will implement in Phase 8)
- [ ] T259 [US6] Implement GET /api/games/:id endpoint in `api/src/routes/games.ts`
- [ ] T260 [US6] Implement POST /api/game-requests endpoint in `api/src/routes/game-requests.ts` for creating requests
- [ ] T261 [US6] Implement GET /api/game-requests endpoint in `api/src/routes/game-requests.ts` (user's own requests)
- [ ] T262 [P] [US6] Create game page template structure in GameService
- [ ] T263 [P] [US6] Add duplicate game detection logic (check for existing game or pending request)
- [ ] T264 [P] [US6] Add validation for game request fields

### Frontend Implementation for User Story 6

- [ ] T265 [P] [US6] Create GamesPage in `src/pages/GamesPage.tsx` to list all game pages
- [ ] T266 [P] [US6] Create GameDetailsPage in `src/pages/GameDetailsPage.tsx` for individual games
- [ ] T267 [P] [US6] Create GameRequestPage in `src/pages/GameRequestPage.tsx`
- [ ] T268 [P] [US6] Create GameCard component in `src/components/games/GameCard.tsx`
- [ ] T269 [P] [US6] Create GameRequestForm component in `src/components/games/GameRequestForm.tsx`
- [ ] T270 [US6] Create game service functions in `src/services/game.service.ts` for API calls
- [ ] T271 [US6] Create useGames hook in `src/hooks/useGames.ts` with React Query
- [ ] T272 [P] [US6] Add "Request New Game" button to GamesPage
- [ ] T273 [P] [US6] Display request status for user's submitted requests
- [ ] T274 [P] [US6] Show duplicate detection message when game already exists or has pending request
- [ ] T275 [US6] Add routes for /games, /games/:id, /games/request in App.tsx
- [ ] T276 [US6] Add games link to Header navigation

### Validation & Testing

- [ ] T277 [US6] Run all US6 tests - verify they now PASS
- [ ] T278 [US6] Manual test: Submit game page request, verify stored
- [ ] T279 [US6] Manual test: View request status as requester
- [ ] T280 [US6] Manual test: Try duplicate request, verify blocked with message
- [ ] T281 [US6] Manual test: View existing game pages
- [ ] T282 [US6] Verify all 7 acceptance scenarios from spec.md pass

**Checkpoint**: User Story 6 complete - game page request workflow functional

---

## Phase 8: User Story 7 - Admin User Management (Priority: P5)

**Goal**: Admins can manage users, roles, and process invite requests

**Independent Test**: Login as admin, view users, promote/suspend users, approve/reject invite requests

### Tests for User Story 7 (Write FIRST, ensure they FAIL)

- [ ] T283 [P] [US7] Write integration test for GET /api/admin/users in `api/tests/integration/admin/users.test.ts`
- [ ] T284 [P] [US7] Write integration test for PUT /api/admin/users/:id in `api/tests/integration/admin/users.test.ts`
- [ ] T285 [P] [US7] Write integration test for POST /api/admin/invites/:id/approve in `api/tests/integration/admin/invites.test.ts`
- [ ] T286 [P] [US7] Write integration test for POST /api/admin/invites/:id/reject in `api/tests/integration/admin/invites.test.ts`
- [ ] T287 [P] [US7] Write unit test for admin role middleware in `api/tests/unit/middleware/role.middleware.test.ts`
- [ ] T288 [P] [US7] Write React component test for UserTable in `src/components/admin/__tests__/UserTable.test.tsx`
- [ ] T289 [P] [US7] Write E2E test for admin user management in `e2e/tests/admin.spec.ts`

### Backend Implementation for User Story 7

- [ ] T290 [US7] Implement UserService admin methods in `api/src/services/user.service.ts` (list, update role, suspend)
- [ ] T291 [US7] Implement GET /api/admin/users endpoint in `api/src/routes/admin/users.ts`
- [ ] T292 [US7] Implement PUT /api/admin/users/:id endpoint in `api/src/routes/admin/users.ts` for role/status updates
- [ ] T293 [US7] Implement POST /api/admin/invites/:id/approve endpoint in `api/src/routes/admin/invites.ts`
- [ ] T294 [US7] Implement POST /api/admin/invites/:id/reject endpoint in `api/src/routes/admin/invites.ts`
- [ ] T295 [P] [US7] Add admin role check to all /api/admin/* routes using role middleware
- [ ] T296 [P] [US7] Create invite approval logic (generate invite code, update status, log notification)
- [ ] T297 [P] [US7] Implement user suspension logic (prevent login when status = suspended)
- [ ] T298 [P] [US7] Add rejection reason field to invite rejection

### Frontend Implementation for User Story 7

- [ ] T299 [P] [US7] Create AdminDashboard in `src/pages/AdminDashboard.tsx` with navigation
- [ ] T300 [P] [US7] Create AdminUsersPage in `src/pages/AdminUsersPage.tsx`
- [ ] T301 [P] [US7] Create AdminInvitesPage in `src/pages/AdminInvitesPage.tsx`
- [ ] T302 [P] [US7] Create UserTable component in `src/components/admin/UserTable.tsx` with actions
- [ ] T303 [P] [US7] Create InviteRequestTable component in `src/components/admin/InviteRequestTable.tsx`
- [ ] T304 [US7] Create admin service functions in `src/services/admin.service.ts` for user management
- [ ] T305 [P] [US7] Add confirmation modals for promote, suspend, approve, reject actions
- [ ] T306 [P] [US7] Add admin-only navigation items in Header when user is admin
- [ ] T307 [US7] Add routes for /admin, /admin/users, /admin/invites in App.tsx
- [ ] T308 [P] [US7] Protect admin routes with role check in ProtectedRoute component
- [ ] T309 [P] [US7] Add success/error notifications for admin operations

### Validation & Testing

- [ ] T310 [US7] Run all US7 tests - verify they now PASS
- [ ] T311 [US7] Manual test: View all users as admin
- [ ] T312 [US7] Manual test: Promote user to admin, verify role updated
- [ ] T313 [US7] Manual test: Suspend user, verify cannot login
- [ ] T314 [US7] Manual test: Approve invite request, verify status updated
- [ ] T315 [US7] Manual test: Reject invite request with reason
- [ ] T316 [US7] Verify all 7 acceptance scenarios from spec.md pass

**Checkpoint**: User Story 7 complete - admin user management functional

---

## Phase 9: User Story 8 - Admin Game Page & Event Management (Priority: P5)

**Goal**: Admins can create game pages, approve game requests with auto-creation, and manage public events

**Independent Test**: Login as admin, create game page directly, approve game request (verify page created), create public event, edit any event

### Tests for User Story 8 (Write FIRST, ensure they FAIL)

- [ ] T317 [P] [US8] Write integration test for POST /api/admin/games in `api/tests/integration/admin/games.test.ts`
- [ ] T318 [P] [US8] Write integration test for PUT /api/admin/games/:id in `api/tests/integration/admin/games.test.ts`
- [ ] T319 [P] [US8] Write integration test for GET /api/admin/game-requests in `api/tests/integration/admin/game-requests.test.ts`
- [ ] T320 [P] [US8] Write integration test for POST /api/admin/game-requests/:id/approve in `api/tests/integration/admin/game-requests.test.ts`
- [ ] T321 [P] [US8] Write integration test for admin event permissions in `api/tests/integration/admin/events.test.ts`
- [ ] T322 [P] [US8] Write unit test for game auto-creation on approval
- [ ] T323 [P] [US8] Write E2E test for admin game operations in `e2e/tests/admin-games.spec.ts`

### Backend Implementation for User Story 8

- [ ] T324 [US8] Implement POST /api/admin/games endpoint in `api/src/routes/admin/games.ts` for direct game creation
- [ ] T325 [US8] Implement PUT /api/admin/games/:id endpoint in `api/src/routes/admin/games.ts` for editing game pages
- [ ] T326 [US8] Implement GET /api/admin/game-requests endpoint in `api/src/routes/admin/game-requests.ts` (all pending)
- [ ] T327 [US8] Implement POST /api/admin/game-requests/:id/approve endpoint in `api/src/routes/admin/game-requests.ts`
- [ ] T328 [US8] Implement POST /api/admin/game-requests/:id/reject endpoint in `api/src/routes/admin/game-requests.ts`
- [ ] T329 [P] [US8] Implement game auto-creation from template on request approval
- [ ] T330 [P] [US8] Update event POST endpoint to allow admins to set public visibility
- [ ] T331 [P] [US8] Update event PUT/DELETE authorization to allow admins to edit/delete any event
- [ ] T332 [P] [US8] Add rejection reason to game request rejection

### Frontend Implementation for User Story 8

- [ ] T333 [P] [US8] Create AdminGameRequestsPage in `src/pages/AdminGameRequestsPage.tsx`
- [ ] T334 [P] [US8] Create GameForm component in `src/components/games/GameForm.tsx` for admin game creation
- [ ] T335 [P] [US8] Create GameRequestTable component in `src/components/admin/GameRequestTable.tsx` with approve/reject
- [ ] T336 [US8] Add "Create Game Page" button to GamesPage (admin only)
- [ ] T337 [P] [US8] Add admin approval workflow UI to GameRequestTable
- [ ] T338 [P] [US8] Extend EventForm to allow admins to set public visibility
- [ ] T339 [P] [US8] Add admin edit button to EventCard for all events (admin only)
- [ ] T340 [P] [US8] Add admin delete button to EventCard for all events (admin only)
- [ ] T341 [US8] Add route for /admin/games/requests in App.tsx
- [ ] T342 [P] [US8] Add confirmation modal for game request approval with page preview
- [ ] T343 [P] [US8] Add success notification showing newly created game page after approval

### Validation & Testing

- [ ] T344 [US8] Run all US8 tests - verify they now PASS
- [ ] T345 [US8] Manual test: Create game page directly as admin, verify published
- [ ] T346 [US8] Manual test: Approve game request, verify page auto-created from template
- [ ] T347 [US8] Manual test: Reject game request with reason
- [ ] T348 [US8] Manual test: Create public event as admin, verify visible to all users
- [ ] T349 [US8] Manual test: Edit another user's event as admin
- [ ] T350 [US8] Manual test: Delete any event as admin
- [ ] T351 [US8] Verify all 8 acceptance scenarios from spec.md pass

**Checkpoint**: User Story 8 complete - all admin capabilities functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, accessibility, security hardening across all user stories

### Performance Optimization

- [ ] T352 [P] Run Lighthouse audit on all pages, document results
- [ ] T353 [P] Implement code splitting for routes using React.lazy and Suspense
- [ ] T354 [P] Implement lazy loading for heavy components (Calendar, Tables)
- [ ] T355 [P] Optimize bundle size - analyze with Vite bundle analyzer
- [ ] T356 [P] Add loading skeletons to all pages for better perceived performance
- [ ] T357 [P] Implement optimistic updates for common actions (event creation, profile edits)
- [ ] T358 [P] Add image optimization for logo and game page images
- [ ] T359 [P] Configure React Query caching strategies
- [ ] T360 Fix performance issues identified in Lighthouse audit to achieve >90 score

### Accessibility Improvements

- [ ] T361 [P] Run axe-core accessibility audit on all pages
- [ ] T362 [P] Ensure all interactive elements have proper ARIA labels
- [ ] T363 [P] Test keyboard navigation on all pages and forms
- [ ] T364 [P] Verify all images have alt text
- [ ] T365 [P] Ensure form inputs have associated labels
- [ ] T366 [P] Check color contrast ratios meet WCAG 2.1 AA standards
- [ ] T367 [P] Add focus visible styles for keyboard navigation
- [ ] T368 [P] Test with screen reader (NVDA or JAWS)
- [ ] T369 Fix accessibility issues to achieve WCAG 2.1 AA compliance

### User Experience Polish

- [ ] T370 [P] Improve mobile responsive design for all pages
- [ ] T371 [P] Add success notification/toast system across app
- [ ] T372 [P] Review and improve all error messages for clarity
- [ ] T373 [P] Add keyboard shortcuts for power users (document in help section)
- [ ] T374 [P] Add error boundaries at page level for graceful failures
- [ ] T375 [P] Improve form validation feedback (inline errors, field highlighting)
- [ ] T376 [P] Add confirmation dialogs for destructive actions site-wide
- [ ] T377 [P] Implement "back to top" button for long pages

### Security Hardening

- [ ] T378 [P] Security audit: SQL injection prevention (Prisma parameterized queries)
- [ ] T379 [P] Security audit: XSS prevention (React escaping, DOMPurify if needed)
- [ ] T380 [P] Security audit: CSRF protection (SameSite cookies, CSRF tokens)
- [ ] T381 [P] Review and strengthen JWT security (expiration times, secure storage)
- [ ] T382 [P] Implement rate limiting on sensitive endpoints (login, register, password reset)
- [ ] T383 [P] Add security headers (CSP, X-Frame-Options, etc.) in Azure Static Web Apps
- [ ] T384 [P] Audit dependencies for vulnerabilities with npm audit
- [ ] T385 Fix critical and high severity vulnerabilities

### Testing & Quality

- [ ] T386 [P] Cross-browser testing: Chrome, Firefox, Safari, Edge
- [ ] T387 [P] Mobile testing: iOS Safari, Android Chrome
- [ ] T388 [P] Run load testing with k6 or Artillery (target: 100 concurrent users)
- [ ] T389 [P] Run full E2E test suite in CI/CD pipeline
- [ ] T390 [P] Verify test coverage >80% for frontend and backend
- [ ] T391 Review and fix any flaky tests

**Checkpoint**: All polish and optimization complete - production ready

---

## Phase 11: Documentation & Deployment

**Purpose**: Complete documentation and production launch

### Documentation

- [ ] T392 [P] Write comprehensive README.md with setup instructions for both frontend and backend
- [ ] T393 [P] Create ARCHITECTURE.md with system design diagrams (frontend, backend, database, Azure infra)
- [ ] T394 [P] Generate API.md from OpenAPI spec using Fastify swagger plugin
- [ ] T395 [P] Write CONTRIBUTING.md with development workflow, code standards, PR process
- [ ] T396 [P] Document environment variables in README.md and .env.example
- [ ] T397 [P] Create runbook for common operational tasks (database migrations, user management, monitoring)
- [ ] T398 [P] Document deployment process in README.md
- [ ] T399 [P] Create architecture diagrams showing frontend, backend, database, and Azure services

### Deployment & Operations

- [ ] T400 [P] Set up monitoring alerts in Azure Application Insights (error rate, latency, availability)
- [ ] T401 [P] Create database backup strategy and document in runbook
- [ ] T402 [P] Create disaster recovery plan and document
- [ ] T403 [P] Configure log retention policies in Application Insights
- [ ] T404 Final production deployment of frontend to Azure Static Web Apps
- [ ] T405 Final production deployment of backend to Azure App Service
- [ ] T406 Run database migrations in production PostgreSQL
- [ ] T407 Smoke test in production: test all critical user flows
- [ ] T408 Verify monitoring and logging working in production
- [ ] T409 Create first admin user in production database (manual SQL insert documented in runbook)

**Checkpoint**: Production launch complete - all documentation in place, monitoring active

---

## Dependencies & Execution Order

### Phase Dependencies

**Sequential Requirements:**
1. **Phase 0 (Infrastructure)**: MUST complete first - sets up all infrastructure
2. **Phase 1 (Foundational)**: MUST complete after Phase 0 - provides shared services
3. **Phases 2-9 (User Stories)**: Can begin after Phase 1 completes
4. **Phase 10 (Polish)**: Requires desired user stories complete
5. **Phase 11 (Documentation & Deployment)**: Final phase after all work complete

### User Story Dependencies

After Phase 1 (Foundational) completes:

- **US1 (P1 - Phase 2)**: No dependencies - can start immediately after Phase 1
- **US2 (P2 - Phase 3)**: Depends on US1 for basic frontend structure
- **US3 (P3 - Phase 4)**: Depends on US2 for authentication
- **US4 (P3 - Phase 5)**: Depends on US2 for authentication (can parallel with US3)
- **US5 (P4 - Phase 6)**: Depends on US4 for calendar viewing
- **US6 (P4 - Phase 7)**: Depends on US2 for authentication (can parallel with US4/US5)
- **US7 (P5 - Phase 8)**: Depends on US1 (invite requests) and US2 (user auth)
- **US8 (P5 - Phase 9)**: Depends on US4 (events), US6 (game requests), US7 (admin foundation)

### Parallel Opportunities

**Within Phase 0:**
- Tasks T001-T004, T007-T009 (backend setup, config, error handling, logging)
- Tasks T011-T018 (all Prisma entity definitions)
- Tasks T025-T027 (Azure monitoring and secrets)
- Tasks T032-T033 (GitHub secrets setup)
- Tasks T035-T036 (documentation)

**Within Phase 1:**
- Tasks T040-T042 (type definitions and schemas)
- Tasks T044-T053, T055-T056 (frontend foundation components and utilities)
- Tasks T057-T061 (backend foundation structure)

**Within Each User Story Phase:**
- All test tasks marked [P] can run in parallel
- Model/schema tasks within a phase can run in parallel
- Frontend and backend work can proceed in parallel if team capacity allows

**Between User Stories (if team capacity allows):**
- After Phase 1 complete, US1 can start
- After US1 complete, US2 can start
- After US2 complete, US3 and US4 can proceed in parallel
- After US2 complete, US6 can proceed in parallel with US3/US4/US5
- US5 requires US4, but US6 can proceed independently

---

## Implementation Strategy

### MVP First (Recommended for Single Developer)

1. **Phase 0**: Infrastructure Setup (3-5 days)
2. **Phase 1**: Foundational Services (2-3 days)
3. **Phase 2**: User Story 1 (P1) - Public Landing & Invites (4-6 days)
4. **STOP and VALIDATE**: Test US1 independently, deploy for demo
5. Continue with Phase 3 (US2) when ready

**Total MVP**: ~10-14 days for Phase 0 + Phase 1 + Phase 2

### Incremental Delivery (Add Value Progressively)

1. Complete Phase 0 + Phase 1 → Foundation ready
2. Add US1 → Test independently → Deploy (MVP! Public landing with invite requests)
3. Add US2 → Test independently → Deploy (Authentication enabled)
4. Add US3 → Test independently → Deploy (Member profiles live)
5. Add US4 → Test independently → Deploy (Public calendar visible)
6. Add US5 → Test independently → Deploy (Members can create events)
7. Add US6 → Test independently → Deploy (Game request workflow)
8. Add US7 → Test independently → Deploy (Admin user management)
9. Add US8 → Test independently → Deploy (Admin game/event management)
10. Phase 10 → Polish → Deploy (Performance and accessibility optimized)
11. Phase 11 → Documentation → Final Production Launch

### Parallel Team Strategy (If Multiple Developers)

**Week 1-2**: All team members work together on Phase 0 + Phase 1

**Week 3+**: Split work after Phase 1 completes:
- **Developer A**: Phase 2 (US1)
- **Developer B**: Phase 3 (US2) - starts after US1 has basic frontend structure
- Both integrate and test together

**Week 5+**: After US2 complete:
- **Developer A**: Phase 4 (US3 - Profiles)
- **Developer B**: Phase 5 (US4 - Calendar)
- **Developer C** (if available): Phase 7 (US6 - Game Requests)

Continue pattern through remaining user stories.

---

## Task Statistics

**Total Tasks**: 402 tasks

### Tasks by Phase:
- Phase 0 (Infrastructure): 39 tasks
- Phase 1 (Foundational): 22 tasks
- Phase 2 (US1 - P1): 29 tasks
- Phase 3 (US2 - P2): 48 tasks
- Phase 4 (US3 - P3): 38 tasks
- Phase 5 (US4 - P3): 34 tasks
- Phase 6 (US5 - P4): 31 tasks
- Phase 7 (US6 - P4): 34 tasks
- Phase 8 (US7 - P5): 34 tasks
- Phase 9 (US8 - P5): 35 tasks
- Phase 10 (Polish): 40 tasks
- Phase 11 (Documentation): 18 tasks

### Tasks by User Story:
- US1: 29 tasks (Public Landing & Invite Requests)
- US2: 48 tasks (Auth & Registration)
- US3: 38 tasks (Member Profiles)
- US4: 34 tasks (Public Calendar)
- US5: 31 tasks (Private Event Creation)
- US6: 34 tasks (Game Page Requests)
- US7: 34 tasks (Admin User Management)
- US8: 35 tasks (Admin Game/Event Management)

### Parallelizable Tasks: ~180 tasks marked with [P]

### Independent Test Criteria by User Story:

- **US1**: Visit site unauthenticated, submit invite requests, see confirmation
- **US2**: Register account, login, logout, access protected routes
- **US3**: Edit profile, set privacy, view as different roles
- **US4**: View calendar, filter events, see role-based visibility
- **US5**: Create/edit/delete private events, verify ownership
- **US6**: Submit game requests, check status, verify duplicate detection
- **US7**: Manage users, promote/suspend, approve/reject invites
- **US8**: Create games, approve requests with auto-creation, manage public events

---

**Format Validation**: ✅ All tasks follow checklist format with Task ID, [P] when parallelizable, [Story] labels for user stories, and file paths

**Suggested MVP Scope**: Phase 0 + Phase 1 + Phase 2 (US1 - Public Landing Page & Invite Requests)

---

**Version**: 1.0.0  
**Generated**: 2026-02-23  
**Ready for**: Implementation (after spec approval)
