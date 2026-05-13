import prisma from '../lib/db.js';
import { Platform, InviteStatus } from '../types/index.js';
import {
  CreateInviteRequestInput,
  CreateMemberRequestInput,
  UpdateInviteRequestInput,
/* eslint-disable @typescript-eslint/no-explicit-any */
} from '../schemas/inviteRequest.schema.js';
import { Role } from '@prisma/client';

export class InviteRequestService {
  /**
   * Create a new invite request
   * Checks for duplicate email+platform combinations
   */
  async create(data: CreateInviteRequestInput) {
    // Check for existing pending request with same email and platform
    const existingRequest = await prisma.inviteRequest.findFirst({
      where: {
        email: data.email,
        platform: data.platform,
        status: InviteStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new Error('An invite request for this email and platform already exists');
    }

    return prisma.inviteRequest.create({
      data: {
        email: data.email,
        name: data.name,
        platform: data.platform,
        message: data.message,
        status: InviteStatus.PENDING,
      },
    });
  }

  /**
   * Create an authenticated member request for a guest user.
   */
  async createMemberRequest(userId: string, data: CreateMemberRequestInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        email: true,
        discordUsername: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== Role.GUEST) {
      throw new Error('Only guest users can submit member requests');
    }

    const email = data.email?.trim() || user.email || '';
    if (!email) {
      throw new Error('An email address is required to submit a member request');
    }

    const name = data.name?.trim() || user.discordUsername;
    const message = data.message?.trim()
      ? `[Member Request] ${data.message.trim()}`
      : '[Member Request] Guest user requested promotion to MEMBER';

    return this.create({
      email,
      name,
      platform: Platform.DISCORD,
      message,
    });
  }

  /**
   * Get all invite requests with pagination and filtering
   */
  async list(options: {
    page?: number;
    limit?: number;
    status?: InviteStatus;
    platform?: Platform;
  } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) {
      where.status = options.status;
    }
    if (options.platform) {
      where.platform = options.platform;
    }

    const [data, total] = await Promise.all([
      prisma.inviteRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inviteRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single invite request by ID
   */
  async getById(id: string) {
    return prisma.inviteRequest.findUnique({
      where: { id },
    });
  }

  /**
   * Update an invite request (typically status or admin note)
   */
  async update(id: string, data: UpdateInviteRequestInput) {
    // Check if invite request exists
    const inviteRequest = await this.getById(id);
    if (!inviteRequest) {
      throw new Error('Invite request not found');
    }

    return prisma.inviteRequest.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an invite request
   */
  async delete(id: string) {
    return prisma.inviteRequest.delete({
      where: { id },
    });
  }
}

export const inviteRequestService = new InviteRequestService();
