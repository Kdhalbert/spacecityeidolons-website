# Product Roadmap

This file is the canonical roadmap source for the app roadmap page.

How to update:
1. Edit the JSON array between the roadmap markers.
2. Run npm run roadmap:sync.
3. Commit both this file and src/data/roadmap.ts.

Status values:
- completed
- in-progress
- planned

<!-- ROADMAP_DATA_START -->
```json
[
  {
    "id": "US1",
    "title": "Public Landing Page & Invite Requests",
    "description": "Visitors can discover Space City Eidolons and request invites to community Discord and Matrix servers.",
    "priority": "P1",
    "status": "completed",
    "pr": 12,
    "phase": 2
  },
  {
    "id": "US2",
    "title": "User Authentication & Registration",
    "description": "Community members can log in via Discord OAuth and access member-only features.",
    "priority": "P2",
    "status": "completed",
    "pr": 26,
    "phase": 3
  },
  {
    "id": "US3",
    "title": "Member Profile Management",
    "description": "Registered members can create and manage profiles with bio, Twitch URL, game tags, and granular privacy controls.",
    "priority": "P3",
    "status": "completed",
    "pr": 35,
    "phase": 4
  },
  {
    "id": "US4",
    "title": "Public Calendar & Event Discovery",
    "description": "All users can view public events on the community calendar and filter by date range or game.",
    "priority": "P3",
    "status": "completed",
    "pr": 40,
    "phase": 5
  },
  {
    "id": "US5",
    "title": "Private Event Creation",
    "description": "Members can create private calendar events to organise small group activities.",
    "priority": "P4",
    "status": "completed",
    "pr": 45,
    "phase": 6
  },
  {
    "id": "US6",
    "title": "Game Page Request Workflow",
    "description": "Members can request new game pages with duplicate detection and status tracking.",
    "priority": "P4",
    "status": "completed",
    "pr": 46,
    "phase": 7
  },
  {
    "id": "USR",
    "title": "Roadmap Page",
    "description": "A public roadmap so the community can track development progress in real time.",
    "priority": "P3",
    "status": "completed",
    "phase": 9.5
  },
  {
    "id": "US7",
    "title": "Admin User Management",
    "description": "Admins can view and manage users, assign roles, suspend accounts, and process invite requests.",
    "priority": "P5",
    "status": "completed",
    "pr": 51,
    "phase": 8
  },
  {
    "id": "US8",
    "title": "Admin Game Page & Event Management",
    "description": "Admins can create game pages directly, approve or reject member requests, and manage public events.",
    "priority": "P5",
    "status": "planned",
    "phase": 9
  },
  {
    "id": "US9",
    "title": "Persistent Login Sessions",
    "description": "Members remain logged in across browser restarts using secure HttpOnly refresh tokens, eliminating unnecessary re-authentication.",
    "priority": "P3",
    "status": "planned",
    "phase": 10
  },
  {
    "id": "US10",
    "title": "Silent Token Refresh",
    "description": "Access tokens are automatically renewed in the background during active sessions so members are never unexpectedly logged out mid-use.",
    "priority": "P3",
    "status": "planned",
    "phase": 11
  },
  {
    "id": "US11",
    "title": "Admin Delegation Safeguards",
    "description": "Admins can promote other admins with explicit audit logging, confirmation controls, and protections against accidental lockout.",
    "priority": "P4",
    "status": "planned",
    "phase": 12
  },
  {
    "id": "US12",
    "title": "Mobile Responsiveness Improvements",
    "description": "The website provides a polished, mobile-friendly experience across core pages, navigation, forms, and admin tools on phones and tablets.",
    "priority": "P2",
    "status": "planned",
    "phase": 13
  }
]
```
<!-- ROADMAP_DATA_END -->

## Planned Story Notes

These notes expand the highest-priority planned stories so they can be broken into implementation tasks later without changing the canonical data block above.

### US8 - Admin Game Page & Event Management

**Outcome**: Admins can manage the public content pipeline without waiting on manual intervention.

**Suggested scope**:
- Create game pages directly from the admin area.
- Approve or reject member-submitted game page requests.
- Create, edit, and delete public events from the admin UI.
- Support pagination/search/filtering for large admin queues.

**Acceptance ideas**:
- Admin can create a game page and see it appear in the public games list.
- Admin can approve or reject a pending member request.
- Admin can edit and delete events without leaving the admin console.

### US9 - Persistent Login Sessions

