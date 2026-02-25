import React from 'react';
import { formatDate } from '../../utils/dateUtils';
import type { EventResponse } from '../../services/events.service';
import { Button } from '../Button';
import '../calendar/EventCard.css';

interface EventCardProps {
  event: EventResponse;
  onView?: (event: EventResponse) => void;
  onEdit?: (event: EventResponse) => void;
  onDelete?: (eventId: string) => void;
  showCreator?: boolean;
  isOwner?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onView,
  onEdit,
  onDelete,
  showCreator = true,
  isOwner = false,
}) => {
  const visibilityBadgeClass = `visibility-badge visibility-${event.visibility.toLowerCase()}`;
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  return (
    <div className={`event-card ${isPast ? 'past' : ''}`}>
      <div className="event-card-header">
        <div>
          <h3 className="event-title">{event.title}</h3>
          <span className={visibilityBadgeClass}>{event.visibility}</span>
        </div>
        {isOwner && (
          <div className="event-card-actions">
            {onEdit && (
              <button
                className="action-btn"
                onClick={() => onEdit(event)}
                title="Edit event"
                aria-label="Edit event"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                className="action-btn delete"
                onClick={() => onDelete(event.id)}
                title="Delete event"
                aria-label="Delete event"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      <div className="event-card-body">
        <div className="event-datetime">
          <span className="event-date">📅 {formatDate(eventDate)}</span>
          <span className="event-time">⏰ {event.time}</span>
          {event.endTime && <span className="event-end-time">- {event.endTime}</span>}
        </div>

        {event.location && (
          <div className="event-location">📍 {event.location}</div>
        )}

        {event.description && (
          <p className="event-description">{event.description}</p>
        )}

        {event.games && event.games.length > 0 && (
          <div className="event-games">
            <strong>Games:</strong>
            <div className="games-list">
              {event.games.map((game) => (
                <span key={game} className="game-tag">
                  {game}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="event-info-row">
          {event.maxAttendees && (
            <span className="event-attendees">
              👥 Max: {event.maxAttendees}
            </span>
          )}
          {event.recurring && (
            <span className="event-recurring">🔁 Recurring</span>
          )}
        </div>

        {showCreator && (
          <div className="event-creator">
            {event.creator.discordAvatar ? (
              <img
                src={event.creator.discordAvatar}
                alt={event.creator.discordUsername}
                className="creator-avatar"
              />
            ) : (
              <div className="creator-avatar-placeholder" />
            )}
            <span className="creator-name">{event.creator.discordUsername}</span>
          </div>
        )}
      </div>

      {onView && (
        <div className="event-card-footer">
          <Button
            variant="primary"
            onClick={() => onView(event)}
            style={{ width: '100%' }}
          >
            View Event Details
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
