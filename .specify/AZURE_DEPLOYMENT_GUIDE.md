# Discord OAuth Azure Deployment Guide

**Feature**: User Story 2 - Discord Authentication  
**Branch**: `feature/user-story-2-authentication` ✅ Pushed to GitHub  
**Date**: February 23, 2026

---

## 🎯 Deployment Overview

This guide will deploy the Discord OAuth authentication system to Azure production environment:

- **Backend API**: Azure App Service (`spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net`)
- **Frontend**: Azure VM (`spacecityeidolons.com`)
- **Database**: Azure PostgreSQL Flexible Server

**Branch Status**: ✅ All commits pushed to GitHub (7 commits, 48 tests passing)

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [x] ✅ Branch pushed to GitHub
- [x] ✅ All automated tests passing (48/48)
- [ ] Discord Developer Portal access
- [ ] Azure CLI installed and logged in
- [ ] Production database URL
- [ ] JWT secrets (already configured in Azure)

---

## Step 1: Update Discord OAuth Redirect URI

### A. Get Production Backend URL

Your production backend URL is:
```
https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net
```

The OAuth callback endpoint will be:
```
https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/api/auth/callback
```

### B. Update Discord Developer Portal

1. **Navigate to Discord Developer Portal**
   - Go to: https://discord.com/developers/applications
   - Login with your Discord account

2. **Select Your Application**
   - Find "Space City Eidolons" app (or your app name)
   - Click to open application settings

3. **Add Production Redirect URI**
   - In left sidebar, click **OAuth2** → **General**
   - Under "Redirects", click **Add Redirect**
   - Enter: `https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/api/auth/callback`
   - Click **Save Changes**

4. **Keep Existing Localhost URI** (for local development)
   - Keep: `http://localhost:3000/api/auth/callback`
   - Both URIs can coexist

5. **Note Your Credentials** (if not already saved)
   - Copy **Client ID** (under OAuth2 → General)
   - Copy **Client Secret** (click "Reset Secret" if needed)
   - ⚠️ Save these securely - you'll need them for Azure configuration

### C. Verify OAuth Configuration

Your Discord app should now have:
- ✅ Scopes: `identify`, `email`
- ✅ Redirect URIs:
  - `http://localhost:3000/api/auth/callback` (development)
  - `https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/api/auth/callback` (production)

---

## Step 2: Configure Azure App Service Environment Variables

### Option A: Using Azure Portal (Recommended)

1. **Login to Azure Portal**
   - Go to: https://portal.azure.com
   - Search for App Service: `spacecity-api-dev-xdtfmqqqnpcha`

2. **Navigate to Configuration**
   - In App Service menu, click **Settings** → **Configuration**
   - Click **Application settings** tab

3. **Add/Update Discord OAuth Settings**
   
   Click **+ New application setting** for each (or edit if exists):
   
   | Name | Value |
   |------|-------|
   | `DISCORD_CLIENT_ID` | `<your-discord-client-id>` |
   | `DISCORD_CLIENT_SECRET` | `<your-discord-client-secret>` |
   | `DISCORD_REDIRECT_URI` | `https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/api/auth/callback` |
   | `DISCORD_OAUTH_SCOPES` | `identify email` |

4. **Verify Existing Settings**
   
   Ensure these are already configured:
   - ✅ `DATABASE_URL` - PostgreSQL connection string
   - ✅ `JWT_SECRET` - JWT access token secret
   - ✅ `JWT_REFRESH_SECRET` - JWT refresh token secret
   - ✅ `CORS_ORIGIN` - Should include frontend URL(s)
   - ✅ `NODE_ENV` - Should be `production`
   - ✅ `PORT` - Should be `8080`

5. **Update CORS Origin** (if needed)
   
   Update `CORS_ORIGIN` to include frontend URLs:
   ```
   https://spacecityeidolons.com,https://www.spacecityeidolons.com
   ```

6. **Save Configuration**
   - Click **Save** at the top
   - Click **Continue** on the restart warning
   - App Service will restart automatically

### Option B: Using Azure CLI

Run this script to configure environment variables:

```bash
# Set variables
RG="spacecityeidolons-rg"
APP_NAME="spacecity-api-dev-xdtfmqqqnpcha"

# Replace these with your actual Discord credentials
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Configure Discord OAuth settings
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$APP_NAME" \
  --settings \
    DISCORD_CLIENT_ID="$DISCORD_CLIENT_ID" \
    DISCORD_CLIENT_SECRET="$DISCORD_CLIENT_SECRET" \
    DISCORD_REDIRECT_URI="https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/api/auth/callback" \
    DISCORD_OAUTH_SCOPES="identify email" \
    CORS_ORIGIN="https://spacecityeidolons.com,https://www.spacecityeidolons.com"

echo "✅ Discord OAuth configured successfully"
```