**Outcome**: Members stay signed in across browser restarts with minimal friction.

**Suggested scope**:
- Issue secure HttpOnly refresh tokens on login.
- Store refresh-token metadata server-side for rotation and revocation.
- Restore the session on app load if the refresh token is still valid.
- Provide a safe logout path that clears both access and refresh credentials.

**Acceptance ideas**:
- Closing and reopening the browser preserves the signed-in session.
- Expired access tokens are refreshed silently using the refresh token.
- Manual logout fully invalidates the session.

### US10 - Silent Token Refresh

**Outcome**: Active users are not interrupted by token expiry while navigating the app.

**Suggested scope**:
- Refresh access tokens in the background before they expire.
- Retry failed requests once after a refresh if the backend reports an auth expiry.
- Prevent refresh storms when multiple requests fail at the same time.
- Surface a clear sign-out flow if refresh cannot recover the session.

**Acceptance ideas**:
- A user can remain active through a long session without reauth prompts.
- Background refresh does not spam the API or duplicate requests.
- If refresh fails, the UI sends the user to login with a clear message.

### US11 - Admin Delegation Safeguards

**Outcome**: Admin role changes are auditable and less likely to lock out the team.

**Suggested scope**:
- Require confirmation before promoting or demoting an admin.
- Record who performed the role change and when it happened.
- Block self-demotion if it would leave the team without an admin.
- Show a warning when a change affects the last remaining admin.

**Acceptance ideas**:
- Role changes write an audit trail entry.
- Attempting to remove the last admin is blocked or requires a higher-friction flow.
- Admin users see clear confirmation text before taking a risky action.

### US12 - Mobile Responsiveness Improvements

**Outcome**: Core screens remain usable and polished on phones and tablets.

**Suggested scope**:
- Improve header/nav wrapping and touch targets.
- Make admin tables stack or scroll cleanly on narrow screens.
- Ensure forms, buttons, and alerts have consistent spacing on mobile.
- Review roadmap, profile, invite, and member-request flows on smaller breakpoints.

**Acceptance ideas**:
- The site is comfortable to use at 375px wide without horizontal overflow.
- Primary actions remain visible and tappable on mobile.
- Admin views degrade gracefully from tables to scroll/stack layouts.

## Future Backlog Phases

These items are not yet part of the live roadmap page, but they are organized into draft phases so future stories can be promoted into the roadmap with less planning overhead.

### Phase 13 - Authentication & Security Expansion

**Theme**: Make account access more flexible and resilient.

**Candidate stories**:
- Email/password authentication with reset flow.
- Additional OAuth providers such as Google, GitHub, and Twitch.
- Account linking for multiple login methods.
- Two-factor authentication and backup codes.

**Planning questions**:
- Which non-Discord providers should be supported first?
- Should account linking be self-service or admin-assisted for v1?
- Is 2FA optional for all users or enforced for admins only?

### Phase 14 - Profile & Community Experience

**Theme**: Make profiles and community interactions richer and more expressive.

**Candidate stories**:
- Profile customization with banners, themes, badges, and URL slugs.
- Rich media uploads for avatars, banners, screenshots, and galleries.
- In-app notifications for invites, events, mentions, and approvals.
- Member recovery options for lost authentication methods.

**Planning questions**:
- Which profile customization features provide the most value first?
- Should media uploads use Azure Blob Storage from the start?
- What notification types should be real-time versus digest-based?

### Phase 15 - Platform Polish & Accessibility

**Theme**: Improve the quality bar across the whole app before major new features land.

**Candidate stories**:
- Route-level code splitting and loading skeletons.
- Expanded accessibility audits and keyboard navigation checks.
- Mobile and tablet UX review across the app.
- Performance testing and bundle-size optimization.

**Planning questions**:
- Which routes are large enough to justify code splitting first?
- What accessibility gaps are the highest risk for public pages?
- Should performance work happen before or after more feature development?

### Phase 16 - Security Hardening & Operations

**Theme**: Strengthen the platform for production reliability and long-term maintainability.

**Candidate stories**:
- Security hardening for rate limiting, headers, and CSRF protection.
- Expanded JWT review and token lifecycle protections.
- Dependency audit and vulnerability remediation process.
- Backup, monitoring, and operational runbook improvements.

**Planning questions**:
- Which security controls are already covered by platform defaults?
- What operational tasks need explicit runbooks before launch?
- Which alerts and backups are mandatory versus nice to have?
