import { z } from 'zod';

/**
 * Game schema for validation
 */
export const gameSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const gameListSchema = z.object({
  data: z.array(gameSchema),
  count: z.number(),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type Game = z.infer<typeof gameSchema>;
export type GameList = z.infer<typeof gameListSchema>;
