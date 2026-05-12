import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PrivacyToggle } from '../PrivacyToggle';

describe('PrivacyToggle', () => {
  it('renders public state when toggle is off', () => {
    render(
      <PrivacyToggle
        fieldName="bio"
        isPrivate={false}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders private state when toggle is on', () => {
    render(
      <PrivacyToggle
        fieldName="bio"
        isPrivate
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange with checked value when toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PrivacyToggle
        fieldName="bio"
        isPrivate={false}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders description text when provided', () => {
    render(
      <PrivacyToggle
        fieldName="timezone"
        isPrivate={false}
        onChange={vi.fn()}
        description="Hide timezone from non-admin users"
      />
    );

    expect(screen.getByText('Hide timezone from non-admin users')).toBeInTheDocument();
  });
});
