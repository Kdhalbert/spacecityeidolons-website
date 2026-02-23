# Deploy to VM Guide - spacecityeidolons.com

This guide covers deploying the new React frontend to your existing VM while keeping your static IP and Cloudflare configuration unchanged.

## 📋 Overview

**Domain**: spacecityeidolons.com  
**Current Setup**: VM with static IP → Cloudflare DNS/Proxy  
**Deployment**: Replace frontend files on VM, keep everything else the same  
**Backend**: Azure App Service (spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net)

## 🚀 Deployment Steps

### Step 1: Build the Frontend

```bash
# From the project root directory
cd /path/to/spacecityeidolons-website-new

# Set the API URL to point to Azure backend
echo "VITE_API_URL=https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net" > .env.production

# Install dependencies (if not already done)
npm ci

# Build for production
npm run build

# This creates a 'dist/' folder with all static files
```

**Build output location**: `./dist/`

### Step 2: Prepare Deployment Package

```bash
# Option A: Create a tarball for easy transfer
tar -czf frontend-build.tar.gz -C dist .

# Option B: Create a zip file (Windows-friendly)
# PowerShell:
Compress-Archive -Path dist\* -DestinationPath frontend-build.zip

# The package contains:
# - index.html (entry point)
# - assets/ (JS, CSS, images)
# - Any other static files
```

### Step 3: Transfer to VM

**Replace these with your VM details:**
- VM IP: `YOUR_VM_STATIC_IP`
- SSH User: `YOUR_SSH_USER`
- Web Root: `/var/www/html` (adjust for your setup)

```bash
# Option A: Using SCP
scp frontend-build.tar.gz YOUR_SSH_USER@YOUR_VM_STATIC_IP:/tmp/

# Option B: Using SFTP
sftp YOUR_SSH_USER@YOUR_VM_STATIC_IP
put frontend-build.tar.gz /tmp/
bye

# Option C: If you have rsync
rsync -avz --delete dist/ YOUR_SSH_USER@YOUR_VM_STATIC_IP:/var/www/html/
```

### Step 4: Deploy on VM

SSH into your VM and deploy:

```bash
# SSH into VM
ssh YOUR_SSH_USER@YOUR_VM_STATIC_IP

# Backup current site (IMPORTANT!)
sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S)

# Extract new build
cd /tmp
tar -xzf frontend-build.tar.gz

# Deploy to web root
sudo rm -rf /var/www/html/*
sudo mv * /var/www/html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Verify files are in place
ls -la /var/www/html
```

### Step 5: Configure Web Server

#### For Nginx

Edit your nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/spacecityeidolons
```

```nginx
server {
    listen 80;
    server_name spacecityeidolons.com www.spacecityeidolons.com;

    # Root directory for React build
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support - all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Optional: API proxy to avoid CORS (if needed)
    # location /api/ {
    #     proxy_pass https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host $host;
    #     proxy_cache_bypass $http_upgrade;
    # }
}
```

Test and reload nginx:

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

#### For Apache

Edit your Apache configuration:

```bash
sudo nano /etc/apache2/sites-available/spacecityeidolons.conf
```

```apache
<VirtualHost *:80>
    ServerName spacecityeidolons.com
    ServerAlias www.spacecityeidolons.com

    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Cache static assets
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    ErrorLog ${APACHE_LOG_DIR}/spacecity_error.log
    CustomLog ${APACHE_LOG_DIR}/spacecity_access.log combined
</VirtualHost>
```

Enable required modules and reload:

```bash
# Enable mod_rewrite (for React Router)
sudo a2enmod rewrite
sudo a2enmod headers

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2

# Check status
sudo systemctl status apache2
```

### Step 6: Update Backend CORS

The backend needs to allow requests from spacecityeidolons.com:

```bash
# In Azure Portal or via Azure CLI
az webapp config appsettings set \
  --name spacecity-api-dev-xdtfmqqqnpcha \
  --resource-group spacecityeidolons-rg \
  --settings CORS_ORIGIN="https://spacecityeidolons.com,https://www.spacecityeidolons.com,http://localhost:5173"
```

Or update in `api/.env.azure`:
```env
CORS_ORIGIN=https://spacecityeidolons.com,https://www.spacecityeidolons.com
```

Then restart the App Service.

### Step 7: Test Deployment

```bash
# Test from your local machine
curl -I https://spacecityeidolons.com

# Should return 200 OK and serve index.html

