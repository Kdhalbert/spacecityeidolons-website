# Azure Infrastructure as Code

This directory contains Bicep templates for deploying the Space City Eidolons Community Hub infrastructure to Azure.

## 📁 Structure

```
infrastructure/
└── bicep/
    ├── main.bicep                          # Main orchestration template
    ├── main.parameters.json                # Parameter template file
    ├── main.parameters.example.json        # Example parameters
    └── modules/
        ├── postgresql.bicep                # PostgreSQL Flexible Server
        ├── appservice.bicep                # App Service Plan & App Service
        ├── staticwebapp.bicep              # Static Web App
        ├── keyvault.bicep                  # Key Vault for secrets
        └── monitoring.bicep                # Application Insights & Log Analytics
```

## 🚀 Quick Start

### Prerequisites

- Azure CLI installed: `az --version`
- Azure subscription with appropriate permissions
- GitHub repository with required secrets configured

### GitHub Secrets Required

Configure these secrets in your GitHub repository (Settings → Secrets → Actions):

**Azure Authentication (Federated Credentials - Recommended):**
- `AZURE_CLIENT_ID` - App registration client ID
- `AZURE_TENANT_ID` - Azure AD tenant ID
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID

**Infrastructure Secrets:**
- `POSTGRES_ADMIN_USERNAME` - PostgreSQL admin username (e.g., `spacecityadmin`)
- `POSTGRES_ADMIN_PASSWORD` - PostgreSQL admin password (min 8 chars, must include uppercase, lowercase, digit)
- `JWT_SECRET` - JWT signing secret (min 32 chars, use: `openssl rand -base64 48`)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (min 32 chars, use: `openssl rand -base64 48`)

### Deployment via GitHub Actions

1. **Trigger Infrastructure Deployment:**
   - Go to Actions → Deploy Azure Infrastructure → Run workflow
   - Select environment (dev/staging/prod)
   - Click "Run workflow"

2. **Deploy Backend API:**
   - Go to Actions → Deploy Backend API → Run workflow
   - Select same environment
   - Click "Run workflow"

3. **Deploy Frontend:**
   - Go to Actions → Deploy Frontend → Run workflow
   - Select same environment
   - Click "Run workflow"

### Manual Deployment (Local)

**1. Login to Azure:**
```bash
az login
az account set --subscription <your-subscription-id>
```

**2. Create Resource Group:**
```bash
az group create \
  --name rg-spacecity-dev \
  --location eastus
```

**3. Create Parameters File:**
```bash
cd infrastructure/bicep
cp main.parameters.example.json main.parameters.dev.json
# Edit main.parameters.dev.json with your values
```

**4. Validate Templates:**
```bash
az deployment group validate \
  --resource-group rg-spacecity-dev \
  --template-file main.bicep \
  --parameters @main.parameters.dev.json
```

**5. Deploy Infrastructure:**
```bash
az deployment group create \
  --resource-group rg-spacecity-dev \
  --template-file main.bicep \
  --parameters @main.parameters.dev.json \
  --name spacecity-infrastructure-$(date +%Y%m%d-%H%M%S)
```

**6. Get Deployment Outputs:**
```bash
az deployment group show \
  --resource-group rg-spacecity-dev \
  --name <deployment-name> \
  --query properties.outputs
```

## 🔧 Configuration

### Environment-Specific Settings

The infrastructure automatically adjusts based on the `environment` parameter:

| Resource | Dev | Staging | Prod |
|----------|-----|---------|------|
| PostgreSQL | B1ms (Burstable) | B1ms | D2s_v3 (General Purpose) |
| App Service | B1 (Basic) | B1 | P1v3 (Premium) |
| Static Web App | Free | Free | Standard |
| Database Storage | 32 GB | 32 GB | 128 GB |

### Customization

Edit [main.bicep](bicep/main.bicep) to modify:
- Resource naming conventions (variables section)
- SKU tiers for different environments
- Database configurations
- App Service settings

## 🔐 Security

### Key Vault Integration

All secrets are automatically stored in Azure Key Vault:
- Database connection string
- PostgreSQL credentials
- JWT secrets

App Service retrieves secrets using managed identity and Key Vault references:
```bicep
JWT_SECRET: '@Microsoft.KeyVault(SecretUri=${keyVault.outputs.jwtSecretUri})'
```

### Network Security

**Development:**
- PostgreSQL: Public access enabled with IP allowlist
- All services: Public endpoints

**Production (Recommended):**
- Enable Azure Private Link for PostgreSQL
- Restrict App Service to VNet integration
- Use Azure Firewall or Application Gateway

## 📊 Monitoring

Application Insights is automatically configured for:
- API performance monitoring
- Exception tracking
- Custom metrics
- Distributed tracing

Access through Azure Portal → Application Insights → your-app-insights-name

## 💰 Cost Estimation

### Development Environment (Monthly)
- PostgreSQL Flexible Server (B1ms): ~$13
- App Service (B1): ~$13
- Static Web App (Free): $0
- Key Vault: $0.03/10k operations
- Application Insights: First 5GB free, then $2.30/GB
- **Total: ~$30-40/month**

### Production Environment (Monthly)
- PostgreSQL Flexible Server (D2s_v3): ~$150
- App Service (P1v3): ~$90
- Static Web App (Standard): ~$9
- Key Vault: $0.03/10k operations
- Application Insights: Scale-based pricing
- **Total: ~$250-350/month**

## 🔄 Updates & Maintenance

### Updating Infrastructure

1. Modify Bicep templates in feature branch
2. Create pull request
3. Validation runs automatically on PR
4. Merge to main triggers deployment

### Database Migrations

Run after deploying infrastructure changes:
```bash
# Backend deployment workflow automatically runs:
npm run prisma:migrate:prod
```

### Monitoring Deployments

Check deployment history:
```bash
az deployment group list \
  --resource-group rg-spacecity-dev \
  --output table
```

## 🧪 Testing

Validate templates locally without deploying:
```bash
az bicep build --file main.bicep
az deployment group what-if \
  --resource-group rg-spacecity-dev \
  --template-file main.bicep \
  --parameters @main.parameters.dev.json
```

## 📚 Resources

- [Bicep Documentation](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [PostgreSQL Flexible Server](https://docs.microsoft.com/azure/postgresql/flexible-server/)
- [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Key Vault](https://docs.microsoft.com/azure/key-vault/)

## 🆘 Troubleshooting

### Deployment Fails

1. Check validation errors: `az deployment group validate ...`
2. Verify secrets are set in GitHub
3. Check resource naming conflicts
4. Review Activity Log in Azure Portal

### App Service Not Starting

1. Check Application Insights logs
2. Verify Key Vault access permissions
3. Check environment variables in App Service Configuration
4. Review App Service logs: `az webapp log tail`

### Database Connection Issues

1. Verify PostgreSQL firewall rules
2. Check connection string in Key Vault
3. Test connectivity: `psql -h <hostname> -U <username> -d spacecity`
4. Review PostgreSQL server logs in Azure Portal
