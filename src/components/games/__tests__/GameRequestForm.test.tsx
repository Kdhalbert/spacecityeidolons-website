import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GameRequestForm } from '../GameRequestForm';

describe('GameRequestForm', () => {
  it('renders all required form fields', () => {
    render(<GameRequestForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Game Name')).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/why should we add/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<GameRequestForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Game Name'), 'Helldivers 2');
    await user.type(
      screen.getByLabelText(/why should we add/i),
      'Our community runs multiple weekly squads for this game.'
    );
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          gameName: 'Helldivers 2',
          reason: 'Our community runs multiple weekly squads for this game.',
        })
      );
    });
  });

  it('shows validation error for short game name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<GameRequestForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Game Name'), 'A');
    await user.type(screen.getByLabelText(/why should we add/i), 'Great game for community.');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it('shows validation error for short reason', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<GameRequestForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Game Name'), 'Helldivers 2');
    await user.type(screen.getByLabelText(/why should we add/i), 'Too short');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<GameRequestForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows conflict message when provided', () => {
    render(
      <GameRequestForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        conflictMessage="A pending request already exists for this game"
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('A pending request already exists');
  });

  it('shows loading state while submitting', () => {
    render(<GameRequestForm onSubmit={vi.fn()} onCancel={vi.fn()} isLoading />);

    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    expect(screen.getByLabelText('Game Name')).toBeDisabled();
  });
});
