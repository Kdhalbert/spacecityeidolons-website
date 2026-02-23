// PostgreSQL Flexible Server module

@description('Server name')
param serverName string

@description('Location for the server')
param location string

@description('Administrator username')
param administratorLogin string

@description('Administrator password')
@secure()
param administratorPassword string

@description('SKU name (e.g., Standard_B1ms, Standard_D2s_v3)')
param skuName string = 'Standard_B1ms'

@description('SKU tier (Burstable, GeneralPurpose, MemoryOptimized)')
param skuTier string = 'Burstable'

@description('Storage size in GB')
param storageSizeGB int = 32

@description('PostgreSQL version')
param postgresVersion string = '16'

@description('Enable public network access')
param enablePublicAccess bool = true

@description('Tags for the resource')
param tags object = {}

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: serverName
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: skuTier
  }
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorPassword
    version: postgresVersion
    storage: {
      storageSizeGB: storageSizeGB
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// Create database
resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: 'spacecity'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Allow Azure services to access the server
resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = if (enablePublicAccess) {
  parent: postgresServer
  name: 'AllowAllAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Allow all IPs for development (remove in production)
resource devFirewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = if (enablePublicAccess) {
  parent: postgresServer
  name: 'AllowAllIPs'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

output serverName string = postgresServer.name
output fullyQualifiedDomainName string = postgresServer.properties.fullyQualifiedDomainName
output databaseName string = database.name
