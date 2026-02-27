import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';

export const PROFILE_QUERY_KEY = 'profiles';

/**
 * Fetch a single profile by user ID
 */
export const useProfile = (userId?: string) => {
  const query = useQuery({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      console.log('useProfile: Fetching profile for userId:', userId);
      return profileService.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log('useProfile state:', {
    userId,
    isLoading: query.isLoading,
    error: query.error,
    data: query.data,
    status: query.status,
  });

  return query;
};

/**
 * Fetch all profiles with optional filtering
 */
export const useProfiles = (query?: { game?: string; search?: string }) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, 'all', query],
    queryFn: () => profileService.getProfiles(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Search profiles by name
 */
export const useSearchProfiles = (searchQuery: string) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, 'search', searchQuery],
    queryFn: () => {
      if (!searchQuery) return [];
      return profileService.searchProfiles(searchQuery);
    },
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get profiles filtered by game
 */
export const useProfilesByGame = (gameName: string) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, 'game', gameName],
    queryFn: () => profileService.getProfilesByGame(gameName),
    enabled: !!gameName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Update user's profile (mutation)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      displayName?: string;
      bio?: string;
      twitchUrl?: string;
      location?: string;
      timezone?: string;
      gamesPlayed?: string[];
      privacyProfile?: boolean;
      privacyEvents?: boolean;
    }) => profileService.updateProfile(data.userId, data),
    onSuccess: (updatedProfile) => {
      // Update cache for this specific profile
      queryClient.setQueryData(
        [PROFILE_QUERY_KEY, updatedProfile.userId],
        updatedProfile
      );

      // Invalidate profile list queries to refetch
      queryClient.invalidateQueries({
        queryKey: [PROFILE_QUERY_KEY, 'all'],
      });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
    },
  });
};

/**
 * Get profile statistics (admin only)
 */
export const useProfileStats = (adminOnly = false) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, 'stats'],
    queryFn: () => profileService.getProfileStats(),
    enabled: adminOnly,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export default useProfile;
