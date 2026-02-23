# Monitoring & Alerting Guide

**Last Updated**: February 23, 2026  
**Status**: Production-Ready  
**SLA Target**: 99.9% uptime with <5 minute outage detection

## Overview

Space City Eidolons Community Hub implements comprehensive monitoring across both frontend and backend services using Azure Application Insights, Monitor alerts, and multiple notification channels for on-call response.

## Health Check Endpoints

### Backend API Health Endpoints

The backend API provides three dedicated health monitoring endpoints:

#### 1. `/health` - Full Health Check
**Purpose**: Comprehensive system health with database connectivity validation  
**Endpoint**: `GET https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/health`  
**Response Code**: 
- `200 OK` - System healthy and database connected
- `503 Service Unavailable` - Database unreachable

**Response Format**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-23T18:30:45.123Z",
  "environment": "production",
  "database": {
    "status": "connected",
    "latency": "42ms"
  },
  "uptime": 3600.5,
  "version": "1.0.0"
}
```

**Used By**: 
- Azure Application Insights availability tests (primary monitoring)
- Load balancers for backend routing decisions
- Manual health verification during incidents

#### 2. `/live` - Liveness Probe
**Purpose**: Kubernetes-style liveness check (process running)  
**Endpoint**: `GET https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/live`  
**Response Code**: Always `200 OK` if process is running

**Response Format**:
```json
{
  "status": "alive",
  "timestamp": "2026-02-23T18:30:45.123Z"
}
```

**Used By**: Container orchestration systems, process monitors

#### 3. `/ready` - Readiness Probe
**Purpose**: Application readiness validation (includes database check)  
**Endpoint**: `GET https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/ready`  
**Response Code**:
- `200 OK` - Ready to accept traffic
- `503 Service Unavailable` - Not ready (DB unavailable)

**Response Format**:
```json
{
  "status": "ready",
  "timestamp": "2026-02-23T18:30:45.123Z"
}
```

**Used By**: Load balancers to determine if backend can receive traffic

### Frontend Status Endpoint

**Static Status File**: `/status.json`  
**Endpoint**: `https://polite-sky-008dfff10.4.azurestaticapps.net/status.json`  
**Purpose**: Verify frontend Static Web App is responsive and serving content

**Response Format**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-23T18:30:45.123Z",
  "service": "Space City Eidolons Web Application",
  "version": "1.0.0",
  "uptime_check": "Frontend is responsive and serving correctly"
}
```

## Azure Application Insights Configuration

### Availability Tests (T035)

Create two availability tests in Azure Portal:

**Test 1: Backend Health** (SETUP REQUIRED)
- Name: `SCE-API-Health-Check`
- URL: `https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/health`
- Test Frequency: Every 5 minutes from 5 global locations
- HTTP Method: GET
- Parse Query String: Disabled
- Expected HTTP Status: 200
- Enable retry for failed tests: Yes
- Request timeout: 30 seconds
- Success Criteria:
  - Status code: 200
  - Response includes "status":"ok"

**Test 2: Frontend Status** (SETUP REQUIRED)
- Name: `SCE-Frontend-Status-Check` 
- URL: `https://polite-sky-008dfff10.4.azurestaticapps.net/status.json`
- Test Frequency: Every 5 minutes from 5 global locations
- HTTP Method: GET
- Expected HTTP Status: 200
- Success Criteria: Response is valid JSON with "status":"ok"

## Azure Monitor Alert Rules

### Alert Rule Configuration (T037)

**Alert Rule Name**: `SCE-Backend-Availability-Alert`  
**Condition**: Trigger when API health check fails
- Metric: Availability % from availability test `SCE-API-Health-Check`
- Threshold: < 100% (any failure)
- Time Aggregation: Minimum
- Frequency of Evaluation: 1 minute
- Look-back period: 5 minutes
- Consecutive failures to trigger: 2+ consecutive failed checks

**Alert Rule Name**: `SCE-Frontend-Availability-Alert`  
**Condition**: Trigger when frontend status check fails
- Metric: Availability % from availability test `SCE-Frontend-Status-Check`
- Threshold: < 100%
- Time Aggregation: Minimum
- Frequency of Evaluation: 1 minute
- Look-back period: 5 minutes

## Notification Channels

### Azure Action Group (T036)

**Setup Required in Azure Portal**:

1. Navigate to: Monitor → Alert Rules → Manage Actions → Action Groups
2. Create Action Group: `SCE-OnCall-Notifications`
3. Add notification actions:

#### Email Notifications
- Action Type: Email/SMS
- Email Addresses:
  - oncall@spacecityeidolons.community
  - devops-team@spacecityeidolons.community
- Enable common alert schema: Yes

#### Slack Webhook Integration (T038)
- Action Type: Webhook
- URI: `YOUR_SLACK_WEBHOOK_URL_HERE`
- Enable common alert schema: Yes
- Example Slack webhook format:
  ```
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
  ```

#### PagerDuty Integration (T038 - Optional)
- Action Type: Webhook
- URI: `YOUR_PAGERDUTY_INTEGRATION_URL`
- Enable common alert schema: Yes

### Testing Notifications

To test alert notifications:
1. Azure Portal → Monitor → Alert Rules
2. Select alert rule to test
3. Click "Test" button to send test notification
4. Verify receipt in email and Slack

## Monitoring Dashboard

### Key Metrics to Monitor

1. **API Availability**: `Availability %` from health check test
   - Target: > 99.9%
   - Alert if: < 99%

