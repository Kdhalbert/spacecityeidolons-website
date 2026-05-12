import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ProfileEditor } from '../ProfileEditor';

describe('ProfileEditor', () => {
  const mockProfile = {
    id: 'profile-1',
    userId: 'user-1',
    displayName: 'Current Name',
    bio: 'Current bio',
    twitchUrl: '',
    gamesPlayed: ['Valorant'],
    avatarUrl: '',
    location: 'Houston',
    timezone: 'America/Chicago',
    privacyProfile: false,
    privacyEvents: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('renders profile fields and default values', () => {
    render(<ProfileEditor profile={mockProfile} onSubmit={vi.fn()} />);

    expect(screen.getByDisplayValue('Current Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Current bio')).toBeInTheDocument();
    expect(screen.getByText('1/20 games')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
  });

  it('adds a game and submits merged profile payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<ProfileEditor profile={mockProfile} onSubmit={onSubmit} />);

    await user.clear(screen.getByDisplayValue('Current Name'));
    await user.type(screen.getByPlaceholderText('How should others see you?'), 'Updated Name');
    await user.type(screen.getByPlaceholderText('Enter game name...'), 'Apex Legends');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Updated Name',
          gamesPlayed: ['Valorant', 'Apex Legends'],
        })
      );
    });
  });

  it('prevents submit with invalid twitch URL', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<ProfileEditor profile={mockProfile} onSubmit={onSubmit} />);

    await user.clear(screen.getByPlaceholderText('https://twitch.tv/yourname'));
    await user.type(screen.getByPlaceholderText('https://twitch.tv/yourname'), 'not-a-valid-url');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows loading state while saving', () => {
    render(<ProfileEditor profile={mockProfile} isLoading onSubmit={vi.fn()} />);

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
  });
});
