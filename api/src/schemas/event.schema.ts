import { z } from 'zod';

/**
 * Schema for creating a new event
 * Required fields: title, date, time, visibility
 * Optional fields: description, endTime, location, maxAttendees, games, recurring
 */
export const createEventSchema = z.object({
  title: z.string().toLowerCase().trim().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional().default(''),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format').optional(),
  location: z.string().max(255).optional().default('Online'),
  visibility: z.enum(['PUBLIC', 'MEMBER', 'PRIVATE', 'ADMIN']).default('PUBLIC'),
  maxAttendees: z.number().int().positive('Max attendees must be positive').optional(),
  games: z.array(z.string()).optional().default([]),
  recurring: z.boolean().optional().default(false),
  recurringPattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  recurringEndDate: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

/**
 * Schema for updating an existing event
 * All fields are optional (partial update)
 */
export const updateEventSchema = createEventSchema.partial().strict();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/**
 * Schema for querying/filtering events
 * Supports pagination, date range filtering, game filtering
 */
export const queryEventsSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date format').optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date format').optional(),
  game: z.string().optional(),
  limit: z.number().int().positive('Limit must be positive').max(100, 'Limit must be at most 100').default(20),
  offset: z.number().int().nonnegative('Offset must be non-negative').default(0),
  visibility: z.enum(['PUBLIC', 'MEMBER', 'PRIVATE', 'ADMIN']).optional(),
  creatorId: z.string().optional(),
  searchTerm: z.string().optional(),
});

export type QueryEventsInput = z.infer<typeof queryEventsSchema>;

/**
 * Response schema for a single event
 */
export const eventResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.date(),
  time: z.string(),
  endTime: z.string().nullable(),
  location: z.string(),
  visibility: z.enum(['PUBLIC', 'MEMBER', 'PRIVATE', 'ADMIN']),
  maxAttendees: z.number().nullable(),
  attendeeCount: z.number(),
  games: z.array(z.string()),
  recurring: z.boolean(),
  recurringPattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).nullable(),
  recurringEndDate: z.date().nullable(),
  creator: z.object({
    id: z.string(),
    discordUsername: z.string(),
    discordAvatar: z.string().nullable(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EventResponse = z.infer<typeof eventResponseSchema>;

/**
 * Response schema for event list with pagination
 */
export const eventListResponseSchema = z.object({
  data: z.array(eventResponseSchema),
  count: z.number(),
  totalCount: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type EventListResponse = z.infer<typeof eventListResponseSchema>;