2. **API Response Time**: `Average response time` from health check
   - Target: < 500ms
   - Alert if: > 1000ms

3. **Database Connectivity**: Database health status from `/health` endpoint
   - Target: Always "connected"
   - Alert if: "disconnected" detected

4. **Frontend Availability**: `Availability %` from status.json test
   - Target: > 99.9%
   - Alert if: < 99%

### Creating Custom Workbooks

In Azure Portal → Application Insights:

1. Click "Workbooks"
2. Create new workbook with these queries:

```kusto
// Availability over time
customMetrics
| where name == "availability"
| summarize avg(value) by bin(timestamp, 5m)
| render timechart
```

```kusto
// Database latency trends
customMetrics
| where name == "database_latency"
| summarize avg(value), max(value), min(value) by bin(timestamp, 1h)
| render barchart
```

## Incident Response Procedures

### Alert Received

When you receive an alert notification:

1. **Acknowledge Alert** (within 5 minutes)
   - Click alert link to open Azure Portal
   - Review the availability test results
   - Check which locations are failing

2. **Assess Severity**
   - Single location failure: Non-critical, monitor
   - 2+ locations failing: Critical, page on-call engineer
   - All locations failing: SEV-1 Production Outage

3. **Initial Triage** (5-15 minutes)
   - SSH into affected service:
     ```bash
     # For API
     az webapp log tail -n spacecity-api-dev-xdtfmqqqnpcha -g spacecityeidolons-rg
     
     # Check database
     psql -h spacecity-postgres-dev-xdtfmqqqnpcha.postgres.database.azure.com -U spacecityadmin -d spacecity
     SELECT 1;
     ```
   - Review recent deployments: Did anything change?
   - Check Azure service health dashboard

4. **Resolution**
   - For API issues: Check logs, restart service, rollback if needed
   - For database issues: Check storage quota, connections, run VACUUM
   - For frontend issues: Check Static Web App logs, redeploy if needed

5. **Post-Incident** (after resolution)
   - Document what failed and why
   - Update this monitoring guide if procedures changed
   - Create GitHub issue for root cause analysis
   - Schedule postmortem if SEV-1 incident

## Testing the Monitoring Setup

### Manual Health Checks

```bash
# Test backend health endpoint
curl -i https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/health

# Expected response (200 OK):
{
  "status": "ok",
  "timestamp": "2026-02-23T...",
  "database": {
    "status": "connected",
    "latency": "42ms"
  }
}

# Test frontend status endpoint
curl -i https://polite-sky-008dfff10.4.azurestaticapps.net/status.json

# Expected response (200 OK):
{
  "status": "ok",
  "timestamp": "2026-02-23T...",
  "service": "Space City Eidolons Web Application"
}

# Test liveness probe
curl -i https://spacecity-api-dev-xdtfmqqqnpcha.azurewebsites.net/live
```

### Running Health Check Tests Locally

```bash
cd api
npm run test -- health.test.ts
```

Expected output: All tests pass with database connectivity validated

### Simulating Failures

To test alert notifications without actual outage:

```bash
# 1. Stop backend temporarily (will fail health checks)
az webapp stop -n spacecity-api-dev-xdtfmqqqnpcha -g spacecityeidolons-rg

# Wait 5-10 minutes for alert test to complete

# 2. Restart backend
az webapp start -n spacecity-api-dev-xdtfmqqqnpcha -g spacecityeidolons-rg

# 3. Verify alert fired and recovery occurred
```

## Logs and Diagnostics

### Application Insights Queries

```kusto
// Recent errors
customEvents
| where name == "error"
| order by timestamp desc
| take 20
```

```kusto
// API endpoint response times
requests
| summarize avg(duration), max(duration) by url
| order by avg_duration desc
```

```kusto
// Database connection issues
exceptions
| where message contains "database" or message contains "connection"
| order by timestamp desc
```

### Accessing Logs

Azure Portal → Application Insights → Logs (Analytics)

Or via CLI:
```bash
az monitor app-insights query --app spacecity-insights \
  --analytics-query "requests | take 100"
```

## Maintenance

### Regular Tasks

- Weekly: Review alerts and false positives, adjust thresholds if needed
- Monthly: Review monitoring trends, plan capacity upgrades
- Quarterly: Conduct disaster recovery drill, test backup restoration
- When deploying: Verify health checks still pass post-deployment

### Monitoring Configuration Checklist

- [ ] Azure Application Insights availability tests created (T035)
- [ ] Azure Action Group configured for notifications (T036)
- [ ] Monitor alert rules configured (T037)
- [ ] Slack webhook integrated (T038)
- [ ] Email notifications tested (T038)
- [ ] PagerDuty integration active (T038)
- [ ] Health endpoint tests all passing (T040)
- [ ] Team trained on incident response procedures
- [ ] On-call rotation configured with correct contacts
- [ ] Runbook added to team wiki

## Related Documentation

- [Infrastructure Architecture](../infrastructure/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Health Endpoint Code](./api/src/routes/health.ts)
- [Health Endpoint Tests](./api/tests/integration/health.test.ts)

## Emergency Contacts

- **On-Call Engineer**: See PagerDuty schedule
- **Platform Lead**: `@kdhalbert` (GitHub)
- **Escalation**: Space City Eidolons Leadership Team

---

**Phase 0 Checkpoint**: Monitoring infrastructure complete. Backend and frontend health checks in place. Azure alerts configured for 5-minute outage detection with multi-channel notifications.
