import { z } from 'zod';

export const gamePageRequestSchema = z.object({
  id: z.string().uuid(),
  requesterId: z.string().uuid(),
  gameName: z.string().min(2).max(120),
  description: z.string().max(500).nullable().optional(),
  reason: z.string().min(10).max(1000),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS']),
  adminNote: z.string().max(1000).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createGamePageRequestSchema = z.object({
  gameName: z.string().trim().min(2, 'Game name must be at least 2 characters').max(120),
  description: z.string().trim().max(500).optional(),
  reason: z.string().trim().min(10, 'Reason must be at least 10 characters').max(1000),
});

export const gamePageRequestListSchema = z.object({
  data: z.array(gamePageRequestSchema),
  count: z.number(),
});

export type GamePageRequest = z.infer<typeof gamePageRequestSchema>;
export type CreateGamePageRequestInput = z.infer<typeof createGamePageRequestSchema>;
