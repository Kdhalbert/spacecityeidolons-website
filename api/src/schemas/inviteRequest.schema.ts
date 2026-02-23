import { z } from 'zod';
import { Platform, InviteStatus } from '../../../src/types';

/**
 * Schema for creating a new invite request
 * Used by public endpoint POST /api/invites (no auth required)
 */
export const createInviteRequestSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  platform: z.nativeEnum(Platform, {
    errorMap: () => ({ message: 'Platform must be either DISCORD or MATRIX' }),
  }),
  message: z.string().trim().max(1000, 'Message must not exceed 1000 characters').optional(),
});

/**
 * Schema for updating an invite request
 * Used by admin endpoint PATCH /api/invites/:id
 */
export const updateInviteRequestSchema = z.object({
  status: z.nativeEnum(InviteStatus).optional(),
  adminNote: z.string().trim().optional(),
});

/**
 * Schema for invite request API responses
 */
export const inviteRequestResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  platform: z.nativeEnum(Platform),
  message: z.string().optional(),
  status: z.nativeEnum(InviteStatus),
  adminNote: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export types
export type CreateInviteRequestInput = z.infer<typeof createInviteRequestSchema>;
export type UpdateInviteRequestInput = z.infer<typeof updateInviteRequestSchema>;
export type InviteRequestResponse = z.infer<typeof inviteRequestResponseSchema>;
