import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventList } from '../components/calendar/EventList';
import { EventForm } from '../components/calendar/EventForm';
import { DarkCard, PageHero, PageSection } from '../components/ui';
import { useDeleteEvent, useEvents } from '../hooks/useEvents';
import { eventService, type CreateEventInput, type EventResponse } from '../services/events.service';

const toDateInput = (iso: string): string => {
  const date = new Date(iso);
  return date.toISOString().split('T')[0];
};

const AdminEventsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useEvents({ limit: 100, offset: 0 });
  const deleteMutation = useDeleteEvent();

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEventInput }) =>
      eventService.updateEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setEditingEvent(null);
      setErrorMessage(null);
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErrorMessage(message ?? 'Failed to update event.');
    },
  });

  const events = useMemo(() => data?.data ?? [], [data]);

  const handleDelete = async (eventId: string) => {
    const target = events.find((event) => event.id === eventId);
    const title = target?.title ?? 'this event';
    const confirmed = window.confirm(`Delete ${title}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(eventId);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setErrorMessage(null);
    } catch {
      setErrorMessage('Failed to delete event.');
    }
  };

  const handleEditSubmit = async (input: CreateEventInput) => {
    if (!editingEvent) {
      return;
    }

    await updateMutation.mutateAsync({
      id: editingEvent.id,
      payload: input,
    });
  };

  return (
    <>
      <PageHero
        title="Event Management"
        subtitle="Admins can edit or delete any event and manage public-facing scheduling."
      />
      <PageSection>
        <div className="admin-toolbar">
          <Link to="/admin/users" className="btn btn-secondary btn-sm">User Management</Link>
          <Link to="/admin/invites" className="btn btn-secondary btn-sm">Invite Requests</Link>
          <Link to="/admin/game-requests" className="btn btn-secondary btn-sm">Game Requests</Link>
          <Link to="/admin/games" className="btn btn-secondary btn-sm">Game Pages</Link>
          <Link to="/events/new" className="btn btn-primary btn-sm admin-toolbar-right">Create Event</Link>
        </div>

        {editingEvent && (
          <DarkCard>
            <h3 className="form-intro-title">Edit Event</h3>
            <p className="form-intro-copy">You are editing: {editingEvent.title}</p>

            {errorMessage && <p className="admin-error">{errorMessage}</p>}

            <EventForm
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setEditingEvent(null);
                setErrorMessage(null);
              }}
              initialValues={{
                title: editingEvent.title,
                description: editingEvent.description,
                date: toDateInput(editingEvent.date),
                time: editingEvent.time,
                endTime: editingEvent.endTime || '',
                location: editingEvent.location || '',
                visibility: editingEvent.visibility,
                recurring: editingEvent.recurring,
              }}
              isLoading={updateMutation.isPending}
              submitLabel="Save Event"
            />
          </DarkCard>
        )}

        <DarkCard>
          <h3 className="form-intro-title">All Events</h3>

          {isLoading && <p className="admin-loading">Loading events…</p>}
          {isError && <p className="admin-error">Failed to load events.</p>}

          {!isLoading && !isError && (
            <EventList
              filters={{ limit: 100, offset: 0 }}
              onEventEdit={(eventId) => {
                const selected = events.find((event) => event.id === eventId) || null;
                setEditingEvent(selected);
                setErrorMessage(null);
              }}
              onEventDelete={handleDelete}
              isOwner={() => true}
              showPagination={false}
            />
          )}
        </DarkCard>
      </PageSection>
    </>
  );
};

export default AdminEventsPage;
