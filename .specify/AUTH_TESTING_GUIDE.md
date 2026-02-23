# Discord OAuth Authentication - Testing Guide

**User Story 2: Discord Authentication** 
**Branch**: `feature/user-story-2-authentication`
**Date**: 2026-02-23

## Test Results Summary

### Automated Tests ✅
- **Backend Tests**: 28/28 passing
  - JWT utilities: 12 tests
  - Auth endpoints: 8 tests  
  - Auth middleware: 8 tests
- **Frontend Tests**: 14/14 passing
  - LoginPage: 6 tests
  - AuthCallback: 8 tests
- **E2E Tests**: 6/6 executable tests passing (6 skipped for backend integration)

**Total Automated: 48 tests passing**

---

## Manual Testing Checklist

### Prerequisites

Before starting manual tests, ensure:

1. **Backend API running**: `cd api && npm run dev` (http://localhost:3000)
2. **Frontend running**: `npm run dev` (http://localhost:5173)
3. **Database accessible**: PostgreSQL with migrations applied
4. **Discord OAuth configured**: 
   - `DISCORD_CLIENT_ID` set in `api/.env`
   - `DISCORD_CLIENT_SECRET` set in `api/.env`
   - `DISCORD_REDIRECT_URI` set to `http://localhost:3000/api/auth/callback`
   - Discord Developer Portal redirect URI matches
5. **JWT secrets configured**: `JWT_SECRET` and `JWT_REFRESH_SECRET` in `api/.env`

---

## T142: Discord Login Flow

**Objective**: Verify end-to-end Discord OAuth login works correctly

### Test Steps:

1. **Navigate to Login Page**
   - Open browser to `http://localhost:5173/login`
   - ✓ Page loads without errors
   - ✓ Discord "Login with Discord" button is visible
   - ✓ Discord logo is displayed
   - ✓ Welcome message and TOS notice are shown

2. **Click "Login with Discord"**
   - Click the Discord button
   - ✓ Redirects to Discord authorization page (`discord.com/oauth2/authorize`)
   - ✓ Shows correct application name
   - ✓ Lists required scopes: `identify`, `email`, `guilds`

3. **Authorize Application**
   - Click "Authorize" button on Discord
   - ✓ Redirects back to `http://localhost:5173/auth/callback?code=...`
   - ✓ Shows loading spinner ("Completing login...")
   - ✓ Automatically redirects to home page (`/`)

4. **Verify Logged In State**
   - Check header/navigation bar
   - ✓ "Login" button is replaced with Discord username
   - ✓ Discord avatar is displayed (32×32, rounded)
   - ✓ "Logout" button is visible
   - ✓ Profile link is accessible

5. **Check Browser DevTools**
   - Open Console: ✓ No errors logged
   - Open Application > localStorage:
     - ✓ `accessToken` is present
     - ✓ `refreshToken` is present
   - Open Network tab:
     - ✓ `/api/auth/callback` returned 200
     - ✓ `/api/auth/me` returned 200

### Expected Result:
User successfully authenticates, sees their Discord username/avatar, and can access authenticated features.

---

## T143: First-Time User Account Creation

**Objective**: Verify that first-time Discord login creates User and Profile records

### Test Steps:

1. **Use Fresh Discord Account**
   - Use Discord account that hasn't logged in before
   - Or clear test data: `DELETE FROM "User" WHERE "discordId" = '<your-discord-id>';`

2. **Complete Login Flow** (T142 steps)

3. **Check Database Records**
   
   **Query User table:**
   ```sql
   SELECT * FROM "User" WHERE "discordId" = '<your-discord-id>';
   ```
   
   **Verify User fields:**
   - ✓ `id` (UUID)
   - ✓ `discordId` (matches your Discord ID)
   - ✓ `discordUsername` (matches your Discord username)
   - ✓ `discordAvatar` (avatar hash or null)
   - ✓ `email` (your Discord email or null)
   - ✓ `role` = `USER`
   - ✓ `status` = `ACTIVE`
   - ✓ `createdAt` timestamp
   - ✓ `updatedAt` timestamp

   **Query Profile table:**
   ```sql
   SELECT * FROM "Profile" WHERE "userId" = '<user-id>';
   ```
   
   **Verify Profile fields:**
   - ✓ `id` (UUID)
   - ✓ `userId` (matches User.id)
   - ✓ `bio` (null, not set yet)
   - ✓ `twitchUrl` (null)
   - ✓ `gamesPlayed` (empty array `[]`)
   - ✓ `privacySettings` (JSON):
     ```json
     {
       "showProfile": true,
       "showGames": true,
       "showEvents": true
     }
     ```
   - ✓ `createdAt` timestamp
   - ✓ `updatedAt` timestamp

4. **Verify API Response**
   - Open DevTools > Network
   - Find `/api/auth/me` request
   - Check Response:
   ```json
   {
     "id": "<uuid>",
     "discordId": "<discord-id>",
     "discordUsername": "<username>",
     "discordAvatar": "<hash-or-null>",
     "email": "<email>",
     "role": "USER",
     "status": "ACTIVE",
     "profile": {
       "id": "<uuid>",
       "userId": "<user-id>",
       "bio": null,
       "twitchUrl": null,
       "gamesPlayed": [],
       "privacySettings": { ... }
     }
   }
   ```

### Expected Result:
New User and Profile records created with correct default values and privacy settings.

---

## T144: Logout Functionality

**Objective**: Verify logout clears session and redirects properly

### Test Steps:

1. **Ensure Logged In**
   - Complete login flow (T142)
   - Verify user is authenticated (see username/avatar in header)

2. **Click Logout Button**
   - Find "Logout" button in header
   - Click it

3. **Verify Logout Actions**
   - ✓ Immediately redirected to home page (`/`) or login page
   - ✓ Header now shows "Login" button (not username/avatar)
   - ✓ No "Logout" button visible
   - ✓ Profile link is hidden/disabled

4. **Check localStorage**
   - Open DevTools > Application > localStorage
   - ✓ `accessToken` is removed
   - ✓ `refreshToken` is removed

5. **Check Network Request**
   - Open DevTools > Network
   - Find `/api/auth/logout` request
   - ✓ Request sent with Authorization header
   - ✓ Response status 200

6. **Try Accessing Protected Route**
   - Navigate to `/profile`
   - ✓ Redirects to `/login` (not authorized)

### Expected Result:
Tokens cleared, user logged out, redirected appropriately, protected routes blocked.

---

## T145: Protected Route Redirect

**Objective**: Verify unauthenticated users cannot access protected routes

### Test Steps:

1. **Ensure Logged Out**
   - Complete logout (T144) or start fresh session
   - Verify no tokens in localStorage
   - Verify "Login" button visible in header

2. **Attempt to Access Protected Routes**
   
   **Test `/profile` route:**
   - Navigate to `http://localhost:5173/profile`
   - ✓ Immediately redirects to `/login`
   - ✓ Does NOT show profile content
   - ✓ Shows login page with Discord button

   **Test other protected routes:** (if implemented)
   - Try `/events/create`, `/admin`, etc.
   - ✓ All redirect to `/login`

3. **Check URL Behavior**
   - ✓ URL changes from `/profile` to `/login`
   - ✓ No error messages or crashes
   - ✓ Can still login from redirected page

4. **Verify Public Routes Still Work**
   - Navigate to `/` (home)
   - ✓ Loads normally, no redirect
   - Navigate to `/login`
   - ✓ Loads normally
   - Navigate to `/auth/callback` (no code)
   - ✓ Shows error message (expected)

### Expected Result:
Protected routes require authentication; unauthenticated users redirected to login page.

---

## T146: Token Refresh on Expiration

**Objective**: Verify automatic token refresh works when access token expires

### Test Steps:

**Note**: This test requires shortening JWT expiration or waiting for natural expiration.

#### Option A: Shorten Token Expiration (Recommended for Testing)

1. **Modify Token Expiration**
   - Edit `api/src/config/index.ts` or `api/src/utils/jwt.ts`
   - Set `accessTokenExpiry` to `'10s'` (10 seconds)
   - Restart backend: `cd api && npm run dev`

2. **Login and Wait**
   - Complete login flow (T142)
   - Note the `accessToken` in localStorage
   - Wait 15 seconds (longer than expiration)

3. **Trigger Authenticated Request**
   - Navigate to `/profile` or refresh page
   - Or use DevTools Console:
     ```javascript
     fetch('http://localhost:3000/api/auth/me', {
       headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
     }).then(r => r.json()).then(console.log)
     ```

4. **Verify Token Refresh**
   - Open DevTools > Network
   - ✓ First request to `/api/auth/me` returns 401 (expired token)
   - ✓ Automatic request to `/api/auth/refresh` is made
   - ✓ `/api/auth/refresh` returns 200 with new tokens
   - ✓ Original request retried with new token (200 success)
   - Check localStorage:
     - ✓ `accessToken` has changed (new token)
     - ✓ `refreshToken` has changed (rotated)

5. **Verify Continued Functionality**
   - ✓ User remains logged in (no redirect to login)
   - ✓ Username/avatar still visible
   - ✓ Can navigate protected routes normally

#### Option B: Manual Token Manipulation

1. **Login Normally**
   - Complete login flow (T142)

2. **Corrupt Access Token**
   - Open DevTools > Console
   - Run: `localStorage.setItem('accessToken', 'expired-token-invalid')`

3. **Trigger Request**
   - Navigate to protected route or refresh page
   - ✓ Should trigger refresh flow automatically
   - ✓ New valid token obtained
   - ✓ User remains authenticated

### Expected Result:
Expired access token automatically refreshed using refresh token; user stays logged in seamlessly.

---

## T147: OAuth Denial Handling  

**Objective**: Verify graceful error handling when user denies Discord authorization

### Test Steps:

1. **Start Login Flow**
   - Navigate to `http://localhost:5173/login`
   - Click "Login with Discord" button
   - ✓ Redirected to Discord authorize page

2. **Deny Authorization**
   - On Discord page, click **"Cancel"** button (not "Authorize")
   - ✓ Redirects to `http://localhost:5173/auth/callback?error=access_denied`

3. **Verify Error Page**
   - ✓ Shows "Authentication Failed" heading
   - ✓ Shows user-friendly message: "You cancelled the login process"
   - ✓ Shows red error icon
   - ✓ No stack traces or technical errors visible
   - ✓ "Try Again" button links back to `/login`
   - ✓ "Go Home" button links to `/`

4. **Check Console**
   - Open DevTools > Console
   - ✓ No uncaught errors or exceptions
   - ✓ May see logged error (acceptable): "OAuth callback error"

5. **Verify No Authentication**
   - Check localStorage: ✓ No `accessToken` or `refreshToken`
   - Check header: ✓ "Login" button visible (not logged in)

6. **Retry Login**
   - Click "Try Again" button
   - Complete authorization this time
   - ✓ Login works normally

### Expected Result:
User denial handled gracefully with friendly error message and retry option; no authentication occurs.

---

## T148: Acceptance Criteria Verification

**Objective**: Verify all 6 acceptance scenarios from User Story 2 spec

### Acceptance Scenario 1: Discord Login
✓ Visitor clicks "Login with Discord" → redirected to Discord → authorizes → returned logged in with Discord credentials visible

**Tests**: T142 (Discord Login Flow)

### Acceptance Scenario 2: First-Time User
✓ First-time Discord login creates User account and Profile with default privacy settings in database

**Tests**: T143 (First-Time User Account Creation)

### Acceptance Scenario 3: Return User
✓ Returning Discord user logs in successfully using existing account (no duplicate created)

**Manual Test**:
1. Complete login twice with same Discord account
2. Check database: only ONE User record exists
3. `updatedAt` timestamp changed, but no duplicate

### Acceptance Scenario 4: Protected Routes
✓ Authenticated user can access protected routes (profile page); unauthenticated users redirected to login

**Tests**: T145 (Protected Route Redirect)

### Acceptance Scenario 5: Logout
✓ User can log out, clearing session tokens and preventing access to protected routes

**Tests**: T144 (Logout Functionality)

### Acceptance Scenario 6: Token Refresh
✓ JWT tokens automatically refresh on expiration without requiring re-login; invalid refresh token redirects to login

**Tests**: T146 (Token Refresh on Expiration)

---

## Additional Edge Case Testing

### Test: Multiple Browser Sessions
1. Login on Chrome
2. Login on Firefox (same account)
3. ✓ Both sessions work independently
4. Logout on Chrome
5. ✓ Firefox session still active

### Test: Invalid OAuth Code
1. Manually navigate to: `http://localhost:5173/auth/callback?code=invalid-code-12345`
2. ✓ Shows error message ("Failed to authenticate")
3. ✓ Provides retry option

### Test: Missing OAuth Code
1. Manually navigate to: `http://localhost:5173/auth/callback`
2. ✓ Shows error message ("Missing authorization code")
3. ✓ Provides retry option

### Test: Expired Refresh Token
1. Login normally
2. Manually delete/corrupt `refreshToken` in localStorage
3. Make authenticated request (navigate to `/profile`)
4. ✓ Should trigger 401 on refresh attempt
5. ✓ Redirects to `/login` (cannot refresh)

### Test: Concurrent Requests During Refresh
1. Shorten token expiry to 10s
2. Login and wait for expiration
3. Make multiple requests simultaneously:
   ```javascript
   Promise.all([
     fetch('/api/auth/me', {headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`}}),
     fetch('/api/auth/me', {headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`}}),
     fetch('/api/auth/me', {headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`}})
   ])
   ```
4. ✓ Only ONE refresh request made
5. ✓ All requests succeed after refresh

---

## Troubleshooting

### Issue: Discord OAuth fails with "redirect_uri_mismatch"
**Solution**: 
- Check `DISCORD_REDIRECT_URI` in `api/.env` matches Discord Developer Portal
- Must be exactly: `http://localhost:3000/api/auth/callback`

