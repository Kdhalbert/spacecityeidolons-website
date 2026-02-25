import React, { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import type { EventFilters } from '../../services/events.service';
import { EventCard } from './EventCard';
import { Loading } from '../Loading';
import '../calendar/EventList.css';

interface EventListProps {
  filters?: EventFilters;
  onEventSelect?: (eventId: string) => void;
  onEventEdit?: (eventId: string) => void;
  onEventDelete?: (eventId: string) => void;
  showPagination?: boolean;
  isOwner?: (creatorId: string) => boolean;
}

export const EventList: React.FC<EventListProps> = ({
  filters,
  onEventSelect,
  onEventEdit,
  onEventDelete,
  showPagination = true,
  isOwner,
}) => {
  const [pagination, setPagination] = useState({
    limit: filters?.limit || 20,
    offset: filters?.offset || 0,
  });

  const combinedFilters = { ...filters, ...pagination };
  const { data, isLoading, error } = useEvents(combinedFilters);

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const handlePreviousPage = () => {
    setPagination((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination({
      limit: newLimit,
      offset: 0,
    });
  };

  if (isLoading) {
    return <Loading message="Loading events..." />;
  }

  if (error) {
    return (
      <div className="event-list-error">
        <p>❌ Failed to load events: {error.message}</p>
        <small>Please try again later or contact support if the problem persists.</small>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="event-list-empty">
        <p>📅 No events found.</p>
        <small>
          {filters?.searchTerm
            ? `No events match your search: "${filters.searchTerm}"`
            : 'Check back soon for upcoming gaming sessions and events!'}
        </small>
      </div>
    );
  }

  const hasNextPage = pagination.offset + pagination.limit < data.totalCount;
  const hasPreviousPage = pagination.offset > 0;

  return (
    <div className="event-list">
      <div className="event-list-header">
        <p className="event-list-info">
          Showing {pagination.offset + 1}-
          {Math.min(pagination.offset + pagination.limit, data.totalCount)} of{' '}
          {data.totalCount} events
        </p>

        {showPagination && (
          <div className="event-list-controls">
            <label htmlFor="limit-select" className="limit-label">
              Per page:
            </label>
            <select
              id="limit-select"
              className="limit-select"
              value={pagination.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div className="event-list-items">
        {data.data.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onView={() => onEventSelect?.(event.id)}
            onEdit={() => onEventEdit?.(event.id)}
            onDelete={() => onEventDelete?.(event.id)}
            isOwner={isOwner?.(event.creatorId) ?? false}
            showCreator
          />
        ))}
      </div>

      {showPagination && (
        <div className="event-list-pagination">
          <button
            className="pagination-btn"
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
            aria-label="Previous page"
          >
            ← Previous
          </button>

          <span className="pagination-info">
            Page {Math.floor(pagination.offset / pagination.limit) + 1}
          </span>

          <button
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={!hasNextPage}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default EventList;
