# Feature Specification: Space City Eidolons Community Hub

**Feature Branch**: `001-community-hub-website`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: User description: "We are building a website for our gaming community, Space City Eidolons. We want a central hub for people to be able to find us, find out more about us, and see what games we are playing and how and when we are playing them. The central hub should list our discord and our element/matrix server with a way to request an invite for either. Registered community members should be able to build a profile page, including twitch streaming URLs, what games they commonly play, and a little bio about themselves. Non-admin users should be able to create private events on the community calendar. On their profile, they should be able to mark specific details as public or private. Non-admin users should also be able to fill out a form to request a new game centric page to be approved by an admin. Creation of the game pages should follow a template and be automated upon approval. Community members who are marked as admins should be able to create pages for specific games, add public or private events to a community calendar, and manage users. Guests should be able to see calendar events marked as public and see public details on bios."

## Purpose & Value

### Why This Matters

Space City Eidolons currently lacks a unified digital presence for discoverability and community coordination. Potential members have no clear way to learn about the community, request access, or see what games and events are happening. Current members have no centralized space to showcase their gaming interests, coordinate schedules, or organize around specific games.

This hub addresses these problems by:
- **Increasing discoverability**: Giving the community a public-facing presence
- **Streamlining onboarding**: Clear pathways for new members to request invites
- **Enabling coordination**: Shared calendar for event planning and scheduling
- **Building community identity**: Member profiles and game-specific pages create connection
- **Reducing admin burden**: Automated workflows for common tasks

### Success Vision

A thriving community hub where:
- New visitors can immediately understand what Space City Eidolons is about
- Potential members can easily request access to Discord or Matrix servers
- Members have rich profiles that help them find gaming partners
- The community calendar drives engagement through visible events
- Game-specific pages create sub-communities around shared interests
- Admins can efficiently manage growth without manual overhead

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public Landing Page & Invite Requests (Priority: P1)

Visitors can discover Space City Eidolons and request invites to community servers without authentication.

**Why this priority**: This is the entry point for all new members. Without this, there's no way for the community to grow or for interested people to join. It delivers immediate value by solving the discoverability and access problem.

**Independent Test**: Can be fully tested by visiting the site as an unauthenticated user, viewing community information, and submitting an invite request. Delivers complete value as a landing page and lead generation system.

**Acceptance Scenarios**:

1. **Given** a visitor arrives at the landing page, **When** they view the page, **Then** they see the Space City Eidolons name, description, and community values
2. **Given** a visitor is on the landing page, **When** they scroll or navigate, **Then** they see information about games the community plays
3. **Given** a visitor wants to join, **When** they click "Request Discord Invite", **Then** they see a form requesting their information
4. **Given** a visitor fills out the Discord invite form with valid information, **When** they submit, **Then** they receive confirmation their request was received
5. **Given** a visitor wants Matrix access, **When** they click "Request Matrix/Element Invite", **Then** they see a form requesting their information
6. **Given** a visitor fills out the Matrix invite form with valid information, **When** they submit, **Then** they receive confirmation their request was received
7. **Given** a visitor is on the landing page, **When** they view public information, **Then** they see the public community calendar with upcoming public events
8. **Given** a visitor is on the landing page, **When** they view game sections, **Then** they see game-specific pages that exist with public information

---

### User Story 2 - User Authentication & Registration (Priority: P2)

Community members can create accounts, log in, and access member-only features using Discord OAuth.

**Why this priority**: Authentication is the gateway to all member features. Once people are approved via invite requests (P1), they need a way to register and access the platform. This is the foundation for all subsequent member features. Using Discord OAuth simplifies onboarding since community members already have Discord accounts.

**Independent Test**: Can be fully tested by completing the Discord OAuth flow, logging in, logging out. Delivers value by creating secure member access separate from guest access.

**Authentication Method**: Discord OAuth 2.0 (v10 API)
- Users authenticate via "Login with Discord" button
- System retrieves Discord user ID, username, email, and avatar from Discord API
- First login automatically creates user account and basic profile
- Session maintained with JWT access + refresh tokens
- Future enhancement: Email/password authentication as alternative method

**Acceptance Scenarios**:

1. **Given** a user visits the login page, **When** they click "Login with Discord", **Then** they are redirected to Discord OAuth authorization page
2. **Given** a user authorizes the application on Discord, **When** they are redirected back, **Then** they are logged in and see member features
3. **Given** a user logs in for the first time via Discord, **When** authentication completes, **Then** a user account and basic profile are automatically created
4. **Given** a logged-in user, **When** they click logout, **Then** they are logged out and returned to guest view
5. **Given** an unauthenticated user, **When** they try to access member-only features, **Then** they are redirected to login
6. **Given** a user's session expires, **When** they attempt an action, **Then** they are prompted to log in again

