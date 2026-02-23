// App Service Plan and App Service module

@description('App Service Plan name')
param planName string

@description('App Service name')
param appName string

@description('Location for resources')
param location string

@description('SKU name (B1, S1, P1v3, etc.)')
param skuName string = 'B1'

@description('SKU tier (Basic, Standard, Premium, PremiumV3)')
param skuTier string = 'Basic'

@description('Linux runtime (e.g., NODE|20-lts)')
param linuxFxVersion string = 'NODE|20-lts'

@description('App settings')
param appSettings object = {}

@description('Tags for resources')
param tags object = {}

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: planName
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: skuTier
  }
  kind: 'linux'
  properties: {
    reserved: true // Required for Linux
  }
}

resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      alwaysOn: skuTier != 'Free' && skuTier != 'Shared'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: [for item in items(appSettings): {
        name: item.key
        value: item.value
      }]
      cors: {
        allowedOrigins: [
          '*' // Configure with specific origins in production
        ]
        supportCredentials: false
      }
    }
  }
}

output planName string = appServicePlan.name
output appName string = appService.name
output hostname string = appService.properties.defaultHostName
output principalId string = appService.identity.principalId
