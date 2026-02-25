import { apiGet, apiPut } from '../lib/api';
import type { Profile } from '../types';

export interface GetProfileResponse {
  data: Profile;
  _filtered?: boolean;
}

export interface ListProfilesResponse {
  data: Profile[];
  count: number;
}

/**
 * Frontend profile service - handles API calls for profile operations
 */
export const profileService = {
  /**
   * Get a single profile by user ID
   */
  async getProfile(userId: string): Promise<Profile> {
    try {
      const response = await apiGet<GetProfileResponse>(`/profiles/${userId}`);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!.data;
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
      const response = await apiGet<ListProfilesResponse>(`/profiles${queryString}`);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!.data;
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
      const response = await apiPut<GetProfileResponse>(
        `/profiles/${userId}`,
        data
      );
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!.data;
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