# Test in browser
# 1. Open https://spacecityeidolons.com
# 2. Check browser console for errors (F12)
# 3. Test "Request Invite" form submission
# 4. Verify navigation works (all routes)
# 5. Check that images load correctly
```

### Step 8: Clear Cloudflare Cache

Important! Clear Cloudflare cache to ensure users get the new version:

```bash
# In Cloudflare dashboard:
1. Go to Caching → Configuration
2. Click "Purge Everything"
3. Confirm purge

# Or via Cloudflare API (if you have API key):
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "X-Auth-Email: YOUR_EMAIL" \
  -H "X-Auth-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## 🔄 Automated Deployment Script

Save this as `deploy-to-vm.sh`:

```bash
#!/bin/bash
set -e

# Configuration
VM_IP="YOUR_VM_STATIC_IP"
VM_USER="YOUR_SSH_USER"
WEB_ROOT="/var/www/html"
API_URL="https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net"

echo "🏗️  Building frontend..."
echo "VITE_API_URL=$API_URL" > .env.production
npm run build

echo "📦 Creating deployment package..."
tar -czf frontend-build.tar.gz -C dist .

echo "📤 Uploading to VM..."
scp frontend-build.tar.gz $VM_USER@$VM_IP:/tmp/

echo "🚀 Deploying on VM..."
ssh $VM_USER@$VM_IP << 'ENDSSH'
  # Backup current site
  sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S)
  
  # Deploy new build
  cd /tmp
  sudo rm -rf /var/www/html/*
  sudo tar -xzf frontend-build.tar.gz -C /var/www/html
  
  # Set permissions
  sudo chown -R www-data:www-data /var/www/html
  sudo chmod -R 755 /var/www/html
  
  # Restart web server
  sudo systemctl reload nginx  # or apache2
  
  echo "✅ Deployment complete!"
ENDSSH

echo "🧹 Cleaning up..."
rm frontend-build.tar.gz

echo "✅ Done! Visit https://spacecityeidolons.com to verify deployment"
```

Make it executable:
```bash
chmod +x deploy-to-vm.sh
```

## 🔍 Troubleshooting

### Issue: 404 errors on page refresh

**Cause**: Web server not configured for client-side routing  
**Solution**: Ensure nginx `try_files` or Apache `RewriteRule` is configured (see Step 5)

### Issue: API calls failing

**Cause**: CORS not configured or wrong API URL  
**Solution**: 
1. Verify `.env.production` has correct `VITE_API_URL`
2. Check backend CORS settings include `spacecityeidolons.com`
3. Check browser console for specific error messages

### Issue: Old version still showing

**Cause**: Cloudflare cache or browser cache  
**Solution**:
1. Purge Cloudflare cache (see Step 8)
2. Hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Check VM files are actually updated: `ls -la /var/www/html`

### Issue: CSS/JS not loading

**Cause**: Wrong file permissions or paths  
**Solution**:
```bash
# Check file ownership
ls -la /var/www/html

# Fix permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

## ✅ Verification Checklist

After deployment, verify:
- [ ] Site loads at https://spacecityeidolons.com
- [ ] No console errors in browser (F12 → Console)
- [ ] Navigation works (Home, Games, Events, Profile pages)
- [ ] "Request Invite" button scrolls to form
- [ ] Discord invite form submits successfully
- [ ] Matrix invite form submits successfully
- [ ] Form validation works (try invalid email)
- [ ] Success messages display after submission
- [ ] All images and assets load correctly
- [ ] Mobile responsive design works
- [ ] Page refresh works on all routes (no 404)

## 🔐 Security Notes

1. **Always backup** before deploying: `cp -r /var/www/html /var/www/html.backup`
2. **Test locally first**: Run `npm run preview` to test production build
3. **Monitor logs**: `sudo tail -f /var/log/nginx/error.log` (or Apache logs)
4. **Keep secrets safe**: Never commit `.env.production` to git
5. **SSL/HTTPS**: Ensure Cloudflare SSL is set to "Full" or "Full (strict)"

## 📞 Support

If issues arise:
1. Check VM logs: `sudo tail -f /var/log/nginx/error.log`
2. Check backend logs: Azure Portal → App Service → Log Stream
3. Check Cloudflare settings: Ensure proxy is enabled (🟧 orange cloud)
4. Roll back if needed: `sudo cp -r /var/www/html.backup.TIMESTAMP/* /var/www/html/`

---

**Last Updated**: February 23, 2026  
**Domain**: spacecityeidolons.com  
**Backend API**: spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net
