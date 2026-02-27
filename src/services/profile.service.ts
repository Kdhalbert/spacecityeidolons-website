import { apiGet, apiPut } from '../lib/api';
import type { Profile } from '../types';

/**
 * Frontend profile service - handles API calls for profile operations
 */
export const profileService = {
  /**
   * Get a single profile by user ID
   */
  async getProfile(userId: string): Promise<Profile> {
    try {
      const response = await apiGet<Profile>(`/profiles/${userId}`);
      console.log('getProfile response:', {
        hasError: !!response.error,
        errorMessage: response.error?.message,
        profile: response.data,
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (!response.data) {
        console.error('No profile in response');
        throw new Error('Profile missing from response');
      }
      console.log('Returning profile:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get all profiles with optional filtering
   */
  async getProfiles(
    query?: {
      game?: string;
      search?: string;
    }
  ): Promise<Profile[]> {
    try {
      const params = new URLSearchParams();
      if (query?.game) params.append('game', query.game);
      if (query?.search) params.append('search', query.search);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await apiGet<Profile[]>(`/profiles${queryString}`);
      console.log('getProfiles response:', {
        hasError: !!response.error,
        profiles: response.data,
        count: Array.isArray(response.data) ? response.data.length : 0,
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (!Array.isArray(response.data)) {
        console.error('No profiles array in response');
        return [];
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  },

  /**
   * Search profiles by display name
   */
  async searchProfiles(query: string): Promise<Profile[]> {
    return this.getProfiles({ search: query });
  },

  /**
   * Get profiles filtered by game
   */
  async getProfilesByGame(gameName: string): Promise<Profile[]> {
    return this.getProfiles({ game: gameName });
  },

  /**
   * Update user's own profile
   */
  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      bio?: string;
      twitchUrl?: string;
      location?: string;
      timezone?: string;
      gamesPlayed?: string[];
      privacyProfile?: boolean;
      privacyEvents?: boolean;
    }
  ): Promise<Profile> {
    try {
      const response = await apiPut<Profile>(
        `/profiles/${userId}`,
        data
      );
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (!response.data) {
        throw new Error('No profile returned from update');
      }
      return response.data;
    } catch (error) {
      console.error(`Error updating profile for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get profile statistics (admin only)
   */
  async getProfileStats(): Promise<{
    totalProfiles: number;
    profilesWithBio: number;
    gamesPlayed: { [key: string]: number };
  }> {
    try {
      const response = await apiGet<{
        totalProfiles: number;
        profilesWithBio: number;
        gamesPlayed: { [key: string]: number };
      }>('/profiles/stats');
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data || {
        totalProfiles: 0,
        profilesWithBio: 0,
        gamesPlayed: {},
      };
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      throw error;
    }
  },
};

export default profileService;
