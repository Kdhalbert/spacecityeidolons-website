# GitHub Actions Setup for VM Deployment

## 📋 Overview

Automated deployments to **spacecityeidolons.com** via GitHub Actions. When code is merged to `master`, it automatically:
1. Builds the React production bundle
2. Creates a backup on your VM
3. Deploys new files to `/var/www/html`
4. Reloads the web server (nginx or Apache)

## 🔐 Required GitHub Secrets

You need to configure these secrets in your GitHub repository for automated deployments to work.

### Navigate to GitHub Secrets

1. Go to your repository: https://github.com/Kdhalbert/spacecityeidolons-website
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Required Secrets

#### 1. `VM_HOST`
**Description**: Your VM's static IP address or hostname  
**Example**: `40.123.45.67` or `spacecity-vm.eastus.cloudapp.azure.com`  
**How to find**: 
```bash
# If you don't know your VM IP:
az vm list-ip-addresses --resource-group YOUR_RG --name YOUR_VM_NAME --query "[0].virtualMachine.network.publicIpAddresses[0].ipAddress" -o tsv
```

#### 2. `VM_USER`
**Description**: SSH username for your VM  
**Example**: `azureuser`, `ubuntu`, or your custom username  
**Common usernames**:
- Azure VMs: Usually `azureuser`
- Ubuntu: Usually `ubuntu`
- Custom: Whatever you set during VM creation

#### 3. `VM_SSH_KEY`
**Description**: Private SSH key for authentication (entire key contents)  
**⚠️ IMPORTANT**: This is the **private key**, NOT the public key!  

**How to get**:
```bash
# If you have the key file locally:
cat ~/.ssh/id_rsa
# OR
cat ~/.ssh/your-vm-key.pem

# Copy the ENTIRE output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# (key contents)
# -----END OPENSSH PRIVATE KEY-----
```

**If you don't have the key**:
- **Option A**: Generate a new key pair and add public key to VM
- **Option B**: Reset SSH credentials on your Azure VM
- **Option C**: Use Azure Portal → VM → Reset password

#### 4. `VM_SSH_PORT` (Optional)
**Description**: SSH port (only needed if not using default port 22)  
**Example**: `22` (default)  
**When to set**: Only if you changed SSH to run on a non-standard port

## 🔑 Setting Up SSH Key (If Needed)

### Option 1: Use Existing Key

If you already SSH into your VM, you probably have the key:

```bash
# Find your SSH key
ls -la ~/.ssh/

# Common key filenames:
# - id_rsa (default)
# - id_ed25519
# - your-vm-name.pem
# - azure-vm-key.pem

# Display the private key
cat ~/.ssh/id_rsa

# Copy the entire output (including BEGIN and END lines)
```

### Option 2: Generate New Key Pair

If you need to create a new key:

```bash
# Generate new SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/spacecity-deploy

# This creates:
# - ~/.ssh/spacecity-deploy (private key - for GitHub Secret)
# - ~/.ssh/spacecity-deploy.pub (public key - for VM)

# Display private key for GitHub Secret
cat ~/.ssh/spacecity-deploy

# Display public key to add to VM
cat ~/.ssh/spacecity-deploy.pub
```

### Add Public Key to VM

SSH into your VM and add the public key:

```bash
# SSH into VM (using your current method)
ssh user@VM_IP

# Add the public key to authorized_keys
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Exit
exit

# Test the new key from your local machine
ssh -i ~/.ssh/spacecity-deploy user@VM_IP
```

## 📝 Adding Secrets to GitHub

1. **Copy each value** (VM IP, username, private key)
2. **Go to GitHub**: Repository → Settings → Secrets and variables → Actions
3. **Click "New repository secret"**
4. **Name**: `VM_HOST` (exactly as shown)
5. **Value**: Paste your VM IP address
6. **Click "Add secret"**
7. **Repeat** for `VM_USER`, `VM_SSH_KEY`, and optionally `VM_SSH_PORT`

