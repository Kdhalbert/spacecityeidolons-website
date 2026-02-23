// Static Web App module

@description('Static Web App name')
param name string

@description('Location for the resource')
param location string

@description('SKU name (Free or Standard)')
param skuName string = 'Free'

@description('GitHub repository URL')
param repositoryUrl string

@description('GitHub branch')
param branch string = 'main'

@description('App location in repository')
param appLocation string = '/'

@description('API location in repository')
param apiLocation string = ''

@description('Output location (build artifacts)')
param outputLocation string = 'dist'

@description('Tags for the resource')
param tags object = {}

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: skuName
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: appLocation
      apiLocation: apiLocation
      outputLocation: outputLocation
    }
    provider: 'GitHub'
  }
}

output name string = staticWebApp.name
output defaultHostname string = staticWebApp.properties.defaultHostname
output deploymentToken string = staticWebApp.listSecrets().properties.apiKey