---

### User Story 3 - Member Profile Management (Priority: P3)

Registered members can create and manage their profiles with granular privacy controls.

**Why this priority**: Profiles enable members to connect with each other based on shared gaming interests. This builds community cohesion and helps members find gaming partners. It depends on authentication (P2) but is the next most valuable member feature.

**Independent Test**: Can be fully tested by logging in as a member, editing profile information, toggling privacy settings, and viewing the profile as different user types. Delivers value by enabling member self-expression and discoverability.

**Acceptance Scenarios**:

1. **Given** a member is logged in, **When** they navigate to their profile, **Then** they see their basic profile information
2. **Given** a member is editing their profile, **When** they add a bio, **Then** the bio is saved to their profile
3. **Given** a member is editing their profile, **When** they add their Twitch streaming URL, **Then** the URL is saved and validated
4. **Given** a member is editing their profile, **When** they add games they commonly play, **Then** these games are added to their profile
5. **Given** a member has profile information, **When** they set a field to "private", **Then** only they and admins can see that field
6. **Given** a member has profile information, **When** they set a field to "public", **Then** all users (including guests) can see that field
7. **Given** a member views their profile, **When** they see their privacy settings, **Then** each field clearly indicates its visibility (public/private)
8. **Given** a guest views a member profile, **When** they access the profile page, **Then** they only see fields marked as "public"
9. **Given** a logged-in member views another member's profile, **When** they access the profile page, **Then** they see all public fields
10. **Given** an admin views any member profile, **When** they access the profile page, **Then** they see all fields regardless of privacy settings

---

### User Story 4 - Public Calendar & Event Discovery (Priority: P3)

All users can view public events on the community calendar to discover when the community is active.

**Why this priority**: The calendar is a key engagement driver. Making public events visible to everyone (including guests) increases participation and shows visitors that the community is active. This can run parallel to profile development.

**Independent Test**: Can be fully tested by viewing the calendar as a guest, member, and admin, filtering by date ranges, and clicking on event details. Delivers value by providing visibility into community activity.

**Acceptance Scenarios**:

1. **Given** any user (guest or member) visits the site, **When** they navigate to the calendar, **Then** they see all public events
2. **Given** a user is viewing the calendar, **When** they select a date range, **Then** events are filtered to that range
3. **Given** a user clicks on a public event, **When** the event details load, **Then** they see event name, date, time, description, and participating game
4. **Given** a user views the calendar, **When** there are no public events in the visible range, **Then** they see an appropriate message
5. **Given** a member is viewing the calendar, **When** they look at event listings, **Then** private events they created are visible only to them
6. **Given** an admin is viewing the calendar, **When** they look at event listings, **Then** they see all events (public and private)

---

### User Story 5 - Private Event Creation (Priority: P4)

Non-admin members can create private events on the community calendar to organize small group activities.

**Why this priority**: Empowering members to organize their own events increases engagement and reduces admin burden. This builds on the calendar viewing (P3) by adding creation capabilities. Private events let members coordinate without cluttering the public calendar.

**Independent Test**: Can be fully tested by logging in as a non-admin member, creating a private event, viewing it on the calendar, editing it, and deleting it. Delivers value by enabling member-driven coordination.

**Acceptance Scenarios**:

1. **Given** a logged-in non-admin member, **When** they click "Create Event", **Then** they see an event creation form
2. **Given** a member is creating an event, **When** they fill in event name, date, time, and description, **Then** they can save the event
3. **Given** a member creates an event, **When** they save it, **Then** it is marked as "private" by default
4. **Given** a member has created a private event, **When** they view the calendar, **Then** they see their private event
5. **Given** a member has created a private event, **When** other non-admin members view the calendar, **Then** they do NOT see the private event
6. **Given** a member views their private event, **When** they click edit, **Then** they can modify the event details
7. **Given** a member views their private event, **When** they click delete, **Then** they are prompted to confirm and can delete the event
8. **Given** a member is creating an event, **When** they optionally associate it with a game, **Then** the event shows the game association

---

### User Story 6 - Game Page Request Workflow (Priority: P4)

Non-admin members can request new game-specific pages to be created for games the community plays.

**Why this priority**: This enables bottom-up community growth around new games while maintaining quality through admin approval. It can be developed alongside event creation (P4) as both are member empowerment features.

**Independent Test**: Can be fully tested by submitting a game page request as a member, viewing request status, and having an admin review the request. Delivers value by creating a pathway for community-driven expansion.

**Acceptance Scenarios**:

1. **Given** a logged-in non-admin member, **When** they navigate to game pages, **Then** they see a "Request New Game Page" option
2. **Given** a member clicks "Request New Game Page", **When** the form loads, **Then** they see fields for game name, description, and justification
3. **Given** a member fills out a game page request, **When** they submit the form, **Then** the request is saved as "pending approval"
4. **Given** a member submitted a game page request, **When** they check their requests, **Then** they see the status (pending, approved, or rejected)
5. **Given** a member's game page request is approved, **When** the approval occurs, **Then** the member is notified
6. **Given** a member's game page request is rejected, **When** the rejection occurs, **Then** the member is notified with a reason
7. **Given** multiple members request the same game, **When** the system detects duplicate requests, **Then** it prevents duplicate pending requests and notifies the member

---

### User Story 7 - Admin User Management (Priority: P5)

Admins can manage user accounts, including promoting users to admin, suspending accounts, and managing invite requests.

**Why this priority**: Admin tools are essential for long-term community management but can come after member features are working. This enables admins to maintain quality and handle growth.

**Independent Test**: Can be fully tested by logging in as an admin, viewing user lists, changing user roles, and processing invite requests. Delivers value by providing admin control over community membership.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to user management, **Then** they see a list of all users
2. **Given** an admin views the user list, **When** they select a user, **Then** they see user details including role and account status
3. **Given** an admin views a user, **When** they click "Promote to Admin", **Then** the user's role is updated to admin
4. **Given** an admin views a user, **When** they click "Suspend Account", **Then** the user can no longer log in
5. **Given** an admin views pending invite requests, **When** they see the list, **Then** they can approve or reject each request
6. **Given** an admin approves an invite request, **When** the approval is processed, **Then** the requester receives an invite link or instructions
7. **Given** an admin rejects an invite request, **When** the rejection is processed, **Then** the requester is notified (optional) and the request is marked rejected

---

### User Story 8 - Admin Game Page & Public Event Management (Priority: P5)

Admins can create game-specific pages, approve game page requests, and create public events on the community calendar.

**Why this priority**: These admin features complete the content management system. They can be developed after admin user management (P5) or in parallel. Together they give admins full control over community content.

**Independent Test**: Can be fully tested by logging in as an admin, creating a game page, approving a pending request, and creating a public event. Delivers value by enabling admin-driven community content.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to game pages, **Then** they see "Create Game Page" option
2. **Given** an admin creates a game page, **When** they fill in the template fields, **Then** the page is created and published immediately
3. **Given** an admin views pending game page requests, **When** they review a request, **Then** they can approve with auto-creation or reject with reason
4. **Given** an admin approves a game page request, **When** approval is processed, **Then** the game page is automatically created from the template
5. **Given** an admin is creating an event, **When** they set visibility to "public", **Then** the event is visible to all users including guests
6. **Given** an admin is creating an event, **When** they set visibility to "private", **Then** the event is only visible to admins
7. **Given** an admin views any game page, **When** they access edit mode, **Then** they can modify game page content
8. **Given** an admin views any event, **When** they access edit mode, **Then** they can modify or delete any event regardless of who created it

---

### Edge Cases

**Authentication & Authorization:**
- What happens when a user's session expires while they're editing their profile?
- How does the system handle concurrent login attempts from different locations?
- What happens if an admin is demoted while they're actively using admin features?
- How does the system handle deleted accounts that have created events or content?

**Invite Requests:**
- What happens when someone submits multiple invite requests with different email addresses?
- How does the system handle invite requests for users who are already registered?
- What happens to pending invite requests if the requester never registers?
- How long do invite links remain valid?

**Profile Management:**
- What happens when a member tries to add an invalid Twitch URL format?
- How does the system handle very long bios or profile content?
- What happens if a member deletes their profile but has created events or content?
- How are game tags validated when members add games they play?

**Calendar & Events:**
- What happens when someone tries to create an event in the past?
- How does the system handle events with very long descriptions?
- What happens to events when their creator's account is suspended or deleted?
- How are time zones handled for events when members are in different locations?
- What happens when multiple events are scheduled at the exact same time?

**Game Pages:**
- What happens when multiple members request the same game page simultaneously?
- How does the system handle typos in game names that would create near-duplicate pages?
- What happens to member profiles that reference a game if that game page is deleted?
- How does the system handle game pages with no associated events or members?

**Data Visibility & Privacy:**
- What happens when a member changes a profile field from public to private while a guest is viewing it?
- How are privacy settings enforced at the API level to prevent unauthorized access?
- What happens when an admin is viewing a member's private details and is demoted?

