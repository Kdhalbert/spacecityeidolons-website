import { describe, it, expect, beforeAll, afterAll } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { buildApp } from '../../src/app.js';
import { FastifyInstance } from 'fastify';
import { Role, UserStatus } from '../../../src/types/index.js';
import prisma from '../../src/lib/db.js';

describe('Admin User Management API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let memberToken: string;
  let adminUserId: string;
  let memberUserId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Create admin user in database
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        discordId: 'admin-discord-123',
        discordUsername: 'AdminUser',
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    adminUserId = adminUser.id;
    adminToken = app.jwt.sign({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // Create member user in database
    const memberUser = await prisma.user.create({
      data: {
        email: 'member@test.com',
        discordId: 'member-discord-456',
        discordUsername: 'MemberUser',
        role: Role.MEMBER,
        status: UserStatus.ACTIVE,
      },
    });
    memberUserId = memberUser.id;
    memberToken = app.jwt.sign({
      userId: memberUser.id,
      email: memberUser.email,
      role: memberUser.role,
    });

    // Create additional test users
    await prisma.user.create({
      data: {
        email: 'suspended@test.com',
        discordId: 'suspended-discord-789',
        discordUsername: 'SuspendedUser',
        role: Role.MEMBER,
        status: UserStatus.SUSPENDED,
      },
    });
  });

  afterAll(async () => {
    // Clean up database
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('GET /api/admin/users', () => {
    it('lists all users with pagination (admin only)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users?page=1&limit=10',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(3);
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(10);
      expect(body.meta.total).toBeGreaterThanOrEqual(3);
      expect(body.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('filters by role', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/admin/users?role=${Role.ADMIN}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.every((u: any) => u.role === Role.ADMIN)).toBe(true);
    });

    it('filters by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/admin/users?status=${UserStatus.SUSPENDED}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.every((u: any) => u.status === UserStatus.SUSPENDED)).toBe(true);
    });

    it('searches by username', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users?search=Member',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data.some((u: any) => u.discordUsername.toLowerCase().includes('member'))).toBe(true);
    });

    it('rejects requests with invalid page', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users?page=0',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('positive integer');
    });

    it('rejects requests with invalid limit', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users?limit=0',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(400);
    });

    it('clamps limit to 100', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users?limit=200',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(400);
    });

    it('denies non-admin users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: `Bearer ${memberToken}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('denies unauthenticated requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('retrieves a user by ID (admin only)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/admin/users/${memberUserId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(memberUserId);
      expect(body.discordUsername).toBe('MemberUser');
      expect(body.role).toBe(Role.MEMBER);
    });

    it('returns 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users/nonexistent-id',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it('denies non-admin users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/admin/users/${adminUserId}`,
        headers: { authorization: `Bearer ${memberToken}` },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/admin/users/:id/role', () => {
    it('updates a user role (admin only)', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/admin/users/${memberUserId}/role`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { role: Role.ADMIN },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.role).toBe(Role.ADMIN);

      // Verify in DB
      const updated = await prisma.user.findUnique({ where: { id: memberUserId } });
      expect(updated?.role).toBe(Role.ADMIN);
    });

    it('rejects invalid role', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/admin/users/${memberUserId}/role`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { role: 'INVALID_ROLE' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/admin/users/nonexistent-id/role',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { role: Role.MEMBER },
      });

      expect(response.statusCode).toBe(404);
    });

    it('denies non-admin users', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/admin/users/${adminUserId}/role`,
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { role: Role.GUEST },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/admin/users/:id/status', () => {
    it('updates a user status (admin only)', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/admin/users/${memberUserId}/status`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: UserStatus.SUSPENDED },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(UserStatus.SUSPENDED);

      // Verify in DB
      const updated = await prisma.user.findUnique({ where: { id: memberUserId } });
      expect(updated?.status).toBe(UserStatus.SUSPENDED);
    });

    it('rejects invalid status', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/admin/users/${memberUserId}/status`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: 'INVALID_STATUS' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/admin/users/nonexistent-id/status',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: UserStatus.ACTIVE },
      });

      expect(response.statusCode).toBe(404);
    });

    it('denies non-admin users', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/admin/users/${adminUserId}/status`,
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { status: UserStatus.BANNED },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
