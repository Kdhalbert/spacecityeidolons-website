import prisma from '../lib/db.js';
import { EventVisibility, User, Role, Event } from '@prisma/client';
import { CreateEventInput, UpdateEventInput, QueryEventsInput } from '../schemas/event.schema.js';

/**
 * Filter events based on user role and visibility settings
 * 
 * Visibility Rules:
 * - PUBLIC: visible to everyone
 * - MEMBERS_ONLY: visible to members and admins
 * - PRIVATE: visible only to creator and admins
 * - ADMIN: visible only to admins
 * 
 * @param events - Array of events to filter
 * @param user - Current user (null for unauthenticated)
 * @param isCreator - Whether the user is the event creator
 * @returns Filtered array of events
 */
export function filterEventsByVisibility(events: Event[], user: User | null | undefined, isCreator: boolean): Event[] {
  return events.filter((event) => {
    // Creator can always see their own events
    if (isCreator) return true;

    // Based on visibility level
    switch (event.visibility) {
      case EventVisibility.PUBLIC:
        return true;

      case EventVisibility.MEMBERS_ONLY: {
        // Only members and above can see
        if (!user) return false;
        const memberRole = user.role;
        return memberRole === 'MEMBER' || memberRole === 'ADMIN';
      }

      case EventVisibility.PRIVATE:
        // Only creator and admin can see
        return user?.role === Role.ADMIN;

      case EventVisibility.ADMIN: {
        // Only admin can see
        if (!user) return false;
        const adminRole = user.role;
        return adminRole === 'ADMIN';
      }

      default:
        return false;
    }
  });
}

/**
 * Get visible events for a user
 * Only returns events the user should be able to see
 */
export async function getVisibleEvents(
  userId: string | null,
  userRole?: Role,
  filters?: QueryEventsInput
) {
  const where: Record<string, unknown> = {};

  // Apply date range filters
  if (filters?.startDate && filters?.endDate) {
    where.date = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  // Apply game filter
  if (filters?.game) {
    where.games = {
      has: filters.game,
    };
  }

  // Apply search term
  if (filters?.searchTerm) {
    where.OR = [
      { title: { contains: filters.searchTerm, mode: 'insensitive' } },
      { description: { contains: filters.searchTerm, mode: 'insensitive' } },
    ];
  }

  // Apply visibility filter based on user role
  if (!userRole || userRole === Role.GUEST) {
    // Guests and unauthenticated users only see PUBLIC events
    where.visibility = EventVisibility.PUBLIC;
  } else if (userRole === Role.MEMBER) {
    // Members see PUBLIC and MEMBERS_ONLY events, plus all events they created.
    // This keeps list behavior aligned with the "creator can always see own events" rule.
    where.OR = [
      { visibility: { in: [EventVisibility.PUBLIC, EventVisibility.MEMBERS_ONLY] } },
      ...(userId ? [{ creatorId: userId }] : []),
    ];
  }
  // Admins see everything (no visibility filter)

  const limit = Math.min(filters?.limit || 20, 100);
  const offset = filters?.offset || 0;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            discordUsername: true,
            discordAvatar: true,
          },
        },
      },
      orderBy: { date: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    data: events,
    count: events.length,
    totalCount: total,
    limit,
    offset,
  };
}

/**
 * Get a single event with visibility checks
 */
export async function getEventById(eventId: string, userId: string | null, userRole?: Role) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: {
        select: {
          id: true,
          discordUsername: true,
          discordAvatar: true,
        },
      },
    },
  });

  if (!event) return null;

  // Check visibility
  const isCreator = event.creatorId === userId;
  const user = userRole ? { role: userRole } as User : null;
  const canView = filterEventsByVisibility([event], user, isCreator)[0];

  return canView || null;
}

/**
 * Create a new event
 */
export async function createEvent(input: CreateEventInput, creatorId: string, userRole?: Role) {
  const requestedVisibility = input.visibility || EventVisibility.PUBLIC;
  const isAdmin = userRole === Role.ADMIN;
  if (!isAdmin && (requestedVisibility === EventVisibility.PUBLIC || requestedVisibility === EventVisibility.ADMIN)) {
    throw new Error('Forbidden visibility');
  }

  const [date, time] = [new Date(input.date + 'T' + input.time), input.time];

  return prisma.event.create({
    data: {
      title: input.title,
      description: input.description || '',
      date,
      time,
      endTime: input.endTime,
      location: input.location || 'Online',
      visibility: requestedVisibility,
      maxAttendees: input.maxAttendees,
      games: input.games || [],
      recurring: input.recurring || false,
      recurringPattern: input.recurringPattern,
      recurringEndDate: input.recurringEndDate ? new Date(input.recurringEndDate) : null,
      creatorId,
    },
    include: {
      creator: {
        select: {
          id: true,
          discordUsername: true,
          discordAvatar: true,
        },
      },
    },
  });
}

/**
 * Update an existing event
 */
export async function updateEvent(eventId: string, input: UpdateEventInput, userId: string, userRole?: Role) {
  // Verify user is the creator or an admin
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new Error('Event not found');
  const isAdmin = userRole === Role.ADMIN;
  if (!isAdmin && event.creatorId !== userId) throw new Error('Unauthorized');

  const updateData: Partial<Event> = {};

  if (input.title) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.date) {
    const newDate = new Date(input.date + 'T' + (input.time || event.time));
    updateData.date = newDate;
  }
  if (input.time) updateData.time = input.time;
  if (input.endTime !== undefined) updateData.endTime = input.endTime;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.visibility) updateData.visibility = input.visibility;
  if (input.maxAttendees !== undefined) updateData.maxAttendees = input.maxAttendees;
  if (input.games !== undefined) updateData.games = input.games;
  if (input.recurring !== undefined) updateData.recurring = input.recurring;
  if (input.recurringPattern !== undefined) updateData.recurringPattern = input.recurringPattern;
  if (input.recurringEndDate !== undefined) updateData.recurringEndDate = input.recurringEndDate ? new Date(input.recurringEndDate) : null;

  return prisma.event.update({
    where: { id: eventId },
    data: updateData,
    include: {
      creator: {
        select: {
          id: true,
          discordUsername: true,
          discordAvatar: true,
        },
      },
    },
  });
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string, userId: string, userRole?: Role) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new Error('Event not found');
  const isAdmin = userRole === Role.ADMIN;
  if (!isAdmin && event.creatorId !== userId) throw new Error('Unauthorized');

  return prisma.event.delete({
    where: { id: eventId },
  });
}

/**
 * Get event statistics
 */
export async function getEventStats(userId?: string, dateRange?: { start: Date; end: Date }) {
  const where: Record<string, unknown> = {};

  if (dateRange) {
    where.date = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  if (userId) {
    where.creatorId = userId;
  }

  const [totalEvents, publicEvents, memberEvents, privateEvents] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.count({ where: { ...where, visibility: EventVisibility.PUBLIC } }),
    prisma.event.count({ where: { ...where, visibility: EventVisibility.MEMBERS_ONLY } }),
    prisma.event.count({ where: { ...where, visibility: EventVisibility.PRIVATE } }),
  ]);

  return {
    totalEvents,
    publicEvents,
    memberEvents,
    privateEvents,
  };
}
