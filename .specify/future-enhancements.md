# Future Enhancements: Space City Eidolons Community Hub

**Created**: 2026-02-23  
**Status**: Planning for v2.0+  
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md) | [tasks.md](./tasks.md)

## Overview

This document tracks features and improvements planned for future releases after the v1.0 MVP launch. These items were intentionally deferred to ship core functionality faster while maintaining a clear roadmap for continued development.

---

## Phase 2 Authentication Options (Priority: High)

**Context**: v1.0 launches with Discord OAuth as the only authentication method. This covers the primary use case since Space City Eidolons is a Discord-based community, but limits flexibility for users who prefer alternatives.

### Email/Password Authentication

**User Value**: Members who don't have or prefer not to use Discord accounts can still register and participate.

**Technical Approach**:
- Add `password` field to User schema (nullable for OAuth users)
- Implement bcrypt password hashing utilities
- Create registration endpoint with password validation
- Create login endpoint with email/password credentials
- Implement password reset flow:
  - POST /api/auth/password-reset-request (generates token, stores in DB)
  - POST /api/auth/password-reset (validates token, updates password)
  - Email delivery via Azure Communication Services
- Update frontend with RegisterPage and PasswordResetPage components

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Estimated Effort**: 3-4 days

**Dependencies**: Azure Communication Services setup for password reset emails

**Tasks**:
- [ ] Add password field to Prisma schema (nullable)
- [ ] Create password hashing utilities (bcrypt)
- [ ] Implement registration endpoint with validation
- [ ] Implement login endpoint with email/password
- [ ] Create PasswordResetToken entity
- [ ] Implement password reset request/confirmation flow
- [ ] Build RegisterPage with password requirements UI
- [ ] Build PasswordResetPage
- [ ] Setup Azure Communication Services for transactional emails
- [ ] Write tests for all password flows
- [ ] Update documentation

---

### Additional OAuth Providers

**User Value**: More authentication options increase accessibility and user convenience.

**Providers to Add**:
1. **Google OAuth** (high priority - widely used)
2. **GitHub OAuth** (medium priority - developer community)
3. **Twitch OAuth** (medium priority - gaming community alignment)

**Technical Approach**:
- Create generic OAuth service abstraction
- Each provider implements common interface
- Store provider type + provider user ID in User table
- Allow account linking (connect multiple OAuth providers to one account)

**Database Schema Update**:
```prisma
model User {
  // Existing fields...
  authProvider   AuthProvider?
  discordId      String?       @unique
  googleId       String?       @unique
  githubId       String?       @unique
  twitchId       String?       @unique
  
  // Add index on provider IDs
  @@index([discordId])
  @@index([googleId])
  @@index([githubId])
  @@index([twitchId])
}

enum AuthProvider {
  DISCORD
  GOOGLE
  GITHUB
  TWITCH
  EMAIL_PASSWORD
}
```

**Estimated Effort**: 2 days per provider

**Tasks** (per provider):
- [ ] Register OAuth application with provider
- [ ] Add provider config to environment variables
- [ ] Implement OAuth initiation endpoint
- [ ] Implement OAuth callback handler
- [ ] Update User schema for provider ID field
- [ ] Create migration for schema changes
- [ ] Add provider button to LoginPage UI
- [ ] Write integration tests for OAuth flow
- [ ] Update documentation

---

### Account Linking

**User Value**: Users can connect multiple authentication methods to a single account (e.g., Discord + email/password), providing flexibility and account recovery options.

**Technical Approach**:
- Create AccountLink entity to track connected auth methods
- Allow linking from profile settings page
- Require current session authentication before linking new method
- Prevent linking same provider twice
- Store provider-specific metadata (username, avatar, etc.)

**Database Schema**:
```prisma
model AccountLink {
  id             String        @id @default(uuid())
  userId         String
  authProvider   AuthProvider
  providerId     String        // Discord ID, Google ID, etc.
  providerEmail  String?
  providerUsername String?
  providerAvatar String?
  linkedAt       DateTime      @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([authProvider, providerId])
  @@index([userId])
  @@map("account_links")
}
```

**UI Requirements**:
- Profile settings page: "Connected Accounts" section
- Show all linked accounts with provider icons
- "Link New Account" button per provider
- "Unlink" button (require at least one auth method remains)
- Visual indication of primary login method

