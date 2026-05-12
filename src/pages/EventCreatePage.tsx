import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHero, PageSection } from '../components/ui';
import { EventForm } from '../components/calendar/EventForm';
import { useCreateEvent } from '../hooks/useEvents';
import type { CreateEventInput } from '../services/events.service';

const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateEventInput) => {
    setError(null);
    try {
      await createEventMutation.mutateAsync(data);
      navigate(`/events`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  };

  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <>
      <PageHero
        title="Create Event"
        subtitle="Organize a gaming session"
        description="Schedule an event and invite others to join."
      />
      <PageSection>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {error && (
            <div role="alert" style={{ color: 'red', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <EventForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createEventMutation.isPending}
          />
        </div>
      </PageSection>
    </>
  );
};

export default EventCreatePage;
