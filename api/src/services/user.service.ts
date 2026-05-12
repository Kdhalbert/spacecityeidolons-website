import prisma from '../lib/db.js';
import { Role, UserStatus } from '../types/index.js';

export class UserService {
  /**
   * List users with pagination and optional filters
   */
  async list(options: {
    page?: number;
    limit?: number;
    role?: Role;
    status?: UserStatus;
    search?: string;
  } = {}) {
    // Normalize and validate pagination inputs
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const limit = Math.max(1, Math.min(100, Math.floor(options.limit ?? 20)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (options.role) where.role = options.role;
    if (options.status) where.status = options.status;
    if (options.search) {
      where.OR = [
        { discordUsername: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { profile: true },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single user by ID including their profile
   */
  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  /**
   * Update a user's role
   */
  async updateRole(id: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    return prisma.user.update({
      where: { id },
      data: { role },
      include: { profile: true },
    });
  }

  /**
   * Update a user's status (activate, suspend, ban)
   */
  async updateStatus(id: string, status: UserStatus) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    return prisma.user.update({
      where: { id },
      data: { status },
      include: { profile: true },
    });
  }
}

export const userService = new UserService();