---

## Step 3: Deploy Backend API to Azure

### Option A: Deploy via GitHub Actions (Recommended)

1. **Merge Feature Branch to Master** (safest approach)
   
   ```bash
   cd "C:/Users/kdhal/OneDrive/Documents/repos/spacecityeidolons-website-new"
   
   # Switch to master
   git checkout master
   
   # Pull latest
   git pull origin master
   
   # Merge feature branch
   git merge feature/user-story-2-authentication
   
   # Push to trigger deployment
   git push origin master
   ```
   
   ✅ This will automatically trigger `.github/workflows/deploy-backend.yml`  
   ✅ Workflow will build, test, and deploy to Azure App Service

2. **Monitor Deployment**
   - Go to: https://github.com/Kdhalbert/spacecityeidolons-website/actions
   - Watch "Deploy Backend API" workflow progress
   - Deployment typically takes 3-5 minutes

### Option B: Manual Deployment Trigger

If you want to deploy without merging to master:

1. **Go to GitHub Actions**
   - Navigate to: https://github.com/Kdhalbert/spacecityeidolons-website/actions
   - Click "Deploy Backend API" workflow

2. **Run Workflow Manually**
   - Click **Run workflow** button
   - Select branch: `feature/user-story-2-authentication`
   - Select environment: `dev`
   - Check "Run database migrations": `true` (first time only)
   - Click **Run workflow**

3. **Monitor Progress**
   - Watch workflow logs for any errors
   - Verify build and deploy steps complete successfully

### Option C: Manual Deployment Script

If GitHub Actions aren't working, deploy manually:

```bash
cd "C:/Users/kdhal/OneDrive/Documents/repos/spacecityeidolons-website-new/api"

# Build the backend
npm ci
npm run prisma:generate
npm run build

# Package deployment files
cd ..
tar -czf api-deployment.tar.gz \
  api/dist/ \
  api/node_modules/ \
  api/package.json \
  api/package-lock.json \
  api/prisma/

# Deploy to Azure App Service
az webapp deploy \
  --resource-group spacecityeidolons-rg \
  --name spacecity-api-dev-xdtfmqqqnpcha \
  --src-path api-deployment.tar.gz \
  --type tar

echo "✅ Backend deployed to Azure"
```

### Verify Backend Deployment

Test the backend API is running:

```bash
# Test health endpoint
curl https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/health

# Expected response:
# {"status":"ok","timestamp":"...","database":"connected"}

# Test Discord OAuth redirect
curl https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/api/auth/discord

# Expected: Should redirect to Discord authorization page
```

---

## Step 4: Deploy Frontend to Azure VM

### Option A: Deploy via GitHub Actions

1. **Merge Feature Branch to Master**
   
   If you haven't already done this in Step 3:
   
   ```bash
   cd "C:/Users/kdhal/OneDrive/Documents/repos/spacecityeidolons-website-new"
   git checkout master
   git merge feature/user-story-2-authentication
   git push origin master
   ```
   
   ✅ This will trigger `.github/workflows/deploy-frontend.yml`  
   ✅ Frontend will be built and deployed to VM at spacecityeidolons.com

2. **Monitor Deployment**
   - Go to: https://github.com/Kdhalbert/spacecityeidolons-website/actions
   - Watch "Deploy Frontend to VM" workflow
   - Deployment takes 2-3 minutes

### Option B: Manual Deployment Script

Use the existing deployment script:

```bash
cd "C:/Users/kdhal/OneDrive/Documents/repos/spacecityeidolons-website-new"

# Build frontend with production config
npm ci
npm run build

# Deploy to VM (requires SSH access)
./deploy-to-vm.sh
```

If the script fails, you may need to:
1. Ensure SSH key is configured
2. Check VM is accessible
3. Verify nginx/httpd is running on VM

### Verify Frontend Deployment

1. **Visit Production Site**
   - Go to: https://spacecityeidolons.com
   - ✅ Page should load without errors

2. **Check Frontend-Backend Connection**
   - Open DevTools → Network tab
   - Navigate around the site
   - Verify API calls go to: `https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net`

---

## Step 5: Test Discord OAuth in Production

### A. Test Login Flow

1. **Navigate to Login Page**
   ```
   https://spacecityeidolons.com/login
   ```
   - ✅ Discord login button should be visible

