// Main Bicep template for Space City Eidolons Community Hub
// This orchestrates all Azure resources needed for the application

targetScope = 'resourceGroup'

@description('Environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Application name prefix')
param appName string = 'spacecity'

@description('PostgreSQL administrator username')
@secure()
param postgresAdminUsername string

@description('PostgreSQL administrator password')
@secure()
param postgresAdminPassword string

@description('JWT secret for access tokens')
@secure()
param jwtSecret string

@description('JWT secret for refresh tokens')
@secure()
param jwtRefreshSecret string

@description('Your GitHub repository (owner/repo)')
param githubRepo string

@description('Frontend custom domain without protocol (optional)')
param frontendCustomDomain string = ''

@description('Discord OAuth Client ID')
@secure()
param discordClientId string

@description('Discord OAuth Client Secret')
@secure()
param discordClientSecret string

@description('Discord OAuth Redirect URI')
@secure()
param discordRedirectUri string

@description('Tags to apply to all resources')
param tags object = {
  Environment: environment
  Application: 'SpaceCityEidolons'
  ManagedBy: 'Bicep'
}

// Generate unique resource names
var uniqueSuffix = uniqueString(resourceGroup().id)
var postgresServerName = '${appName}-postgres-${environment}-${uniqueSuffix}'
var appServicePlanName = '${appName}-plan-${environment}-${uniqueSuffix}'
var appServiceName = '${appName}-api-${environment}-${uniqueSuffix}'
var staticWebAppName = '${appName}-web-${environment}-${uniqueSuffix}'
var keyVaultName = '${appName}kv${take(uniqueSuffix, 10)}'
var appInsightsName = '${appName}-insights-${environment}-${uniqueSuffix}'
var logAnalyticsName = '${appName}-logs-${environment}-${uniqueSuffix}'
var corsAllowedOrigins = empty(frontendCustomDomain)
  ? [
      'https://${staticWebApp.outputs.defaultHostname}'
    ]
  : [
      'https://${staticWebApp.outputs.defaultHostname}'
      'https://${frontendCustomDomain}'
    ]
var corsOriginValue = join(corsAllowedOrigins, ',')

// PostgreSQL Flexible Server
module postgres 'modules/postgresql.bicep' = {
  name: 'postgresql-deployment'
  params: {
    serverName: postgresServerName
    location: location
    administratorLogin: postgresAdminUsername
    administratorPassword: postgresAdminPassword
    skuName: environment == 'prod' ? 'Standard_D2s_v3' : 'Standard_B1ms'
    skuTier: environment == 'prod' ? 'GeneralPurpose' : 'Burstable'
    storageSizeGB: environment == 'prod' ? 128 : 32
    postgresVersion: '16'
    enablePublicAccess: true // For development; restrict in production
    tags: tags
  }
}

// App Service Plan and App Service for Backend API
module appService 'modules/appservice.bicep' = {
  name: 'appservice-deployment'
  params: {
    planName: appServicePlanName
    appName: appServiceName
    location: location
    skuName: environment == 'prod' ? 'P1v3' : 'B1'
    skuTier: environment == 'prod' ? 'PremiumV3' : 'Basic'
    linuxFxVersion: 'NODE|20-lts'
    appSettings: {
      NODE_ENV: 'production'
      DATABASE_URL: '@Microsoft.KeyVault(SecretUri=${keyVault.outputs.databaseUrlUri})'
      JWT_SECRET: '@Microsoft.KeyVault(SecretUri=${keyVault.outputs.jwtSecretUri})'
      JWT_REFRESH_SECRET: '@Microsoft.KeyVault(SecretUri=${keyVault.outputs.jwtRefreshSecretUri})'
      JWT_ACCESS_EXPIRES_IN: '15m'
      JWT_REFRESH_EXPIRES_IN: '7d'
      DISCORD_CLIENT_ID: '@Microsoft.KeyVault(SecretUri=${keyVault.outputs.vaultUri}secrets/discord-client-id)'
      DISCORD_CLIENT_SECRET: '@Microsoft.KeyVault(SecretUri=${keyVault.outputs.vaultUri}secrets/discord-client-secret)'
      DISCORD_REDIRECT_URI: '@Microsoft.KeyVault(SecretUri=${keyVault.outputs.vaultUri}secrets/discord-redirect-uri)'
      CORS_ORIGIN: corsOriginValue
      APPLICATIONINSIGHTS_CONNECTION_STRING: monitoring.outputs.connectionString
      PORT: '8080'
      HOST: '0.0.0.0'
    }
    corsAllowedOrigins: corsAllowedOrigins
    corsSupportCredentials: true
    tags: tags
  }
}

// Static Web App for Frontend
module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticwebapp-deployment'
  params: {
    name: staticWebAppName
    location: location
    skuName: environment == 'prod' ? 'Standard' : 'Free'
    repositoryUrl: 'https://github.com/${githubRepo}'
    branch: environment == 'prod' ? 'main' : 'develop'
    appLocation: '/'
    apiLocation: ''
    outputLocation: 'dist'
    tags: tags
  }
}

// Key Vault for Secrets
module keyVault 'modules/keyvault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    name: keyVaultName
    location: location
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enableRbacAuthorization: true
    secrets: {
      databaseUrl: 'postgresql://${postgresAdminUsername}:${postgresAdminPassword}@${postgres.outputs.fullyQualifiedDomainName}:5432/spacecity?sslmode=require'
      jwtSecret: jwtSecret
      jwtRefreshSecret: jwtRefreshSecret
      postgresAdminUsername: postgresAdminUsername
      postgresAdminPassword: postgresAdminPassword
      discordClientId: discordClientId
      discordClientSecret: discordClientSecret
      discordRedirectUri: discordRedirectUri
    }
    tags: tags
  }
}

resource deployedKeyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource appServiceKeyVaultSecretsUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, keyVaultName, appServiceName, 'key-vault-secrets-user')
  scope: deployedKeyVault
  properties: {
    principalId: appService.outputs.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
  }
}

// Application Insights for Monitoring
module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    appInsightsName: appInsightsName
    logAnalyticsName: logAnalyticsName
    location: location
    tags: tags
  }
}

// Outputs
output postgresServerName string = postgres.outputs.serverName
output postgresHostname string = postgres.outputs.fullyQualifiedDomainName
output appServiceName string = appService.outputs.appName
output appServiceHostname string = appService.outputs.hostname
output staticWebAppName string = staticWebApp.outputs.name
output staticWebAppHostname string = staticWebApp.outputs.defaultHostname
output keyVaultName string = keyVault.outputs.name
output appInsightsInstrumentationKey string = monitoring.outputs.instrumentationKey
output appInsightsConnectionString string = monitoring.outputs.connectionString
