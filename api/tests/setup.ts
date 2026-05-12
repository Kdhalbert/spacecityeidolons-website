import { afterAll } from 'vitest';

// Set environment variables at top level so they are available when modules load
// (config/index.ts validates env vars at import time)
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key-for-vitest-at-least-32-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-vitest-32-chars';
process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.DISCORD_CLIENT_SECRET = 'test-client-secret';
process.env.DISCORD_REDIRECT_URI = 'http://localhost:3000/auth/callback';

// Test teardown runs after all tests
afterAll(async () => {
  // Clean up test database connections
  // Reset test environment
});
