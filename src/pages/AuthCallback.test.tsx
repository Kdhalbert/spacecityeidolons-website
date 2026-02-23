import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthCallback from './AuthCallback';
import { authService } from '../services/auth.service';

// Mock modules
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  authService: {
    handleOAuthCallback: vi.fn(),
  },
}));

// Get the mocked functions
const { useNavigate } = await import('react-router-dom');
const { useAuth } = await import('../context/AuthContext');
const mockNavigate = vi.fn();
const mockRefreshUser = vi.fn();

// Setup mock implementations
vi.mocked(useNavigate).mockReturnValue(mockNavigate);
vi.mocked(useAuth).mockReturnValue({
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: mockRefreshUser,
});

const renderAuthCallback = (search: string = '') => {
  return render(
    <MemoryRouter initialEntries={[`/auth/callback${search}`]}>
      <AuthCallback />
    </MemoryRouter>
  );
};

describe('AuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    renderAuthCallback('?code=test-code');
    
    expect(screen.getByText(/completing login/i)).toBeInTheDocument();
  });

  it('handles successful OAuth callback', async () => {
    vi.mocked(authService.handleOAuthCallback).mockResolvedValue({
      user: {
        id: 'user-123',
        discordUsername: 'TestUser',
        email: 'test@example.com',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    renderAuthCallback('?code=test-auth-code');

    await waitFor(() => {
      expect(authService.handleOAuthCallback).toHaveBeenCalledWith('test-auth-code');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows error when code parameter is missing', async () => {
    renderAuthCallback('');

    await waitFor(() => {
      const headings = screen.getAllByText(/authentication failed/i);
      expect(headings.length).toBeGreaterThan(0);
      expect(screen.getByText(/missing authorization code/i)).toBeInTheDocument();
    });
  });

  it('shows error when OAuth is denied', async () => {
    renderAuthCallback('?error=access_denied');

    await waitFor(() => {
      const headings = screen.getAllByText(/authentication failed/i);
      expect(headings.length).toBeGreaterThan(0);
      expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(authService.handleOAuthCallback).mockRejectedValue(new Error('Failed to authenticate'));

    renderAuthCallback('?code=invalid-code');

    await waitFor(() => {
      const headings = screen.getAllByText(/authentication failed/i);
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it('provides retry option on error', async () => {
    vi.mocked(authService.handleOAuthCallback).mockRejectedValue(new Error('Network error'));

    renderAuthCallback('?code=test-code');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('provides link to return home on error', async () => {
    renderAuthCallback('?error=server_error');

    await waitFor(() => {
      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  it('displays friendly error messages', async () => {
    vi.mocked(authService.handleOAuthCallback).mockRejectedValue(
      new Error('Invalid authorization code')
    );

    renderAuthCallback('?code=expired-code');

    await waitFor(() => {
      const headings = screen.getAllByText(/authentication failed/i);
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
