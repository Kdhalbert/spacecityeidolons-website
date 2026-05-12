# ✅ Automated VM Deployment - Setup Complete!

**Date**: February 23, 2026  
**Domain**: spacecityeidolons.com  
**Status**: Ready for deployment (requires one-time GitHub secrets setup)

## 🎯 What I've Done

### 1. ✅ Updated GitHub Actions Workflow
**File**: [.github/workflows/deploy-frontend.yml](.github/workflows/deploy-frontend.yml)

**Changed from**: Azure Static Web Apps deployment  
**Changed to**: Direct VM deployment via SSH

**What it does**:
- Automatically triggers on push to `master` branch
- Builds React production bundle with correct API URL
- SSHs into your VM
- Creates automatic backup of current site
- Deploys new files to `/var/www/html`
- Reloads web server (nginx/Apache)
- Keeps last 5 backups for easy rollback

### 2. ✅ Updated Backend CORS Settings
**Backend**: spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net

**Updated to allow**:
- ✅ `https://spacecityeidolons.com`
- ✅ `https://www.spacecityeidolons.com`
- ✅ `https://polite-sky-008dfff10.4.azurestaticapps.net` (for testing)
- ✅ `http://localhost:5173` (for local development)

**Status**: Applied and backend restarted

### 3. ✅ Created Deployment Documentation
- **[GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)**: Complete GitHub secrets setup guide
- **[DEPLOY_TO_VM.md](DEPLOY_TO_VM.md)**: Comprehensive deployment manual
- **[DEPLOY_QUICK_REFERENCE.md](DEPLOY_QUICK_REFERENCE.md)**: Quick reference cheat sheet
- **[deploy-to-vm.sh](deploy-to-vm.sh)**: Manual deployment script (if needed)

### 4. ✅ Created Production Environment File
**File**: [.env.production](.env.production)

```env
VITE_API_URL=https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net
```

### 5. ✅ Verified Production Build
**Status**: ✅ Build successful (287KB bundle, 92KB gzipped)

## 🔧 What You Need to Do (One-Time Setup)

### Required: Configure GitHub Secrets

To enable automated deployments, you need to add 3 secrets to GitHub:

1. **Go to GitHub Repository**:
   - https://github.com/Kdhalbert/spacecityeidolons-website
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"

2. **Add These Secrets**:

   | Secret Name | Value | How to Find |
   |-------------|-------|-------------|
   | `SERVER_HOST` | Your VM's static IP address | Check Azure Portal or run: `az vm list-ip-addresses` |
   | `SERVER_USER` | Your SSH username | Usually `azureuser` or `ubuntu` |
   | `SERVER_SSH_KEY` | Your SSH private key | `cat ~/.ssh/id_rsa` (entire contents) |

   ✅ **You already have these configured!**

3. **Detailed Instructions**: See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)

### Optional: Test GitHub Actions Locally

Before pushing to master, you can test SSH connection:

```bash
# Test that your SSH key works
ssh -i ~/.ssh/YOUR_KEY SERVER_USER@SERVER_IP

# Should connect without password prompt
# If successful, GitHub Actions will work too
```

## 🚀 How Automated Deployment Works

### Trigger
```bash
# Any push to master automatically deploys
git push origin master
```

### Process
```
1. Code pushed to master
   ↓
2. GitHub Actions triggers automatically
   ↓
3. Builds production bundle (with correct API URL)
   ↓
4. SSHs into VM (using your secrets)
   ↓
5. Creates backup: /var/www/html.backup.TIMESTAMP
   ↓
6. Deploys to: /var/www/html
   ↓
7. Reloads web server (nginx/Apache)
   ↓
8. ✅ Live on spacecityeidolons.com
```

### Monitoring
- **GitHub Actions Tab**: See deployment progress in real-time
- **Workflow History**: View all past deployments
- **Logs**: Detailed logs for troubleshooting

## 📋 Testing Checklist

### Ready to Deploy:

