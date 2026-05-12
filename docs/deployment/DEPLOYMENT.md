# Azure Deployment Guide

Complete step-by-step guide for deploying Space City Eidolons Community Hub to Azure.

## 📋 Prerequisites Checklist

- [ ] Azure subscription with Owner or Contributor role
- [ ] GitHub repository created and code pushed
- [ ] Azure CLI installed: `az --version`
- [ ] Git installed
- [ ] Node.js 20+ installed

## 🔐 Step 1: Set Up Azure Service Principal

### Create App Registration

1. **Login to Azure:**
```bash
az login
az account set --subscription <your-subscription-id>
```

2. **Create resource group:**
```bash
az group create \
  --name rg-spacecity-dev \
  --location eastus
```

3. **Create service principal with federated credentials:**
```bash
# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create app registration
APP_ID=$(az ad app create \
  --display-name "GitHub Actions - Space City Eidolons" \
  --query appId -o tsv)

# Create service principal
az ad sp create --id $APP_ID

# Get tenant ID
TENANT_ID=$(az account show --query tenantId -o tsv)

# Get object ID
OBJECT_ID=$(az ad sp show --id $APP_ID --query id -o tsv)

# Assign Contributor role to subscription
az role assignment create \
  --assignee $APP_ID \
  --role Contributor \
  --scope /subscriptions/$SUBSCRIPTION_ID

echo "Save these values for GitHub Secrets:"
echo "AZURE_CLIENT_ID: $APP_ID"
echo "AZURE_TENANT_ID: $TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
```

4. **Configure federated credentials for GitHub Actions:**
```bash
# For main branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-actions-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:YOUR_GITHUB_USERNAME/spacecityeidolons-website-new:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# For pull requests
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-actions-pr",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:YOUR_GITHUB_USERNAME/spacecityeidolons-website-new:pull_request",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

## 🔑 Step 2: Generate Secrets

### Generate JWT Secrets

```bash
# JWT Access Token Secret
JWT_SECRET=$(openssl rand -base64 48)
echo "JWT_SECRET: $JWT_SECRET"

# JWT Refresh Token Secret
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
echo "JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET"

# PostgreSQL Admin Password (save this securely!)
POSTGRES_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)Aa1!
echo "POSTGRES_ADMIN_PASSWORD: $POSTGRES_PASSWORD"
```

**Save all these values securely - you'll need them for GitHub Secrets!**

## 🔧 Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

```
AZURE_CLIENT_ID=<from Step 1>
AZURE_TENANT_ID=<from Step 1>
AZURE_SUBSCRIPTION_ID=<from Step 1>
POSTGRES_ADMIN_USERNAME=spacecityadmin
POSTGRES_ADMIN_PASSWORD=<from Step 2>
JWT_SECRET=<from Step 2>
JWT_REFRESH_SECRET=<from Step 2>
```

## 🚀 Step 4: Deploy Infrastructure

### Option A: Via GitHub Actions (Recommended)

1. Go to **Actions** tab in your repository
2. Select **"Deploy Azure Infrastructure"** workflow
3. Click **"Run workflow"**
4. Select environment: **dev**
5. Click **"Run workflow"** button
6. Wait for deployment to complete (~5-10 minutes)

### Option B: Manual Deployment

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/spacecityeidolons-website-new.git
cd spacecityeidolons-website-new

# Create parameters file
cd infrastructure/bicep
cp main.parameters.example.json main.parameters.dev.json

# Edit main.parameters.dev.json with your values
# Replace placeholders with actual secrets from Step 2

# Deploy
az deployment group create \
  --resource-group rg-spacecity-dev \
  --template-file main.bicep \
  --parameters @main.parameters.dev.json \
  --name infrastructure-$(date +%Y%m%d-%H%M%S)
```

### Verify Infrastructure Deployment

```bash
# List all resources
az resource list \
  --resource-group rg-spacecity-dev \
  --output table

# Get deployment outputs
az deployment group show \
  --resource-group rg-spacecity-dev \
  --name <deployment-name> \
  --query properties.outputs
```

You should see:
- PostgreSQL Flexible Server
- App Service Plan
- App Service (Backend API)
- Static Web App (Frontend)
- Key Vault
- Application Insights
- Log Analytics Workspace

## 📊 Step 5: Configure Key Vault Access

```bash
# Get App Service managed identity
APP_SERVICE_NAME=$(az webapp list -g rg-spacecity-dev --query "[?contains(name,'api')].name" -o tsv)
PRINCIPAL_ID=$(az webapp identity show -g rg-spacecity-dev -n $APP_SERVICE_NAME --query principalId -o tsv)

# Grant access to Key Vault
KEY_VAULT_NAME=$(az keyvault list -g rg-spacecity-dev --query "[0].name" -o tsv)
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Key Vault Secrets User" \
  --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-spacecity-dev/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME
```

## 🗄️ Step 6: Set Up Database

### Run Database Migrations

