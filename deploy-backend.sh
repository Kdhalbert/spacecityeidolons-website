#!/bin/bash
# Deploy backend API to App Service

RG="spacecityeidolons-rg"
APP_NAME="spacecity-api-dev-xdtfmqqqnpcha"

# Set app settings with environment variables
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$APP_NAME" \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    "DATABASE_URL=postgresql://spacecityadmin:SpaceCityvv9bBXL6b0LI2024!@spacecity-postgres-dev-xdtfmqqqnpcha.postgres.database.azure.com:5432/spacecity?sslmode=require" \
    "JWT_SECRET=tQ5QtIRFH7sl/QiQoOg0yWuGoA/ev3MO7HxjiCLhLZt0qNw20KrHSGzsupsYz5QL" \
    "JWT_REFRESH_SECRET=45hdmxV1xpmVMnAJBnEqRbvek8ZKzGF9R63/SHtDNLTqlz4nzK0zSZ6cvPSkusB7" \
    "CORS_ORIGIN=https://polite-sky-008dfff10.4.azurestaticapps.net"

echo "App settings configured successfully"
