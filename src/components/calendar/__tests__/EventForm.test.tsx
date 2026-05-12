import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { EventForm } from '../EventForm';
import { EventVisibility } from '../../../types';

describe('EventForm', () => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  it('renders all required form fields', () => {
    render(<EventForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
    expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<EventForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Title'), 'Game Night');
    await user.type(screen.getByLabelText('Date'), tomorrow);
    await user.type(screen.getByLabelText('Time'), '20:00');
    await user.click(screen.getByRole('button', { name: /create event/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Game Night',
          date: tomorrow,
          time: '20:00',
        })
      );
    });
  });

  it('defaults visibility to PRIVATE', () => {
    render(<EventForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const select = screen.getByLabelText(/visibility/i) as HTMLSelectElement;
    expect(select.value).toBe(EventVisibility.PRIVATE);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<EventForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<EventForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Date'), tomorrow);
    await user.type(screen.getByLabelText('Time'), '20:00');
    await user.click(screen.getByRole('button', { name: /create event/i }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it('prefills fields when editing an existing event', () => {
    const existingEvent = {
      title: 'Existing Event',
      date: tomorrow,
      time: '18:00',
      description: 'Some description',
      visibility: EventVisibility.PUBLIC,
    };

    render(<EventForm onSubmit={vi.fn()} onCancel={vi.fn()} initialValues={existingEvent} />);

    expect(screen.getByDisplayValue('Existing Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Some description')).toBeInTheDocument();
    const select = screen.getByLabelText(/visibility/i) as HTMLSelectElement;
    expect(select.value).toBe(EventVisibility.PUBLIC);
  });

  it('shows loading state while submitting', () => {
    render(<EventForm onSubmit={vi.fn()} onCancel={vi.fn()} isLoading />);

    const btn = screen.getByRole('button', { name: /saving/i });
    expect(btn).toBeDisabled();
  });
});
