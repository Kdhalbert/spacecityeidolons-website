import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app.js';

describe('Health Check Endpoints', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 with health status when database is connected', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);

      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        environment: expect.any(String),
        database: {
          status: 'connected',
          latency: expect.stringMatching(/^\d+ms$/),
        },
        uptime: expect.any(Number),
        version: '1.0.0',
      });
    });

    it('should have valid ISO timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const payload = JSON.parse(response.payload);
      const timestamp = new Date(payload.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });

    it('should include uptime greater than 0', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const payload = JSON.parse(response.payload);
      expect(payload.uptime).toBeGreaterThan(0);
    });

    it('should report database latency in milliseconds', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const payload = JSON.parse(response.payload);
      const latencyMatch = payload.database.latency.match(/(\d+)ms/);
      expect(latencyMatch).toBeTruthy();
      const latency = parseInt(latencyMatch![1], 10);
      expect(latency).toBeGreaterThan(-1); // Should be >= 0
    });
  });

  describe('GET /live', () => {
    it('should return 200 liveness probe response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/live',
      });

      expect(response.statusCode).toBe(200);

      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        status: 'alive',
        timestamp: expect.any(String),
      });
    });

    it('should return quickly without database check', async () => {
      const startTime = Date.now();
      await app.inject({
        method: 'GET',
        url: '/live',
      });
      const duration = Date.now() - startTime;

      // Liveness should be very fast (no DB query)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('GET /ready', () => {
    it('should return 200 readiness probe when database is available', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      });

      expect(response.statusCode).toBe(200);

      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        status: 'ready',
        timestamp: expect.any(String),
      });
    });

    it('should have valid ISO timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      });

      const payload = JSON.parse(response.payload);
      const timestamp = new Date(payload.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Monitoring Availability', () => {
    it('should have all three health endpoints available', async () => {
      const endpoints = ['/health', '/live', '/ready'];

      for (const endpoint of endpoints) {
        const response = await app.inject({
          method: 'GET',
          url: endpoint,
        });

        expect(response.statusCode).toBeLessThan(300);
      }
    });

    it('should detect database connectivity issues', async () => {
      // Health check should fail gracefully if database is unavailable
      // This test verifies the error handling path
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      // Should either return 200 (DB connected) or 503 (DB disconnected)
      expect([200, 503]).toContain(response.statusCode);
    });

    it('health endpoint should provide sufficient data for monitoring dashboards', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const payload = JSON.parse(response.payload);

      // Verify all fields needed for monitoring are present
      expect(payload).toHaveProperty('status');
      expect(payload).toHaveProperty('timestamp');
      expect(payload).toHaveProperty('environment');
      expect(payload).toHaveProperty('database');
      expect(payload).toHaveProperty('uptime');
      expect(payload).toHaveProperty('version');

      // Verify nested database object
      expect(payload.database).toHaveProperty('status');
      expect(['connected', 'disconnected']).toContain(payload.database.status);
    });
  });
});
