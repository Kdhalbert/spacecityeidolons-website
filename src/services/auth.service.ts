import { apiPost, setTokens, clearTokens } from '../lib/api';
import type { AuthResponse, RefreshTokenResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AuthService {
  /**
   * Get the Discord OAuth authorization URL
   */
  getDiscordAuthUrl(): string {
    return `${API_BASE_URL}/api/auth/discord`;
  }

  /**
   * Handle OAuth callback - exchange code for tokens
   */
  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/discord/callback?code=${code}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to authenticate');
      }

      const data: AuthResponse = await response.json();
      
      // Store tokens in localStorage
      setTokens(data.accessToken, data.refreshToken);
      
      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Authentication failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiPost<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data returned from refresh');
    }

    // Update stored access token
    setTokens(response.data.accessToken, refreshToken);

    return response.data;
  }

  /**
   * Logout user - clear tokens and redirect to login
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server (optional)
      await apiPost('/auth/logout', {});
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local tokens
      clearTokens();
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('app_access_token')}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('app_access_token');
    return !!token;
  }
}

export const authService = new AuthService();