### Example: Adding SSH Key Secret

```
Name: VM_SSH_KEY

Value:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEAw...
(many more lines)
...+tR5YwAAAA1naXRodWItYWN0aW9ucwECAwQFBg==
-----END OPENSSH PRIVATE KEY-----
```

## ✅ Testing the Setup

### Test SSH Connection Locally First

Before setting up GitHub Actions, verify SSH works:

```bash
# Test connection with your credentials
ssh -i ~/.ssh/YOUR_KEY VM_USER@VM_HOST

# Should connect without password prompt
# If it asks for password, SSH key setup needs correction
```

### Test GitHub Actions Workflow

1. **Make a small change** (e.g., edit README.md)
2. **Commit and push** to master:
   ```bash
   git add .
   git commit -m "test: verify automated deployment"
   git push origin master
   ```
3. **Watch the workflow**: 
   - Go to **Actions** tab in GitHub
   - Click on the running workflow
   - Monitor each step
   - Should complete with green checkmarks ✅

### Troubleshooting Workflow Failures

**SSH Connection Failed**:
- ✅ Verify `VM_HOST` is correct IP address
- ✅ Verify `VM_USER` matches your SSH username
- ✅ Verify `VM_SSH_KEY` is the complete private key
- ✅ Check VM firewall allows SSH from GitHub Actions (0.0.0.0/0 or GitHub's IP ranges)

**Permission Denied**:
- ✅ Public key must be in `~/.ssh/authorized_keys` on VM
- ✅ User must have sudo permissions (add to sudoers if needed)

**Web Server Reload Failed**:
- ✅ Check if user has sudo access without password prompt
- ✅ Or modify workflow to not reload (manual reload after deploy)

## 🔧 VM Sudoers Configuration (If Needed)

If GitHub Actions needs sudo without password prompts:

```bash
# SSH into VM
ssh user@VM_IP

# Edit sudoers file
sudo visudo

# Add this line at the end (replace 'azureuser' with your username):
azureuser ALL=(ALL) NOPASSWD: /bin/cp, /bin/rm, /bin/tar, /bin/chown, /bin/chmod, /usr/bin/systemctl

# Or for full sudo access (less secure):
azureuser ALL=(ALL) NOPASSWD: ALL

# Save and exit (Ctrl+X, then Y, then Enter)
```

## 🚀 Deployment Workflow

Once secrets are configured:

```
1. Developer merges PR to master
   ↓
2. GitHub Actions automatically triggers
   ↓
3. Builds React production bundle
   ↓
4. SSHs into VM
   ↓
5. Creates backup of /var/www/html
   ↓
6. Deploys new files
   ↓
7. Reloads web server
   ↓
8. ✅ Deployment complete!
```

## 📋 Manual Deployment (Bypass GitHub Actions)

If you need to deploy manually:

```bash
./deploy-to-vm.sh
```

Or follow: [DEPLOY_TO_VM.md](./DEPLOY_TO_VM.md)

## 🔄 Rollback

If a deployment breaks something:

```bash
# SSH into VM
ssh user@VM_IP

# List backups
ls -la /var/www/html.backup.*

# Restore from backup (choose timestamp)
sudo cp -r /var/www/html.backup.20260223_143022/* /var/www/html/

# Reload web server
sudo systemctl reload nginx  # or apache2
```

## 📞 Support Checklist

Before asking for help, verify:
- [ ] All 3 secrets are set in GitHub (VM_HOST, VM_USER, VM_SSH_KEY)
- [ ] SSH key works from your local machine
- [ ] VM firewall allows SSH connections
- [ ] User has sudo permissions on VM
- [ ] Web server (nginx/Apache) is running on VM
- [ ] `/var/www/html` exists and is writable

---

**Need Help?** Check the workflow logs in GitHub Actions for specific error messages.
