# Deployment Warnings & Future Action Items

## 🔄 Standard PR Workflow for Future Deployments

**ALL FUTURE WORK should follow this process:**

1. **Create feature branch from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/description-of-work
   ```

2. **Make changes, commit, and push:**
   ```bash
   git add .
   git commit -m "feat: Description of changes"
   git push origin feature/description-of-work
   ```

3. **Create PR on GitHub:**
   ```bash
   gh pr create --base main --head feature/description-of-work \
     --title "feat: Your feature title" \
     --body "## Changes
   - Details of changes
   - More details
   
   ## Related Issues
   - Closes #123"
   ```

4. **Merge PR to main when ready:**
   - ⚠️ **IMPORTANT**: PRs require manual approval before merging
   - GitHub Actions workflows automatically trigger on push to main ONLY
   - Workflows will: validate, test, build, deploy
   - Do NOT enable auto-merge - all production merges must be manual

5. **Monitor deployment:**
   - Check **GitHub Actions** tab for workflow status
   - Confirm all workflows pass before considering deployment complete

---

## 🔐 Pull Request Approval Policy

**All PRs require manual review and approval before merging to main.**

- No auto-merge enabled (GitHub setting)
- All GitHub Actions workflows trigger AFTER merge to main
- Code review required from at least 1 team member
- Required checks must pass before merge button is enabled
- Merges must be performed through GitHub UI (not `git push`)

This ensures human oversight of all production changes.

---

## Phase: Azure Infrastructure & Backend Deployment (Feb 23, 2026)

### ⚠️ CRITICAL - Key Vault RBAC Access Issue
**Status**: UNRESOLVED  
**Severity**: HIGH  
**Issue**: User cannot access Key Vault secrets stored in `spacecitykvxdtfmqqqnp` due to RBAC authorization denial.  
**Root Cause**: Key Vault created with `enableRbacAuthorization: true`, but role assignments to user are failing with "MissingSubscription" error when using Azure CLI from bash terminal.  
**Error Code**: `ForbiddenByRbac`  
**Impact**: Cannot retrieve secrets from Key Vault for manual verification, but App Service managed identity can access via RBAC.  
**Resolution**: 
- [ ] Use Azure Portal to manually create role assignment: User (c0ecfdc4-fba5-4c6f-b9b0-831c53f53e08) → "Key Vault Secrets User" role on Key Vault resource
- [ ] OR re-deploy Key Vault with `enableRbacAuthorization: false` and use access policies instead
- [ ] Document: This is expected in regulated environments; for production, use Key Vault role assignments at pipeline execution time

**Related**: 
- [Bicep] `infrastructure/bicep/modules/keyvault.bicep` line 8: `enableRbacAuthorization: true`
- [CLI Error] Multiple attempts to assign role failed with scoping issues in bash context

---

### ⚠️ Bicep Linter Warnings - Suppress or Fix (Non-blocking)
**Status**: TRACKED  
**Severity**: LOW  
**Issues**:
1. **outputs-should-not-contain-secrets** in `staticwebapp.bicep` (line 52) - `listSecrets` in outputs
2. **secure-secrets-in-params** in `keyvault.bicep` (line 19) - Parameter `secrets` should have `@secure()` decorator
3. **BCP318 null safety** in `keyvault.bicep` (lines 91-93) - Potential null reference to Key Vault secrets

**Resolution**: 
- [ ] Add `@secure()` to keyvault.bicep parameter `secrets`
- [ ] Remove `listSecrets()` from staticwebapp.bicep outputs or suppress linter warning
- [ ] Add null-coalescing operators for Key Vault secret references

---

### ⚠️ PostgreSQL Configuration - Firewall Rules Override
**Status**: OPERATIONAL  
**Severity**: MEDIUM  
**Issue**: PostgreSQL `publicNetworkAccess` property was read-only in API version 2023-03-01-preview; removed from Bicep template.  
**Current State**: Firewall rules control access; `publicNetworkAccess` now auto-determined by Azure based on firewall configuration.  
**Note**: Development firewall rule added for IP `172.14.51.34` to allow local Prisma migrations.  

**Action Items**:
- [ ] Remove development firewall rule `AllowDevMachine` from production deployments
- [ ] Use CI/CD runner's public IP in GitHub Actions instead of hardcoding dev IPs
- [ ] Implement Azure DevOps agent network rule for backend CI/CD migrations

---

### ⚠️ CORS Configuration - Production Hardening Needed
**Status**: CONFIGURED INSECURELY  
**Severity**: MEDIUM  
**Issue**: App Service CORS set to allow all origins (`*`) with `supportCredentials: false`  
**Reason**: Azure App Service rejected `supportCredentials: true` with wildcard origins (security constraint)  

**Action Items**:
- [ ] Create per-environment Bicep parameters for CORS origins
- [ ] For production: Set CORS to Static Web App hostname only
- [ ] For staging: Set CORS to staging Static Web App hostname  
- [ ] For dev: Keep `*` if needed, but document security risk

**Related**: `infrastructure/bicep/modules/appservice.bicep` - CORS configuration

---

### 🔔 Database Seeding Status
**Status**: INCOMPLETE  
**Note**: `npx prisma db seed` ran but no output captured (potential issue with seed script).  
**Action Items**:
- [ ] Verify seed data actually populated database by querying users table
- [ ] Run: `npx prisma studio` to verify admin user (`admin@spacecityeidolons.com`) and test user exist
- [ ] If seed failed: Check `api/prisma/seed.ts` for errors and run manually in Azure CLI

---

### 🔔 Missing GitHub Secrets for GitHub Actions
**Status**: BLOCKING  
**Required for CI/CD**:
- [ ] `AZURE_CLIENT_ID` - Service Principal for federated credential auth
- [ ] `AZURE_TENANT_ID` - Azure AD tenant ID (39c4ab19-c951-49e0-aadf-8166544818ed)
- [ ] `AZURE_SUBSCRIPTION_ID` - Subscription ID (e50a6f80-9146-4416-9fbe-5eb90e6aef04)
- [ ] Configure GitHub to use federated credentials with Azure

**OR use alternative**:
- [ ] `AZURE_PUBLISH_PROFILE` - Web app publish profile (download from Azure Portal)

---

### ⚠️ Static Web App Deployment
**Status**: PENDING - Deployment via GitHub Actions  
**Known**: Static Web App requires GitHub integration with deployment token  
**Action Items**:
- [ ] Generate Static Web App deployment token: `az staticwebapp secrets list --name spacecity-web-dev-xdtfmqqqnpcha --resource-group spacecityeidolons-rg`
- [ ] Add as `SECRET_STATICWEB` in GitHub repository  
- [ ] Update `deploy-frontend.yml` workflow with correct token variable

---

### 🔔 Prisma Database URL Format Warning
**Status**: VERIFIED WORKING  
**Note**: Successfully connected and migrated with: `postgresql://user:pass@host:5432/db?sslmode=require`  
**Action Items**:
- [ ] For production Azure PostgreSQL: Ensure `sslmode=require` is always set
- [ ] Document: Flexible Server requires SSL; connection will fail without it