**Estimated Effort**: 4-5 days

**Tasks**:
- [ ] Create AccountLink entity in Prisma schema
- [ ] Implement account linking endpoints (POST /api/account/link/:provider)
- [ ] Implement account unlinking endpoint (DELETE /api/account/unlink/:linkId)
- [ ] Add "Connected Accounts" section to ProfileEditPage
- [ ] Build AccountLinkCard component
- [ ] Implement OAuth link flow (temporary state, callback)
- [ ] Add validation: prevent unlinking last auth method
- [ ] Write tests for linking/unlinking flows
- [ ] Update documentation

---

## Enhanced Security Features (Priority: High)

### Two-Factor Authentication (2FA)

**User Value**: Members with admin privileges or sensitive data can add extra login security.

**Technical Approach**:
- Support TOTP (Time-based One-Time Password) via authenticator apps
- Optional: SMS-based 2FA via Azure Communication Services
- Store 2FA secret encrypted in database
- Generate backup codes on 2FA setup
- Enforce 2FA for admin accounts (configurable)

**Database Schema**:
```prisma
model User {
  // Existing fields...
  twoFactorEnabled   Boolean  @default(false)
  twoFactorSecret    String?  // Encrypted TOTP secret
  twoFactorBackupCodes String[] // Hashed backup codes
}
```

**UI Flow**:
1. Profile settings: "Enable 2FA" button
2. Display QR code + manual entry code
3. User scans with authenticator app
4. Verify with first code before enabling
5. Display backup codes (user must save)
6. Login flow: prompt for 2FA code after credentials

**Estimated Effort**: 5-6 days

**Tasks**:
- [ ] Add 2FA fields to User schema
- [ ] Implement TOTP secret generation (otplib)
- [ ] Create backup code generation utility
- [ ] Implement 2FA setup endpoints (POST /api/auth/2fa/setup)
- [ ] Implement 2FA verification endpoint (POST /api/auth/2fa/verify)
- [ ] Update login flow to check 2FA requirement
- [ ] Build 2FA setup wizard component
- [ ] Build 2FA verification page
- [ ] Add 2FA management to ProfileEditPage
- [ ] Write tests for 2FA flows
- [ ] Add admin config to enforce 2FA for admin role

---

### Account Recovery Options

**User Value**: Users who lose access to their authentication method can recover their account.

**Technical Approach**:
- Recovery email (separate from login email)
- Recovery codes generated on setup
- Security questions (optional)
- Admin-assisted recovery for special cases

**Estimated Effort**: 3-4 days

---

## Advanced Profile Features (Priority: Medium)

### Profile Customization

**Features**:
- Profile banner images
- Custom color themes
- Profile badges (achievements, roles, tenure)
- Custom profile URL slugs (`/profile/username` instead of `/profile/uuid`)
- Profile sections (About, Games, Streaming, Social Links)

**Estimated Effort**: 6-7 days

---

### Rich Media Support

**Features**:
- Profile avatar upload (Azure Blob Storage)
- Banner image upload
- Game screenshots/clips
- Image galleries

**Estimated Effort**: 5-6 days

---

## Notification System (Priority: Medium)

### In-App Notifications

**User Value**: Members receive timely updates about events, mentions, approvals, etc.

**Features**:
- Real-time notifications (WebSocket or Server-Sent Events)
- Notification bell icon in header
- Notification panel with list of recent notifications
- Mark as read/unread
- Notification categories (events, mentions, approvals, system)

**Database Schema**:
```prisma
model Notification {
  id          String           @id @default(uuid())
  userId      String
  type        NotificationType
  title       String
  message     String
  linkUrl     String?
  isRead      Boolean          @default(false)
  createdAt   DateTime         @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

enum NotificationType {
  EVENT_REMINDER
  EVENT_INVITE
  MENTION
  APPROVAL
  SYSTEM
}
```

**Estimated Effort**: 7-8 days

---

### Email Notifications

**User Value**: Members can opt-in to email notifications for important events.

**Features**:
- Email preferences in profile settings
- Notification categories (daily digest, immediate, none)
- Templated emails (transactional)
- Unsubscribe links

**Estimated Effort**: 4-5 days

**Dependencies**: Azure Communication Services setup