**Performance & Scale:**
- How does the calendar perform when there are hundreds of events in a single month?
- How does member search perform when there are thousands of profiles?
- What happens when many users try to create events or profiles simultaneously?

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization:**
- **FR-001**: System MUST allow visitors to view public content without authentication
- **FR-002**: System MUST provide Discord OAuth 2.0 authentication for user login
- **FR-003**: System MUST automatically create user accounts on first Discord OAuth login
- **FR-004**: System MUST store Discord user ID, username, email, and avatar from OAuth response
- **FR-005**: System MUST distinguish between three user roles: Guest (unauthenticated), Member (authenticated non-admin), and Admin
- **FR-006**: System MUST enforce role-based access control for all protected features
- **FR-007**: System MUST log out users and terminate sessions when requested
- **FR-008**: System MUST handle OAuth callback errors gracefully (denied authorization, expired tokens, etc.)

**Invite Request System:**
- **FR-009**: System MUST provide a form for visitors to request Discord invites
- **FR-010**: System MUST provide a form for visitors to request Matrix/Element invites
- **FR-011**: System MUST store invite requests with status (pending, approved, rejected)
- **FR-012**: System MUST allow admins to view all pending invite requests
- **FR-013**: System MUST allow admins to approve or reject invite requests
- **FR-014**: System MUST notify requesters when their invite request is processed

**User Profiles:**
- **FR-015**: System MUST create a basic profile automatically when a user first logs in via Discord OAuth
- **FR-016**: System MUST populate profile with Discord username and avatar by default
- **FR-017**: System MUST allow members to add a biography to their profile
- **FR-018**: System MUST allow members to add their Twitch streaming URL
- **FR-019**: System MUST validate Twitch URLs when provided
- **FR-020**: System MUST allow members to tag games they commonly play
- **FR-021**: System MUST allow members to set privacy level (public/private) for each profile field
- **FR-022**: System MUST enforce privacy settings when displaying profiles
- **FR-023**: System MUST allow guests to view only public profile fields
- **FR-024**: System MUST allow members to view each other's public profile fields
- **FR-025**: System MUST allow admins to view all profile fields regardless of privacy setting

**Community Calendar:**
- **FR-026**: System MUST display a calendar view showing events by date
- **FR-027**: System MUST allow filtering events by date range
- **FR-028**: System MUST allow guests to view all public events
- **FR-029**: System MUST allow members to view public events and their own private events
- **FR-030**: System MUST allow admins to view all events (public and private)
- **FR-031**: System MUST allow non-admin members to create private events
- **FR-032**: System MUST allow admins to create both public and private events
- **FR-033**: System MUST allow event creators to edit their own events
- **FR-034**: System MUST allow event creators to delete their own events
- **FR-035**: System MUST allow admins to edit and delete any event
- **FR-036**: System MUST store event details including name, date, time, description, visibility, and optional game association

**Game Pages:**
- **FR-037**: System MUST display a list of existing game pages
- **FR-038**: System MUST allow guests to view public game page content
- **FR-039**: System MUST allow non-admin members to request new game pages
- **FR-040**: System MUST store game page requests with status (pending, approved, rejected)
- **FR-041**: System MUST prevent duplicate pending game page requests for the same game
- **FR-042**: System MUST allow admins to view pending game page requests
- **FR-043**: System MUST allow admins to approve game page requests with automatic page creation
- **FR-044**: System MUST allow admins to reject game page requests with reason
- **FR-045**: System MUST notify requesters when their game page request is processed
- **FR-046**: System MUST allow admins to create game pages directly
- **FR-047**: System MUST allow admins to edit existing game pages
- **FR-048**: System MUST create game pages from a consistent template structure

**Admin User Management:**
- **FR-049**: System MUST allow admins to view a list of all users
- **FR-050**: System MUST allow admins to view user details including role and status
- **FR-051**: System MUST allow admins to promote members to admin role
- **FR-052**: System MUST allow admins to demote admins to member role
- **FR-053**: System MUST allow admins to suspend user accounts
- **FR-054**: System MUST prevent suspended users from logging in
- **FR-055**: System MUST allow admins to reactivate suspended accounts

**Landing Page:**
- **FR-056**: System MUST display community name, description, and values on the landing page
- **FR-057**: System MUST display information about games the community plays
- **FR-058**: System MUST display links to invite request forms prominently
- **FR-059**: System MUST display the public community calendar on or linked from the landing page

### Key Entities

**User:**
- Represents a registered member of the community
- Attributes: discordId (unique), discordUsername, email (from Discord), avatarUrl (from Discord), role (member/admin), account status (active/suspended), registration date
- Relationships: Has one Profile, Creates many Events, Creates many GamePageRequests
- Note: Password field removed - authentication handled via Discord OAuth