1. **Make a Test Commit** (secrets already configured):
   ```bash
   git commit --allow-empty -m "test: trigger automated deployment"
   git push origin master
   ```

2. **Watch GitHub Actions**:
   - Go to **Actions** tab
   - Click on running workflow
   - All steps should have green checkmarks ✅

3. **Verify Deployment**:
   - Visit https://spacecityeidolons.com
   - Check browser console (F12) for errors
   - Test "Request Invite" forms
   - Verify navigation works

4. **Clear Cloudflare Cache**:
   - Cloudflare Dashboard → Caching
   - Click "Purge Everything"

## 🔄 Manual Deployment (Alternative)

If you prefer to deploy manually or GitHub Actions isn't set up yet:

```bash
# Option 1: Use the deployment script
chmod +x deploy-to-vm.sh
./deploy-to-vm.sh

# Option 2: Follow full manual guide
# See: DEPLOY_TO_VM.md
```

## 📂 Project Structure

```
Repository Root/
├── .github/workflows/
│   ├── deploy-frontend.yml    ← Updated for VM deployment
│   ├── deploy-backend.yml     ← Still deploys to Azure App Service
│   └── test-frontend.yml      ← Runs tests on PRs
├── .env.production            ← New: Points to Azure backend
├── deploy-to-vm.sh            ← New: Manual deployment script
├── GITHUB_ACTIONS_SETUP.md    ← New: Secrets setup guide
├── DEPLOY_TO_VM.md            ← New: Full deployment manual
└── DEPLOY_QUICK_REFERENCE.md  ← New: Quick cheat sheet
```

## 🎯 Current State

### Backend (Azure App Service)
- ✅ Deployed and running
- ✅ CORS configured for spacecityeidolons.com
- ✅ Database connected
- ✅ Health check passing
- **URL**: https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net

### Frontend (Your VM)
- ⏳ Awaiting deployment (needs GitHub secrets first)
- ✅ Build verified successful
- ✅ Production config ready
- **Domain**: https://spacecityeidolons.com (via Cloudflare)

### Deployment Pipeline
- ✅ GitHub Actions configured
- ✅ GitHub secrets configured (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY)
- ✅ Automatic backups configured
- ✅ Web server reload configured

## 🔒 Security Notes

1. **SSH Key**: Keep your private key secure, never commit to Git
2. **GitHub Secrets**: Encrypted at rest, only accessible to workflows
3. **VM Access**: Ensure firewall allows SSH from GitHub Actions
4. **Backups**: Automatic backups created, last 5 retained
5. **HTTPS**: Enforced via Cloudflare

## 📞 Next Steps Summary

### Immediate (Ready to Deploy!)
1. ✅ GitHub secrets already configured (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY)
2. ✅ Make a test commit to trigger first deployment
4. ✅ Verify deployment in GitHub Actions tab
5. ✅ Test site at spacecityeidolons.com
6. ✅ Clear Cloudflare cache

### Alternative (Manual Deploy Now)
1. ✅ Update `deploy-to-vm.sh` with your VM details
2. ✅ Run: `./deploy-to-vm.sh`
3. ✅ Clear Cloudflare cache
4. ✅ Test site

### Future
- GitHub Actions will auto-deploy on every merge to master
- No manual steps needed after initial setup
- Monitor deployments in Actions tab

## ✅ Verification Commands

```bash
# Test SSH access
ssh VM_USER@VM_IP

# Check web server status on VM
sudo systemctl status nginx  # or apache2

# Check deployed files
ls -la /var/www/html

# Check backups
ls -la /var/www/html.backup.*

# Test backend API
curl https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/health

# Test CORS
curl -H "Origin: https://spacecityeidolons.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/api/invites
```

---

**Ready?** Start with [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) to configure automated deployments!

**Questions?** All documentation is in the repository root:
- Comprehensive guide: DEPLOY_TO_VM.md
- Quick reference: DEPLOY_QUICK_REFERENCE.md
- Manual script: deploy-to-vm.sh
