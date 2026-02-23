# Quick Deploy - spacecityeidolons.com VM

## 🚀 Quick Start (2 minutes)

### First Time Setup
```bash
# 1. Update deploy-to-vm.sh with your VM details:
nano deploy-to-vm.sh
# Set: VM_IP, VM_USER

# 2. Make script executable
chmod +x deploy-to-vm.sh
```

### Deploy New Version
```bash
# Build and deploy in one command:
./deploy-to-vm.sh

# Then clear Cloudflare cache and test:
# 1. Cloudflare Dashboard → Caching → Purge Everything
# 2. Visit https://spacecityeidolons.com
```

## 📝 Manual Deploy (if script fails)

```bash
# 1. Build
npm run build

# 2. Upload
scp -r dist/* user@VM_IP:/tmp/deploy/

# 3. Deploy via SSH
ssh user@VM_IP
sudo cp -r /var/www/html /var/www/html.backup
sudo rm -rf /var/www/html/*
sudo mv /tmp/deploy/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo systemctl reload nginx
```

## ✅ Post-Deploy Checklist

- [ ] Site loads: https://spacecityeidolons.com
- [ ] No console errors (F12)
- [ ] Navigation works
- [ ] Forms submit successfully
- [ ] Cloudflare cache purged

## 🔄 Rollback (if needed)

```bash
ssh user@VM_IP
sudo cp -r /var/www/html.backup.TIMESTAMP/* /var/www/html/
sudo systemctl reload nginx
```

## 🔧 Troubleshooting

**404 on refresh?**
- Check nginx/Apache config for React Router support

**API errors?**
- Verify CORS: `spacecityeidolons.com` in backend settings
- Check `.env.production` has correct API URL

**Old version showing?**
- Purge Cloudflare cache
- Hard refresh (Ctrl+Shift+R)

---

**Full Guide**: See [DEPLOY_TO_VM.md](./DEPLOY_TO_VM.md)