```bash
# Get database connection string from Key Vault
DATABASE_URL=$(az keyvault secret show \
  --vault-name $KEY_VAULT_NAME \
  --name database-url \
  --query value -o tsv)

# Install dependencies locally
npm install
cd api
npm install

# Run migrations
export DATABASE_URL="$DATABASE_URL"
npm run prisma:migrate:prod

# Seed the database (optional for dev)
npm run prisma:seed
```

## 🔄 Step 7: Deploy Applications

### Deploy Backend API

1. Go to **Actions** → **"Deploy Backend API"**
2. Click **"Run workflow"**
3. Select environment: **dev**
4. Wait for deployment (~3-5 minutes)

### Deploy Frontend

1. Go to **Actions** → **"Deploy Frontend"**
2. Click **"Run workflow"**
3. Select environment: **dev**
4. Wait for deployment (~2-3 minutes)

## ✅ Step 8: Verify Deployment

### Check Backend Health

```bash
# Get backend URL
BACKEND_URL=$(az webapp show -g rg-spacecity-dev -n $APP_SERVICE_NAME --query defaultHostName -o tsv)

# Test health endpoint
curl https://$BACKEND_URL/health
# Expected: {"status":"ok","timestamp":"...","environment":"dev"}
```

### Check Frontend

```bash
# Get frontend URL
FRONTEND_URL=$(az staticwebapp show -g rg-spacecity-dev -n $(az staticwebapp list -g rg-spacecity-dev --query "[0].name" -o tsv) --query defaultHostname -o tsv)

echo "Frontend URL: https://$FRONTEND_URL"
# Open in browser
```

### Test API from Frontend

1. Open frontend URL in browser
2. Open browser developer tools (F12)
3. Check Network tab for API calls
4. Verify CORS is working

## 📈 Step 9: Configure Monitoring

### Set Up Alerts (Optional)

```bash
# Get Application Insights ID
APP_INSIGHTS_ID=$(az monitor app-insights component show \
  -g rg-spacecity-dev \
  --query "[0].id" -o tsv)

# Create alert for high response time
az monitor metrics alert create \
  --name "High API Response Time" \
  --resource-group rg-spacecity-dev \
  --scopes $APP_INSIGHTS_ID \
  --condition "avg requests/duration > 1000" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## 🔄 Step 10: Ongoing Deployment

### Automated CI/CD

After initial setup, deployments are automatic:

1. **Push to main branch** → Triggers tests and deployment
2. **Create PR** → Triggers tests only
3. **Merge PR** → Triggers deployment

### Manual Deployment

Trigger workflows manually via Actions tab anytime.

## 🐛 Troubleshooting

### Issue: "Failed to authenticate"
```bash
# Re-verify service principal has Contributor role
az role assignment list --assignee $APP_ID --output table
```

### Issue: "Database connection failed"
```bash
# Check PostgreSQL firewall rules
az postgres flexible-server firewall-rule list \
  -g rg-spacecity-dev \
  -n $(az postgres flexible-server list -g rg-spacecity-dev --query "[0].name" -o tsv)

# Test connection
psql -h <postgres-hostname> -U spacecityadmin -d spacecity
```

### Issue: "Backend returns 500 errors"
```bash
# Check App Service logs
az webapp log tail -g rg-spacecity-dev -n $APP_SERVICE_NAME

# Check Application Insights
# Azure Portal → Application Insights → Failures
```

### Issue: "Frontend shows 'API Error'"
```bash
# Verify CORS settings in App Service
az webapp config appsettings list \
  -g rg-spacecity-dev \
  -n $APP_SERVICE_NAME \
  --query "[?name=='CORS_ORIGIN'].value"

# Should include your frontend URL
```

## 📚 Next Steps

1. **Set up custom domain** (optional):
   - Static Web App: Azure Portal → Static Web App → Custom domains
   - Backend API: Azure Portal → App Service → Custom domains

2. **Configure SSL certificates** (automatic with Azure managed certificates)

3. **Set up staging environment**:
   - Repeat steps with `environment=staging`
   - Use separate resource group: `rg-spacecity-staging`

4. **Configure production environment**:
   - Use production-grade SKUs (automatically selected when `environment=prod`)
   - Enable Private Link for PostgreSQL
   - Configure VNet integration

5. **Add team members**:
   - Azure Portal → Resource Group → Access control (IAM)
   - Add roles: Contributor, Reader, etc.

## 💰 Cost Management

### Monitor Costs

```bash
# Check current month's costs
az consumption usage list \
  --start-date $(date -d "1 month ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[?contains(instanceName, 'spacecity')]" \
  --output table
```

### Set Budget Alert

```bash
# Create budget (e.g., $50/month for dev)
az consumption budget create \
  --budget-name "spacecity-dev-budget" \
  --amount 50 \
  --category cost \
  --time-grain monthly \
  --time-period start-date=$(date +%Y-%m-01)
```

## 🆘 Support

- **Azure Issues**: [Azure Support](https://azure.microsoft.com/support/)
- **GitHub Actions**: Check workflow logs in Actions tab
- **Application Issues**: Review Application Insights logs

---

**Congratulations! Your application is now deployed to Azure! 🎉**
