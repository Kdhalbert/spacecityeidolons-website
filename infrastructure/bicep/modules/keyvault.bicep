// Key Vault module

@description('Key Vault name')
param name string

@description('Location for the resource')
param location string

@description('Enable for deployment')
param enabledForDeployment bool = false

@description('Enable for template deployment')
param enabledForTemplateDeployment bool = true

@description('Enable RBAC authorization')
param enableRbacAuthorization bool = true

@description('Secrets to store in Key Vault')
param secrets object = {}

@description('Tags for the resource')
param tags object = {}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enabledForDeployment: enabledForDeployment
    enabledForTemplateDeployment: enabledForTemplateDeployment
    enableRbacAuthorization: enableRbacAuthorization
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow' // Restrict in production
    }
  }
}

// Store secrets
resource databaseUrlSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (contains(secrets, 'databaseUrl')) {
  parent: keyVault
  name: 'database-url'
  properties: {
    value: secrets.databaseUrl
  }
}

resource jwtSecretSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (contains(secrets, 'jwtSecret')) {
  parent: keyVault
  name: 'jwt-secret'
  properties: {
    value: secrets.jwtSecret
  }
}

resource jwtRefreshSecretSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (contains(secrets, 'jwtRefreshSecret')) {
  parent: keyVault
  name: 'jwt-refresh-secret'
  properties: {
    value: secrets.jwtRefreshSecret
  }
}

resource postgresUsernameSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (contains(secrets, 'postgresAdminUsername')) {
  parent: keyVault
  name: 'postgres-admin-username'
  properties: {
    value: secrets.postgresAdminUsername
  }
}

resource postgresPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (contains(secrets, 'postgresAdminPassword')) {
  parent: keyVault
  name: 'postgres-admin-password'
  properties: {
    value: secrets.postgresAdminPassword
  }
}

output name string = keyVault.name
output vaultUri string = keyVault.properties.vaultUri
output databaseUrlUri string = contains(secrets, 'databaseUrl') ? databaseUrlSecret.properties.secretUri : ''
output jwtSecretUri string = contains(secrets, 'jwtSecret') ? jwtSecretSecret.properties.secretUri : ''
output jwtRefreshSecretUri string = contains(secrets, 'jwtRefreshSecret') ? jwtRefreshSecretSecret.properties.secretUri : ''
