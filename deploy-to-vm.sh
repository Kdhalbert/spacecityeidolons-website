#!/bin/bash
set -e

# =============================================================================
# Deploy Frontend to VM - spacecityeidolons.com
# =============================================================================
# This script builds the React frontend and deploys it to your VM
# while keeping your static IP and Cloudflare configuration unchanged.
# =============================================================================

# Configuration - UPDATE THESE VALUES
VM_IP="YOUR_VM_STATIC_IP"              # e.g., 40.123.45.67
VM_USER="YOUR_SSH_USER"                 # e.g., azureuser, ubuntu, etc.
WEB_ROOT="/var/www/html"                # Web server document root
WEB_SERVER="nginx"                      # nginx or apache2
API_URL="https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}ℹ ${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠ ${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Validation
if [ "$VM_IP" = "YOUR_VM_STATIC_IP" ]; then
    log_error "Please update VM_IP in the script with your actual VM IP address"
    exit 1
fi

if [ "$VM_USER" = "YOUR_SSH_USER" ]; then
    log_error "Please update VM_USER in the script with your actual SSH username"
    exit 1
fi

# Start deployment
echo ""
log_info "Starting deployment to spacecityeidolons.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Build frontend
log_info "Building frontend..."
echo "VITE_API_URL=$API_URL" > .env.production
npm run build

if [ $? -ne 0 ]; then
    log_error "Build failed!"
    exit 1
fi
log_success "Build complete"

# Step 2: Create deployment package
log_info "Creating deployment package..."
tar -czf frontend-build.tar.gz -C dist .
log_success "Package created: frontend-build.tar.gz"

# Step 3: Upload to VM
log_info "Uploading to VM ($VM_IP)..."
scp frontend-build.tar.gz $VM_USER@$VM_IP:/tmp/

if [ $? -ne 0 ]; then
    log_error "Upload failed! Check your SSH connection"
    rm frontend-build.tar.gz
    exit 1
fi
log_success "Upload complete"

# Step 4: Deploy on VM
log_info "Deploying on VM..."
ssh $VM_USER@$VM_IP << ENDSSH
    set -e
    
    echo "📦 Backing up current site..."
    sudo cp -r $WEB_ROOT $WEB_ROOT.backup.\$(date +%Y%m%d_%H%M%S)
    
    echo "🗑️  Clearing old files..."
    sudo rm -rf $WEB_ROOT/*
    
    echo "📂 Extracting new build..."
    cd /tmp
    sudo tar -xzf frontend-build.tar.gz -C $WEB_ROOT
    
    echo "🔒 Setting permissions..."
    sudo chown -R www-data:www-data $WEB_ROOT
    sudo chmod -R 755 $WEB_ROOT
    
    echo "🔄 Reloading web server..."
    sudo systemctl reload $WEB_SERVER
    
    echo "🧹 Cleaning up..."
    rm -f /tmp/frontend-build.tar.gz
    
    echo "✅ Deployment complete on VM!"
ENDSSH

if [ $? -ne 0 ]; then
    log_error "Deployment on VM failed!"
    rm frontend-build.tar.gz
    exit 1
fi
log_success "Deployed to VM successfully"

# Step 5: Cleanup local files
log_info "Cleaning up local files..."
rm frontend-build.tar.gz
log_success "Cleanup complete"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Deployment completed successfully!"
echo ""
log_warn "Next steps:"
echo "  1. Visit https://spacecityeidolons.com to verify"
echo "  2. Clear Cloudflare cache (Caching → Purge Everything)"
echo "  3. Test invite forms and navigation"
echo ""
