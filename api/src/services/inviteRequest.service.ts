import prisma from '../lib/db.js';
import { Platform, InviteStatus } from '../types/index.js';
import {
  CreateInviteRequestInput,
  UpdateInviteRequestInput,
} from '../schemas/inviteRequest.schema.js';

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
      pagination: {
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
