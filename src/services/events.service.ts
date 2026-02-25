import api from '../lib/api';
import { EventVisibility } from '../types';

export interface EventCreator {
  id: string;
  discordUsername: string;
  discordAvatar: string | null;
}

export interface EventResponse {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string | null;
  location?: string;
  visibility: EventVisibility;
  maxAttendees?: number | null;
  games?: string[];
  recurring: boolean;
  recurringPattern?: string | null;
  recurringEndDate?: string | null;
  creatorId: string;
  creator: EventCreator;
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  data: EventResponse[];
  count: number;
  totalCount: number;
  limit: number;
  offset: number;
}

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  game?: string;
  visibility?: EventVisibility;
  creatorId?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  visibility?: EventVisibility;
  maxAttendees?: number;
  games?: string[];
  recurring?: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  endTime?: string;
  location?: string;
  visibility?: EventVisibility;
  maxAttendees?: number;
  games?: string[];
  recurring?: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  averageAttendees?: number;
}

export const eventService = {
  /**
   * Get visible events with optional filtering
   */
  async getVisibleEvents(filters?: EventFilters): Promise<EventListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.game) params.append('game', filters.game);
      if (filters.visibility) params.append('visibility', filters.visibility);
      if (filters.creatorId) params.append('creatorId', filters.creatorId);
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const response = await api.get(`/api/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a specific event by ID
   */
  async getEventById(id: string): Promise<EventResponse | null> {
    try {
      const response = await api.get(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Create a new event (requires authentication)
   */
  async createEvent(input: CreateEventInput): Promise<EventResponse> {
    const response = await api.post('/api/events', input);
    return response.data;
  },

  /**
   * Update an existing event (requires authentication and ownership)
   */
  async updateEvent(id: string, input: UpdateEventInput): Promise<EventResponse> {
    const response = await api.put(`/api/events/${id}`, input);
    return response.data;
  },

  /**
   * Delete an event (requires authentication and ownership)
   */
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/api/events/${id}`);
  },

  /**
   * Get event statistics (requires admin role)
   */
  async getEventStats(): Promise<EventStats> {
    try {
      const response = await api.get('/api/events/stats');
      return response.data;
    } catch (error) {
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        pastEvents: 0,
      };
    }
  },
};
