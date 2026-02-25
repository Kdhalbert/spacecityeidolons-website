import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHero, PageSection, SectionTitle } from '../components/ui';
import { EventList } from '../components/calendar/EventList';
import { EventCalendar } from '../components/calendar/EventCalendar';
import { EventFiltering } from '../components/calendar/EventFiltering';
import type { EventFilters } from '../services/events.service';
import './EventsPage.css';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EventFilters>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Update filters when date is selected from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    setFilters((prev) => ({
      ...prev,
      startDate: dateStr,
      endDate: dateStr,
    }));
  };

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    setSelectedDate(null);
  };

  const handleEventSelect = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const getCurrentUserId = () => {
    // This would normally come from auth context
    // For now, returning null to show all events as non-owned
    return null;
  };

  const isEventOwner = (creatorId: string) => {
    return getCurrentUserId() === creatorId;
  };

  return (
    <>
      <PageHero
        title="Events"
        subtitle="Gaming Sessions & Gatherings"
        description="Discover upcoming events and gaming sessions you can join."
      />
      <PageSection>
        <div className="events-page-container">
          <div className="events-main">
            <div className="events-header">
              <SectionTitle subtitle="Find your next adventure.">
                Upcoming Events
              </SectionTitle>
            </div>

            <EventFiltering
              onFilterChange={handleFilterChange}
              games={[
                'Valorant',
                'CS:GO',
                'League of Legends',
                'Dota 2',
                'Overwatch',
                'Minecraft',
              ]}
            />

            {selectedDate && (
              <div className="selected-date-badge">
                📅 Events on {selectedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                <button
                  className="clear-date-btn"
                  onClick={() => {
                    setSelectedDate(null);
                    setFilters({});
                  }}
                  aria-label="Clear date selection"
                >
                  ✕
                </button>
              </div>
            )}

            <EventList
              filters={filters}
              onEventSelect={handleEventSelect}
              isOwner={isEventOwner}
              showPagination
            />
          </div>

          <aside className="events-sidebar">
            <div className="sidebar-card">
              <h3>Calendar</h3>
              <EventCalendar
                onDateSelect={handleDateSelect}
                onNavigate={(date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  setFilters((prev) => ({
                    ...prev,
                    startDate: dateStr,
                  }));
                }}
              />
            </div>
          </aside>
        </div>
      </PageSection>
    </>
  );
};

export default EventsPage;