2. **Click "Login with Discord"**
   - ✅ Should redirect to Discord authorization page
   - ✅ Shows "Space City Eidolons" app name
   - ✅ Requests permissions: identify, email

3. **Authorize Application**
   - Click **Authorize** button
   - ✅ Redirects back to: `https://spacecityeidolons.com/auth/callback?code=...`
   - ✅ Shows loading spinner briefly
   - ✅ Redirects to: `https://spacecityeidolons.com/`

4. **Verify Logged In State**
   - ✅ Header shows Discord username
   - ✅ Discord avatar displayed (32x32, rounded)
   - ✅ "Logout" button visible
   - ✅ "Profile" link accessible

5. **Check Browser Storage**
   - Open DevTools → Application → localStorage
   - ✅ `accessToken` is present
   - ✅ `refreshToken` is present

### B. Test Protected Routes

1. **Logout (if logged in)**
   - Click logout button
   - ✅ Redirected to home page
   - ✅ Tokens cleared from localStorage

2. **Try Accessing Protected Route**
   ```
   https://spacecityeidolons.com/profile
   ```
   - ✅ Should redirect to `/login`

3. **Login and Try Again**
   - Complete login flow
   - Navigate to: `https://spacecityeidolons.com/profile`
   - ✅ Should load profile page (not redirect)

### C. Test Error Handling

1. **Test OAuth Denial**
   - Start login flow
   - Click **Cancel** on Discord authorization page
   - ✅ Should redirect to error page
   - ✅ Shows "You cancelled the login process"
   - ✅ "Try Again" button visible

2. **Test Invalid Callback**
   - Navigate to: `https://spacecityeidolons.com/auth/callback`
   - ✅ Shows "Missing authorization code" error

### D. Test Database Records

After logging in for the first time, verify database records were created:

```bash
# Connect to Azure PostgreSQL
PGPASSWORD="SpaceCityvv9bBXL6b0LI2024!" \
psql -h spacecity-postgres-dev-xdtfmqqqnpcha.postgres.database.azure.com \
     -U spacecityadmin \
     -d spacecity \
     -c "SELECT \"discordId\", \"discordUsername\", email, role, status FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

Expected output:
```
  discordId   | discordUsername | email           | role | status
-------------+-----------------+-----------------+------+--------
 123456789   | YourUsername    | you@example.com | USER | ACTIVE
```

---

## Step 6: Production Verification Checklist

Run through these scenarios to ensure everything works:

### Authentication Flow
- [ ] ✅ Login button visible on homepage
- [ ] ✅ Login redirects to Discord
- [ ] ✅ Discord authorization page loads
- [ ] ✅ After authorizing, redirects back to site
- [ ] ✅ User is logged in (username/avatar visible)
- [ ] ✅ Tokens stored in localStorage
- [ ] ✅ User record created in database
- [ ] ✅ Profile record created with default settings

### Protected Routes
- [ ] ✅ Unauthenticated users redirected to login
- [ ] ✅ Authenticated users can access protected routes
- [ ] ✅ Profile page loads correctly

### Session Management
- [ ] ✅ Logout button works
- [ ] ✅ Logout clears tokens
- [ ] ✅ After logout, can't access protected routes
- [ ] ✅ Can log in again after logout

### Error Handling
- [ ] ✅ OAuth denial shows friendly error
- [ ] ✅ Missing code shows error message
- [ ] ✅ Invalid tokens handled gracefully
- [ ] ✅ Network errors don't crash app

### Browser Console
- [ ] ✅ No errors in console during normal flow
- [ ] ✅ No warnings about missing environment variables
- [ ] ✅ API calls use HTTPS
- [ ] ✅ CORS working properly

---

## Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Cause**: Discord redirect URI doesn't match configured value

**Solution**:
1. Check Azure App Service `DISCORD_REDIRECT_URI` setting
2. Verify Discord Developer Portal has exact same URI
3. Ensure both use `https://` (not `http://`)
4. Check for typos in domain name

### Issue: CORS Error

**Cause**: Backend not allowing frontend origin

**Solution**:
1. Check Azure App Service `CORS_ORIGIN` setting
2. Should include: `https://spacecityeidolons.com`
3. Restart App Service after changing

### Issue: 500 Error on OAuth Callback

**Cause**: Missing Discord credentials or database error

**Solution**:
1. Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are set in Azure
2. Check database connection (run health endpoint)
3. Check App Service logs in Azure Portal:
   - Go to App Service → Monitoring → Log Stream
   - Look for error messages

