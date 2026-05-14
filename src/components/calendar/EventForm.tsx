import React, { useState } from 'react';
import { EventVisibility } from '../../types';
import type { CreateEventInput } from '../../services/events.service';

interface EventFormInitialValues {
  title?: string;
  date?: string;
  time?: string;
  endTime?: string;
  description?: string;
  location?: string;
  visibility?: EventVisibility;
  maxAttendees?: number;
  games?: string[];
  recurring?: boolean;
}

interface EventFormProps {
  onSubmit: (data: CreateEventInput) => Promise<void>;
  onCancel: () => void;
  initialValues?: EventFormInitialValues;
  isLoading?: boolean;
  submitLabel?: string;
}

interface FormErrors {
  title?: string;
  date?: string;
  time?: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
  submitLabel = 'Create Event',
}) => {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [date, setDate] = useState(initialValues?.date ?? '');
  const [time, setTime] = useState(initialValues?.time ?? '');
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [location, setLocation] = useState(initialValues?.location ?? '');
  const [visibility, setVisibility] = useState<EventVisibility>(
    initialValues?.visibility ?? EventVisibility.PRIVATE
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    if (!time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title,
      date,
      time,
      endTime: endTime || undefined,
      description: description || undefined,
      location: location || undefined,
      visibility,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="event-title">Title</label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          disabled={isLoading}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'event-title-error' : undefined}
        />
        {errors.title && <span id="event-title-error" role="alert">{errors.title}</span>}
      </div>

      <div>
        <label htmlFor="event-date">Date</label>
        <input
          id="event-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isLoading}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? 'event-date-error' : undefined}
        />
        {errors.date && <span id="event-date-error" role="alert">{errors.date}</span>}
      </div>

      <div>
        <label htmlFor="event-time">Time</label>
        <input
          id="event-time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          disabled={isLoading}
          aria-invalid={!!errors.time}
          aria-describedby={errors.time ? 'event-time-error' : undefined}
        />
        {errors.time && <span id="event-time-error" role="alert">{errors.time}</span>}
      </div>

      <div>
        <label htmlFor="event-end-time">End Time (optional)</label>
        <input
          id="event-end-time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="event-description">Description (optional)</label>
        <textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your event..."
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="event-location">Location (optional)</label>
        <input
          id="event-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Online or physical location"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="event-visibility">Visibility</label>
        <select
          id="event-visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as EventVisibility)}
          disabled={isLoading}
        >
          <option value={EventVisibility.PRIVATE}>Private</option>
          <option value={EventVisibility.MEMBERS_ONLY}>Members Only</option>
          <option value={EventVisibility.PUBLIC}>Public</option>
        </select>
      </div>

      <div>
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