---

## Calendar Enhancements (Priority: Medium)

### RSVP System

**Features**:
- RSVP yes/no/maybe for events
- See who's attending
- Capacity limits for events
- Waitlist functionality
- RSVP deadline

**Estimated Effort**: 5-6 days

---

### Recurring Events

**Features**:
- Daily, weekly, monthly, yearly patterns
- Custom recurrence rules
- Edit single occurrence vs. series
- Exception dates

**Estimated Effort**: 6-7 days

---

### Event Reminders

**Features**:
- Automatic reminders (1 day, 1 hour before)
- Customizable reminder times
- In-app + email + Discord webhook notifications

**Estimated Effort**: 4-5 days

---

## Community Features (Priority: Low)

### Direct Messaging

**User Value**: Members can communicate privately within the platform.

**Scope**: This may be deprioritized if Discord remains primary communication channel.

**Estimated Effort**: 10-12 days

---

### Friend System

**Features**:
- Send/accept friend requests
- Friends list
- Friend-only event visibility
- Online status (if WebSocket implemented)

**Estimated Effort**: 5-6 days

---

## Integration Features (Priority: Low)

### Discord Bot Integration

**Features**:
- Sync Discord roles with site roles
- Post calendar events to Discord channel
- Discord commands to view calendar
- Link Discord account to site profile (if not using Discord OAuth)

**Estimated Effort**: 8-10 days

---

### Game Platform Integrations

**Features**:
- Steam integration (games library, playtime)
- Battle.net integration
- Epic Games integration
- Automatic game profile suggestions based on library

**Estimated Effort**: 3-4 days per platform

---

## Search & Discovery (Priority: Low)

### Full-Text Search

**Features**:
- Search profiles by name, bio, games
- Search events by title, description
- Search game pages by name, content
- Fuzzy matching for typo tolerance

**Technical Approach**: PostgreSQL full-text search or Elasticsearch

**Estimated Effort**: 6-7 days

---

### Advanced Filtering

**Features**:
- Multi-faceted filters (games, roles, availability)
- Saved searches
- Filter presets
- Sort by relevance, date, popularity

**Estimated Effort**: 4-5 days

---

## Mobile Experience (Priority: Low)

### Progressive Web App (PWA)

**Features**:
- Service worker for offline support
- Add to home screen prompt
- Push notifications (mobile)
- Optimized mobile layouts
- Touch gestures

**Estimated Effort**: 5-6 days

---

### Native Mobile Apps (Future)

**Scope**: iOS and Android native apps using React Native or Flutter.

**Estimated Effort**: 16-20 weeks (full project)

---

## Admin Tools (Priority: Medium)

### Advanced Admin Dashboard

**Features**:
- Analytics: user growth, engagement metrics, popular games
- Content moderation queue
- Bulk user operations
- Site settings configuration UI
- Audit logs for admin actions

**Estimated Effort**: 8-10 days

---

### Content Management

**Features**:
- Blog/news system
- Announcement banners
- FAQ/Help center
- Media library management

**Estimated Effort**: 6-7 days per feature

---

## Performance & Scale (Ongoing)

### Caching Strategy

**Features**:
- Redis for session storage
- Database query caching
- API response caching
- CDN for static assets

**Estimated Effort**: 4-5 days

---

### Database Optimization

**Features**:
- Query performance monitoring
- Index optimization
- Connection pooling tuning
- Read replicas for scaling

**Estimated Effort**: Ongoing

---

## Prioritization Criteria

When deciding which enhancements to implement next, consider:

1. **User Impact**: How many users benefit? How much value does it add?
2. **Strategic Alignment**: Does it support community growth or engagement?
3. **Dependencies**: Are required services/infrastructure already in place?
4. **Effort**: What's the development time vs. value ratio?
5. **Risk**: What's the technical/product risk?
6. **User Requests**: What are members actively asking for?

---

## Changelog

**v1.0.1** (2026-02-23)
- Initial future enhancements document created
- Defined Phase 2 authentication options (email/password, additional OAuth providers, account linking)
- Identified key enhancement areas: security, profiles, notifications, calendar, search, mobile, admin tools

---

**Maintained by**: Development Team  
**Review Cadence**: Quarterly  
**Next Review**: Q2 2026