### Issue: 401 unauthorized on all requests
**Solution**:
- Check `JWT_SECRET` is set in `api/.env`
- Verify Authorization header format: `Bearer <token>`
- Check token hasn't expired (decode at jwt.io)

### Issue: Database errors (User/Profile not created)
**Solution**:
- Run migrations: `cd api && npx prisma migrate dev`
- Check database connection: `cd api && npm run test -- health.test`
- Verify schema: `cd api && npx prisma studio`

### Issue: Frontend can't reach backend API
**Solution**:  
- Check backend running on port 3000: `cd api && npm run dev`
- Check `VITE_API_BASE_URL` in `.env` (should be `http://localhost:3000`)
- Check CORS configuration in `api/src/app.ts`

### Issue: Tokens not persisting after refresh
**Solution**:
- Check browser localstorage not disabled
- Check no extensions blocking localstorage
- Verify `authService.ts` correctly saves tokens

---

## Test Completion Checklist

- [ ] T142: Discord login flow works end-to-end
- [ ] T143: First-time user creates User + Profile records
- [ ] T144: Logout clears tokens and prevents access
- [ ] T145: Protected routes redirect unauthenticated users
- [ ] T146: Token refresh works automatically
- [ ] T147: OAuth denial shows friendly error
- [ ] T148: All 6 acceptance scenarios verified
- [ ] Edge cases tested (multiple sessions, invalid codes, etc.)
- [ ] No console errors during normal flow
- [ ] Database records correct after login/logout
- [ ] Ready to merge `feature/user-story-2-authentication` branch

---

## Summary

**Total Tests**: 48 automated + 8 manual scenarios
**Status**: All automated tests passing ✅
**Manual Testing**: Required before merging to main
**Estimated Manual Testing Time**: 30-45 minutes

**Next Steps**:
1. Complete manual testing checklist above
2. Document any bugs found
3. Fix critical issues
4. Update tasks.md to mark T141-T148 complete
5. Create PR for `feature/user-story-2-authentication` → `main`
