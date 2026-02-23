import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../../app';
import { FastifyInstance } from 'fastify';
import { Platform, InviteStatus } from '../../types';

describe('Invite Requests API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let memberToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Create admin user and get token
    const adminResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'admin@test.com',
        username: 'admin',
        password: 'Admin123!@#',
      },
    });
    const adminData = JSON.parse(adminResponse.body);
    adminToken = adminData.accessToken;

    // Promote admin user
    // NOTE: This assumes we have a way to promote users, may need to be done directly in DB
    // For now, assuming the first user is auto-admin or we have a way to do this

    // Create member user and get token
    const memberResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'member@test.com',
        username: 'member',
        password: 'Member123!@#',
      },
    });
    const memberData = JSON.parse(memberResponse.body);
    memberToken = memberData.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/invites', () => {
    it('creates a Discord invite request with valid data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'newplayer@example.com',
          name: 'New Player',
          platform: Platform.DISCORD,
          message: 'I would love to join the community!',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.email).toBe('newplayer@example.com');
      expect(body.name).toBe('New Player');
      expect(body.platform).toBe(Platform.DISCORD);
      expect(body.status).toBe(InviteStatus.PENDING);
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('creates a Matrix invite request with valid data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'matrix-user@example.com',
          name: 'Matrix User',
          platform: Platform.MATRIX,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.platform).toBe(Platform.MATRIX);
      expect(body.status).toBe(InviteStatus.PENDING);
    });

    it('creates invite request without optional message', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'nomessage@example.com',
          name: 'No Message',
          platform: Platform.DISCORD,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.message).toBeUndefined();
    });

    it('rejects invite request with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'not-an-email',
          name: 'Test User',
          platform: Platform.DISCORD,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.message).toContain('email');
    });

    it('rejects invite request with missing name', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'test@example.com',
          platform: Platform.DISCORD,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('rejects invite request with invalid platform', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'test@example.com',
          name: 'Test User',
          platform: 'SLACK',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects duplicate email for same platform', async () => {
      // First request
      await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'duplicate@example.com',
          name: 'First Request',
          platform: Platform.DISCORD,
        },
      });

      // Duplicate request
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'duplicate@example.com',
          name: 'Second Request',
          platform: Platform.DISCORD,
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.message).toContain('already exists');
    });

    it('allows same email for different platforms', async () => {
      const email = 'multi-platform@example.com';

      // Discord request
      const discordResponse = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email,
          name: 'Multi Platform User',
          platform: Platform.DISCORD,
        },
      });

      expect(discordResponse.statusCode).toBe(201);

      // Matrix request with same email
      const matrixResponse = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email,
          name: 'Multi Platform User',
          platform: Platform.MATRIX,
        },
      });

      expect(matrixResponse.statusCode).toBe(201);
    });

    it('trims whitespace from email and name', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: '  whitespace@example.com  ',
          name: '  Whitespace User  ',
          platform: Platform.DISCORD,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.email).toBe('whitespace@example.com');
      expect(body.name).toBe('Whitespace User');
    });

    it('does not require authentication to create invite request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'guest@example.com',
          name: 'Guest User',
          platform: Platform.DISCORD,
        },
      });

      expect(response.statusCode).toBe(201);
    });
  });

  describe('GET /api/invites', () => {
    let inviteId: string;

    beforeEach(async () => {
      // Create a test invite request
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'list-test@example.com',
          name: 'List Test User',
          platform: Platform.DISCORD,
        },
      });
      const body = JSON.parse(response.body);
      inviteId = body.id;
    });

    it('returns list of invite requests for admin', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/invites',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.pagination).toBeDefined();
    });

    it('returns paginated results', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/invites?page=1&limit=5',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBeLessThanOrEqual(5);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(5);
    });

    it('filters by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/invites?status=${InviteStatus.PENDING}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((invite: any) => {
        expect(invite.status).toBe(InviteStatus.PENDING);
      });
    });

    it('filters by platform', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/invites?platform=${Platform.DISCORD}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((invite: any) => {
        expect(invite.platform).toBe(Platform.DISCORD);
      });
    });

    it('requires authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/invites',
      });

      expect(response.statusCode).toBe(401);
    });

    it('requires admin role', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/invites',
        headers: {
          authorization: `Bearer ${memberToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('admin');
    });

    it('includes all invite fields in response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/invites',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      const invite = body.data[0];
      
      expect(invite).toHaveProperty('id');
      expect(invite).toHaveProperty('email');
      expect(invite).toHaveProperty('name');
      expect(invite).toHaveProperty('platform');
      expect(invite).toHaveProperty('status');
      expect(invite).toHaveProperty('createdAt');
      expect(invite).toHaveProperty('updatedAt');
    });
  });

  describe('PATCH /api/invites/:id', () => {
    let inviteId: string;

    beforeEach(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/invites',
        payload: {
          email: 'patch-test@example.com',
          name: 'Patch Test User',
          platform: Platform.DISCORD,
        },
      });
      const body = JSON.parse(response.body);
      inviteId = body.id;
    });

    it('allows admin to approve invite request', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/invites/${inviteId}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          status: InviteStatus.APPROVED,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(InviteStatus.APPROVED);
    });

    it('allows admin to reject invite request with note', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/invites/${inviteId}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          status: InviteStatus.REJECTED,
          adminNote: 'Spam request',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(InviteStatus.REJECTED);
      expect(body.adminNote).toBe('Spam request');
    });

    it('allows admin to add note without changing status', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/invites/${inviteId}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          adminNote: 'Following up with applicant',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.adminNote).toBe('Following up with applicant');
      expect(body.status).toBe(InviteStatus.PENDING);
    });

    it('requires authentication', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/invites/${inviteId}`,
        payload: {
          status: InviteStatus.APPROVED,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('requires admin role', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/invites/${inviteId}`,
        headers: {
          authorization: `Bearer ${memberToken}`,
        },
        payload: {
          status: InviteStatus.APPROVED,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('returns 404 for non-existent invite', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/invites/00000000-0000-0000-0000-000000000000',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          status: InviteStatus.APPROVED,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