### Issue: Tokens Not Persisting

**Cause**: Frontend not saving tokens to localStorage

**Solution**:
1. Check browser console for JavaScript errors
2. Verify `authService.ts` is correctly deployed
3. Clear browser cache and try again
4. Check if browser blocks localStorage (private mode)

### Issue: Database Migration Errors

**Cause**: Schema not up to date with latest changes

**Solution**:
```bash
# Connect to production database
cd api
npx prisma migrate deploy

# Or run via Azure CLI
az webapp config connection-string set \
  --resource-group spacecityeidolons-rg \
  --name spacecity-api-dev-xdtfmqqqnpcha \
  --connection-string-type PostgreSQL \
  --settings DefaultConnection="$DATABASE_URL"
```

### Issue: Frontend Shows Old Code

**Cause**: Browser cache or CDN cache

**Solution**:
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache completely
3. Try incognito/private browsing mode
4. Check VM deployment completed successfully

---

## Rollback Plan

If deployment causes issues:

### Rollback Backend

```bash
# Revert to previous deployment slot
az webapp deployment slot swap \
  --resource-group spacecityeidolons-rg \
  --name spacecity-api-dev-xdtfmqqqnpcha \
  --slot staging \
  --target-slot production

# Or redeploy previous version from GitHub
# Go to Actions → Select previous successful workflow → Re-run jobs
```

### Rollback Frontend

```bash
# SSH to VM
ssh spacecityeidolons@spacecityeidolons.com

# Restore previous backup
cd /var/www/spacecityeidolons.com
sudo tar -xzf backup-YYYY-MM-DD.tar.gz

# Restart web server
sudo systemctl restart nginx
```

### Disable Discord OAuth (Emergency)

If OAuth is causing critical issues:

```bash
# Remove Discord routes temporarily
# Edit api/src/routes/auth.routes.ts and comment out Discord routes
# Redeploy backend
```

---

## Post-Deployment Tasks

After successful deployment:

1. **Update Documentation**
   - [ ] Mark T141-T148 as complete in tasks.md
   - [ ] Update README.md with production URLs
   - [ ] Add deployment date to CHANGELOG

2. **Monitor System**
   - [ ] Check Azure Application Insights for errors
   - [ ] Monitor database connections
   - [ ] Watch for failed login attempts
   - [ ] Set up alerts for 500 errors

3. **Communicate Deployment**
   - [ ] Announce new authentication feature to team
   - [ ] Update user documentation
   - [ ] Share login instructions with community

4. **Create PR** (if deployed from feature branch)
   - [ ] Create PR: `feature/user-story-2-authentication` → `master`
   - [ ] Include deployment verification results
   - [ ] Get code review
   - [ ] Merge to master after verification

---

## Commands Quick Reference

```bash
# Check backend health
curl https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/health

# Check frontend
curl -I https://spacecityeidolons.com

# Test Discord OAuth redirect
curl -I https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/api/auth/discord

# View App Service logs
az webapp log tail \
  --resource-group spacecityeidolons-rg \
  --name spacecity-api-dev-xdtfmqqqnpcha

# Restart App Service
az webapp restart \
  --resource-group spacecityeidolons-rg \
  --name spacecity-api-dev-xdtfmqqqnpcha

# Check database connection
PGPASSWORD="SpaceCityvv9bBXL6b0LI2024!" \
psql -h spacecity-postgres-dev-xdtfmqqqnpcha.postgres.database.azure.com \
     -U spacecityadmin \
     -d spacecity \
     -c "SELECT version();"
```

---

## Success Criteria

Deployment is successful when:

✅ Backend API responding at `https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net`  
✅ Frontend loaded at `https://spacecityeidolons.com`  
✅ Discord OAuth login flow works end-to-end  
✅ User and Profile records created in database  
✅ Protected routes work correctly  
✅ Logout functionality works  
✅ No console errors during normal flow  
✅ All automated tests still passing  
✅ No CORS errors  
✅ Tokens refresh automatically  

---

## Next Steps After Deployment

1. **Run Manual Tests** (T142-T148) using production environment
2. **Verify Acceptance Criteria** (T148) in production
3. **Monitor for 24-48 hours** to catch any edge cases
4. **Gather user feedback** once feature is live
5. **Plan next user story** (US3: Profile Management or US4: Community Events)

---

**Deployment Status**: Ready to deploy ✅  
**Estimated Time**: 30-45 minutes  
**Risk Level**: Low (feature doesn't affect existing functionality)  
**Rollback Available**: Yes
