import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { InviteRequestForm } from './InviteRequestForm';
import { Platform } from '../types';

// Mock the API client
vi.mock('../lib/api', () => ({
  apiPost: vi.fn(),
}));

import { apiPost } from '../lib/api';

describe('InviteRequestForm', () => {
  const mockApiPost = apiPost as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Discord Form', () => {
    it('renders Discord invite request form', () => {
      render(<InviteRequestForm platform={Platform.DISCORD} />);

      expect(screen.getByText(/discord/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit|request/i })).toBeInTheDocument();
    });

    it('displays Discord-specific messaging', () => {
      render(<InviteRequestForm platform={Platform.DISCORD} />);

      expect(screen.getByText(/discord/i)).toBeInTheDocument();
    });

    it('submits valid Discord invite request', async () => {
      const user = userEvent.setup();
      mockApiPost.mockResolvedValueOnce({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        platform: Platform.DISCORD,
        status: 'PENDING',
      });

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      // Fill in form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      
      const messageField = screen.queryByLabelText(/message|why/i);
      if (messageField) {
        await user.type(messageField, 'I love gaming!');
      }

      // Submit form
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/invites', {
          email: 'test@example.com',
          name: 'Test User',
          platform: Platform.DISCORD,
          message: expect.any(String),
        });
      });
    });

    it('shows success message after successful submission', async () => {
      const user = userEvent.setup();
      mockApiPost.mockResolvedValueOnce({
        id: '123',
        status: 'PENDING',
      });

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(screen.getByText(/success|received|thank/i)).toBeInTheDocument();
      });
    });
  });

  describe('Matrix Form', () => {
    it('renders Matrix invite request form', () => {
      render(<InviteRequestForm platform={Platform.MATRIX} />);

      expect(screen.getByText(/matrix|element/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('displays Matrix-specific messaging', () => {
      render(<InviteRequestForm platform={Platform.MATRIX} />);

      expect(screen.getByText(/matrix|element/i)).toBeInTheDocument();
    });

    it('submits valid Matrix invite request', async () => {
      const user = userEvent.setup();
      mockApiPost.mockResolvedValueOnce({
        id: '456',
        email: 'matrix@example.com',
        name: 'Matrix User',
        platform: Platform.MATRIX,
        status: 'PENDING',
      });

      render(<InviteRequestForm platform={Platform.MATRIX} />);

      await user.type(screen.getByLabelText(/email/i), 'matrix@example.com');
      await user.type(screen.getByLabelText(/name/i), 'Matrix User');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/invites', {
          email: 'matrix@example.com',
          name: 'Matrix User',
          platform: Platform.MATRIX,
          message: expect.anything(),
        });
      });
    });
  });

  describe('Validation', () => {
    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'not-an-email');
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid.*email|email.*invalid/i)).toBeInTheDocument();
      });

      expect(mockApiPost).not.toHaveBeenCalled();
    });

    it('shows error for empty name', async () => {
      const user = userEvent.setup();

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      // Leave name empty
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(screen.getByText(/name.*required|required.*name/i)).toBeInTheDocument();
      });

      expect(mockApiPost).not.toHaveBeenCalled();
    });

    it('shows error for name that is too short', async () => {
      const user = userEvent.setup();

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/name/i), 'A');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(screen.getByText(/name.*short|minimum.*character/i)).toBeInTheDocument();
      });

      expect(mockApiPost).not.toHaveBeenCalled();
    });

    it('trims whitespace from inputs', async () => {
      const user = userEvent.setup();
      mockApiPost.mockResolvedValueOnce({ id: '123', status: 'PENDING' });

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), '  test@example.com  ');
      await user.type(screen.getByLabelText(/name/i), '  Test User  ');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/invites', {
          email: 'test@example.com',
          name: 'Test User',
          platform: Platform.DISCORD,
          message: expect.anything(),
        });
      });
    });
  });

  describe('Loading State', () => {
    it('disables submit button while submitting', async () => {
      const user = userEvent.setup();
      mockApiPost.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      
      const submitButton = screen.getByRole('button', { name: /submit|request/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });

    it('shows loading indicator during submission', async () => {
      const user = userEvent.setup();
      mockApiPost.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      expect(screen.getByText(/loading|submitting|sending/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API call fails', async () => {
      const user = userEvent.setup();
      mockApiPost.mockRejectedValueOnce(new Error('Network error'));

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(screen.getByText(/error|failed|problem/i)).toBeInTheDocument();
      });
    });

    it('shows specific error for duplicate email', async () => {
      const user = userEvent.setup();
      mockApiPost.mockRejectedValueOnce({
        response: {
          status: 409,
          data: { message: 'Invite request already exists' },
        },
      });

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'duplicate@example.com');
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(screen.getByText(/already.*exist|duplicate/i)).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      const user = userEvent.setup();
      mockApiPost
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: '123', status: 'PENDING' });

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      
      // First attempt fails
      await user.click(screen.getByRole('button', { name: /submit|request/i }));
      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });

      // Second attempt succeeds
      await user.click(screen.getByRole('button', { name: /submit|request|try again/i }));
      await waitFor(() => {
        expect(screen.getByText(/success|received/i)).toBeInTheDocument();
      });

      expect(mockApiPost).toHaveBeenCalledTimes(2);
    });
  });

  describe('Form Reset', () => {
    it('clears form after successful submission', async () => {
      const user = userEvent.setup();
      mockApiPost.mockResolvedValueOnce({ id: '123', status: 'PENDING' });

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;

      await user.type(emailInput, 'test@example.com');
      await user.type(nameInput, 'Test User');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      });

      // Form should be cleared
      expect(emailInput.value).toBe('');
      expect(nameInput.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all inputs', () => {
      render(<InviteRequestForm platform={Platform.DISCORD} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('associates error messages with inputs via aria-describedby', async () => {
      const user = userEvent.setup();

      render(<InviteRequestForm platform={Platform.DISCORD} />);

      await user.type(screen.getByLabelText(/email/i), 'invalid');
      await user.click(screen.getByRole('button', { name: /submit|request/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        const errorId = emailInput.getAttribute('aria-describedby');
        expect(errorId).toBeTruthy();
      });
    });

    it('marks required fields with aria-required', () => {
      render(<InviteRequestForm platform={Platform.DISCORD} />);

      const emailInput = screen.getByLabelText(/email/i);
      const nameInput = screen.getByLabelText(/name/i);

      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(nameInput).toHaveAttribute('aria-required', 'true');
    });
  });
});