---

### 📋 Next Step: GitHub Actions Trigger
**Manual Deployment (Temporary)**:
```bash
# Push changes to trigger workflows
git add .
git commit -m "feat: infrastructure and backend API deployment

- Deploy Azure infrastructure (PostgreSQL, App Service, Static Web App, Key Vault)
- Configure Bicep templates with environment-aware resources
- Setup database migrations and firewall rules
- Add GitHub Actions CI/CD workflows
- Record deployment warnings and production hardening tasks"

git push origin main
```

**GitHub Actions will then**:
1. Run `infrastructure.yml` - Re-validate bicep templates
2. Run `test-backend.yml` - Test API
3. Run `deploy-backend.yml` - Deploy to App Service
4. Run `deploy-frontend.yml` - Deploy to Static Web App

---

### 📍 Production Deployment Checklist
Before moving to production deployment:
- [ ] Resolve Key Vault RBAC access (might not be issue in CI/CD context)
- [ ] Fix Bicep linter warnings
- [ ] Test backend health endpoint response
- [ ] Verify database seeding completed successfully
- [ ] Configure per-environment CORS origins
- [ ] Set up GitHub secrets for federated auth OR publish profile
- [ ] Test login flow with seeded admin credentials (admin@spacecityeidolons.com / Admin123!@#)
- [ ] Verify Application Insights is collecting logs
- [ ] Set up monitoring alerts for App Service errors
