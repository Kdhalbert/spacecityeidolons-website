US4 - Calendar Discovery Implementation Plan

## Tests Created (RED Phase - All failing initially)

### Backend Integration Tests (api/tests/integration/events.test.ts)
- ✅ GET /api/events endpoint tests
  - Returns PUBLIC events for unauthenticated users
  - Hides PRIVATE events from non-creators
  - Supports date range filtering (startDate, endDate params)
  - Returns paginated results with count

- ✅ GET /api/events/:id endpoint tests
  - Returns specific PUBLIC events
  - 404 for non-existent events
  - Hides PRIVATE from non-creators
  - Returns PRIVATE to creator/admin

- ✅ Event Visibility Filtering Tests
  - Enforces PUBLIC visibility
  - Hides PRIVATE from other users

- ✅ Date Range Filtering Tests
  - Filters by date range
  - Handles missing date parameters

### Unit Tests - Event Visibility Filtering (api/tests/unit/services/event-visibility.test.ts)
- ✅ Unauthenticated User - only sees PUBLIC events
- ✅ Guest User - only sees PUBLIC events
- ✅ Member User - sees PUBLIC + MEMBER events
- ✅ Member User (not creator) - does NOT see PRIVATE events
- ✅ Member User (creator) - sees their own PRIVATE events
- ✅ Admin User - sees ALL events regardless of visibility
- ✅ Event Creator - sees their own PUBLIC/MEMBER/PRIVATE events
- ✅ Mixed visibility scenarios and null/empty cases

### Unit Tests - Event Schema Validation (api/tests/unit/schemas/event.schema.test.ts)
- ✅ createEventSchema validation
- ✅ updateEventSchema validation
- ✅ queryEventsSchema validation
- ✅ Edge cases & security

### Frontend Component Tests (src/components/calendar/calendar.test.ts)
- ✅ EventCalendar Component (6 todo tests)
- ✅ EventList Component (8 todo tests)
- ✅ EventCard Component (6 todo tests)
- ✅ EventFiltering Component (6 todo tests)
- ✅ EventDiscovery Page (6 todo tests)
- ✅ Event Visibility in UI (5 todo tests)
- ✅ Event Interaction (5 todo tests)
- ✅ Performance & Accessibility (6 todo tests)

### E2E Tests - Calendar Discovery (e2e/calendar-discovery.spec.ts)
- ✅ Calendar View Tests (7 tests)
- ✅ Event Listing Tests (6 tests)
- ✅ Event Filtering Tests (6 tests)
- ✅ Private Event Visibility Tests (3 tests)
- ✅ Event Interaction Tests (5 tests)
- ✅ Responsive Design Tests (3 tests)
- ✅ Performance Tests (3 tests)
- ✅ Accessibility Tests (3 tests)

## Implementation Created (GREEN Phase)

### Backend Services
- ✅ api/src/services/event.service.ts
  - filterEventsByVisibility() - Core visibility logic
  - getVisibleEvents() - Query with role-based filtering
  - getEventById() - Single event with visibility checks
  - createEvent() - Create new event
  - updateEvent() - Update with authorization check
  - deleteEvent() - Delete with authorization check
  - getEventStats() - Statistics for admins

### Validation Schemas
- ✅ api/src/schemas/event.schema.ts
  - createEventSchema, updateEventSchema, queryEventsSchema
  - eventResponseSchema, eventListResponseSchema

### API Routes
- ✅ api/src/routes/events.ts
  - GET /api/events - List with filtering, pagination, visibility checks
  - GET /api/events/:id - Single event with visibility check
  - POST /api/events - Create event (requires auth)
  - PUT /api/events/:id - Update event (requires creator auth)
  - DELETE /api/events/:id - Delete event (requires creator auth)
  - GET /api/events/stats - Statistics (admin only)

## Next Steps

1. Verify Prisma schema has Event model and EventVisibility enum
2. Run Prisma migration to apply schema
3. Wire event routes into app/src/index.ts
4. Run backend tests to verify implementation
5. Create frontend components (EventCalendar, EventList, etc.)
6. Run E2E tests against deployed backend
7. Fix any failing tests

## Test Count Summary
- Total test scenarios: 150+ across integration, unit, component, and E2E
- Status: All files created, ready for first test run

## Key Files for PR #33
1. api/tests/integration/events.test.ts
2. api/tests/unit/services/event-visibility.test.ts
3. api/tests/unit/schemas/event.schema.test.ts
4. src/components/calendar/calendar.test.ts
5. e2e/calendar-discovery.spec.ts
6. api/src/services/event.service.ts
7. api/src/schemas/event.schema.ts
8. api/src/routes/events.ts
