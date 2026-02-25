import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  eventService,
  type EventListResponse,
  type EventResponse,
  type EventFilters,
  type CreateEventInput,
  type UpdateEventInput,
  type EventStats,
} from '../services/events.service';

/**
 * Query key factory for event queries
 */
const eventQueryKeys = {
  all: ['events'] as const,
  lists: () => [...eventQueryKeys.all, 'list'] as const,
  list: (filters?: EventFilters) =>
    [...eventQueryKeys.lists(), { ...filters }] as const,
  details: () => [...eventQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventQueryKeys.details(), id] as const,
  stats: () => [...eventQueryKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch visible events with pagination and filtering
 */
export function useEvents(filters?: EventFilters) {
  return useQuery<EventListResponse, Error>({
    queryKey: eventQueryKeys.list(filters),
    queryFn: () => eventService.getVisibleEvents(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch a specific event by ID
 */
export function useEvent(id: string) {
  return useQuery<EventResponse | null, Error>({
    queryKey: eventQueryKeys.detail(id),
    queryFn: () => eventService.getEventById(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch event statistics (admin only)
 */
export function useEventStats() {
  return useQuery<EventStats, Error>({
    queryKey: eventQueryKeys.stats(),
    queryFn: () => eventService.getEventStats(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<EventResponse, Error, CreateEventInput>({
    mutationFn: (input) => eventService.createEvent(input),
    onSuccess: (data) => {
      // Invalidate the events list to refetch
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
      // Add the new event to the cache
      queryClient.setQueryData(eventQueryKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation<EventResponse, Error, UpdateEventInput>({
    mutationFn: (input) => eventService.updateEvent(id, input),
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(eventQueryKeys.detail(id), data);
      // Invalidate the events list
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
  });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => eventService.deleteEvent(id),
    onSuccess: () => {
      // Invalidate the events list to refetch
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
  });
}