**Profile:**
- Represents a member's public-facing community presence
- Attributes: user reference, biography, twitch URL, games played (list), privacy settings (per field)
- Relationships: Belongs to one User

**InviteRequest:**
- Represents a request from a visitor to join the community
- Attributes: email, name, platform (Discord/Matrix), status (pending/approved/rejected), request date, processed date, admin notes
- Relationships: May be processed by an Admin (User)

**Event:**
- Represents a calendar event (gaming session, meeting, etc.)
- Attributes: title, description, date, time, visibility (public/private), creator reference, optional game reference
- Relationships: Created by one User, Optionally associated with one Game

**Game:**
- Represents a game the community plays with its own dedicated page
- Attributes: name, description, template content, creation date, created by (admin reference)
- Relationships: Created by one Admin (User), May have many Events

**GamePageRequest:**
- Represents a member's request to create a new game page
- Attributes: requester reference, game name, description, justification, status (pending/approved/rejected), request date, processed date, admin notes
- Relationships: Created by one User (member), Processed by one Admin (User)

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Discoverability & Onboarding:**
- **SC-001**: Visitors can understand what Space City Eidolons is about within 30 seconds of landing on the homepage
- **SC-002**: Visitors can successfully submit an invite request in under 2 minutes
- **SC-003**: 90% of invite requests receive admin processing within 48 hours
- **SC-004**: New members can complete Discord OAuth login and profile setup in under 3 minutes

**Member Engagement:**
- **SC-005**: Members can find and view other members' public profiles to discover gaming partners
- **SC-006**: Members can create a private event in under 3 minutes
- **SC-007**: Members can submit a game page request in under 3 minutes
- **SC-008**: 80% of members update their profile with bio and games within first week

**Calendar & Event Visibility:**
- **SC-009**: Guests can view public events on the calendar without friction
- **SC-010**: The calendar performs smoothly with at least 100 events per month
- **SC-011**: Members can easily distinguish between public and private events

**Admin Efficiency:**
- **SC-012**: Admins can process invite requests in under 2 minutes each
- **SC-013**: Admins can approve game page requests with automatic page creation in under 5 minutes
- **SC-014**: Admins can manage users (promote, suspend, etc.) in under 2 minutes per action
- **SC-015**: Game page creation from template is automated, requiring only content input

**User Experience:**
- **SC-016**: All pages load within 3 seconds on average connection
- **SC-017**: Site is fully accessible via keyboard navigation
- **SC-018**: All interactive elements provide clear feedback within 100ms
- **SC-019**: Error messages are specific and actionable for users
- **SC-020**: Privacy settings are clearly visible and understandable to members

**Security & Data Protection:**
- **SC-021**: No authenticated user can access another user's private profile fields
- **SC-022**: No member can access admin-only features
- **SC-023**: OAuth tokens are securely stored and refreshed
- **SC-024**: Privacy setting changes take effect immediately

## Out of Scope

The following are explicitly excluded from this specification:

- **Alternative authentication methods**: Email/password, magic links, other OAuth providers (planned as future enhancements after Discord OAuth is stable)
- **Password management**: Password reset, password change, password requirements (not applicable with OAuth-only authentication)
- **Real-time features**: Chat, live notifications, presence indicators
- **Social features**: Direct messaging, friend requests, following/followers
- **Advanced calendar features**: Recurring events, RSVP system, capacity limits, reminders
- **Content management**: Blog posts, news articles, media galleries
- **Integration features**: Automatic syncing with Discord/Matrix, game API integrations, streaming platform APIs beyond Discord
- **Advanced search**: Full-text search, faceted filtering, saved searches
- **Mobile applications**: Native iOS or Android apps
- **Game stats/tracking**: Player stats, match history, leaderboards
- **Payment/commerce**: Memberships, donations, merchandise

## Future Enhancements

The following features are planned for future releases after the initial v1.0 launch:

**Phase 2 Authentication Options:**
- Email/password authentication as alternative to Discord OAuth
- Magic link authentication (passwordless email login)
- Google OAuth, GitHub OAuth as additional providers
- Account linking (connect multiple OAuth providers to one account)

**Phase 2+ Features:**
- Email verification flow for email/password accounts
- Password reset and password change functionality
- Two-factor authentication (2FA)
- Account recovery options
- Notification preferences and email notifications
- Advanced profile customization (banners, themes, badges)
- **Advanced moderation**: Content flagging, reporting system, automated moderation

These may be considered for future iterations but are not part of this initial specification.

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-23  
**Status**: Draft - Awaiting Review
