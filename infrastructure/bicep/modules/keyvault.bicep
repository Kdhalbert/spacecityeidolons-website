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
@secure()
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

resource discordClientIdSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (contains(secrets, 'discordClientId')) {
  parent: keyVault
  name: 'discord-client-id'
  properties: {
    value: secrets.discordClientId
  }
}

resource discordClientSecretSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (contains(secrets, 'discordClientSecret')) {
  parent: keyVault
  name: 'discord-client-secret'
  properties: {
    value: secrets.discordClientSecret
  }
}

resource discordRedirectUriSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (contains(secrets, 'discordRedirectUri')) {
  parent: keyVault
  name: 'discord-redirect-uri'
  properties: {
    value: secrets.discordRedirectUri
  }
}

output name string = keyVault.name
output vaultUri string = keyVault.properties.vaultUri
output databaseUrlUri string = contains(secrets, 'databaseUrl') ? databaseUrlSecret!.properties.secretUri : ''
output jwtSecretUri string = contains(secrets, 'jwtSecret') ? jwtSecretSecret!.properties.secretUri : ''
output jwtRefreshSecretUri string = contains(secrets, 'jwtRefreshSecret') ? jwtRefreshSecretSecret!.properties.secretUri : ''
