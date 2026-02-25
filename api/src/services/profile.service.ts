import prisma from '../lib/db.js';
import type { Profile, Role } from '@prisma/client';
import type { ProfileUpdateInput } from '../schemas/profile.schema.js';

interface FilteredProfile extends Profile {
  _filtered?: boolean; // Flag to indicate if privacy filtering was applied
}

export class ProfileService {
  /**
   * Get a profile by user ID with privacy filtering applied
   * @param userId - The user ID whose profile to fetch
   * @param viewerUserId - The user viewing the profile (for privacy rules)
   * @param viewerRole - The role of the viewer (for privacy rules)
   * @returns Profile with sensitive fields filtered based on privacy settings
   */
  async getProfileByUserId(
    userId: string,
    viewerUserId?: string,
    viewerRole?: Role
  ): Promise<FilteredProfile | null> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return null;
    }

    // Apply privacy filtering
    return this.applyPrivacyFilter(profile, userId === viewerUserId, viewerRole);
  }

  /**
   * Get all profiles with privacy filtering
   * @param viewerUserId - The user viewing the list
   * @param viewerRole - The role of the viewer
   * @returns Array of profiles with privacy filtering applied
   */
  async getAllProfiles(viewerUserId?: string, viewerRole?: Role): Promise<FilteredProfile[]> {
    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return profiles.map((profile) =>
      this.applyPrivacyFilter(profile, profile.userId === viewerUserId, viewerRole)
    );
  }

  /**
   * Update a user's profile
   * @param userId - The user ID whose profile to update
   * @param data - Profile update data
   * @returns Updated profile (unfiltered)
   */
  async updateProfile(userId: string, data: ProfileUpdateInput): Promise<Profile> {
    // Ensure profile exists, create if not
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      // Profile doesn't exist yet, create it
      return prisma.profile.create({
        data: {
          userId,
          ...data,
        },
      });
    }

    // Update existing profile
    return prisma.profile.update({
      where: { userId },
      data,
    });
  }

  /**
   * Get profile stats for admin dashboard
   * @returns Stats about profiles in the system
   */
  async getProfileStats() {
    const totalProfiles = await prisma.profile.count();
    const withBio = await prisma.profile.count({
      where: { bio: { not: null } },
    });
    const withTwitchUrl = await prisma.profile.count({
      where: { twitchUrl: { not: null } },
    });
    const privacyEnabledProfile = await prisma.profile.count({
      where: { privacyProfile: true },
    });
    const privacyEnabledEvents = await prisma.profile.count({
      where: { privacyEvents: true },
    });

    return {
      totalProfiles,
      withBio,
      withTwitchUrl,
      privacyEnabledProfile,
      privacyEnabledEvents,
    };
  }

  /**
   * Apply privacy filtering to a profile based on viewer role and ownership
   * @private
   */
  private applyPrivacyFilter(
    profile: Profile,
    isOwnProfile: boolean,
    viewerRole?: Role
  ): FilteredProfile {
    // User can always see their own profile
    if (isOwnProfile) {
      return profile;
    }

    // Admins can see all profiles
    if (viewerRole === 'ADMIN') {
      return profile;
    }

    // For guests and members, apply privacy rules
    const filteredProfile: FilteredProfile = { ...profile, _filtered: true };

    // If profile is set to private, hide non-essential fields
    if (profile.privacyProfile) {
      filteredProfile.bio = null;
      filteredProfile.twitchUrl = null;
      filteredProfile.location = null;
      filteredProfile.timezone = null;
    }

    // Hide events privacy setting if user prefers it
    if (profile.privacyEvents) {
      // Note: gamesPlayed can still be visible, but event visibility will be controlled elsewhere
    }

    // Always hide sensitive fields for non-owners
    filteredProfile.location = null;
    filteredProfile.timezone = null;

    return filteredProfile;
  }

  /**
   * Search profiles by display name
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Array of matching profiles (filtered)
   */
  async searchProfiles(query: string, limit: number = 10): Promise<FilteredProfile[]> {
    const profiles = await prisma.profile.findMany({
      where: {
        displayName: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: { displayName: 'asc' },
    });

    // Apply default privacy filtering (non-owner, non-admin view)
    return profiles.map((profile) => this.applyPrivacyFilter(profile, false, 'GUEST' as any));
  }

  /**
   * Get profiles by game played
   * @param gameName - Game name to filter by
   * @returns Array of profiles that play this game
   */
  async getProfilesByGame(gameName: string): Promise<FilteredProfile[]> {
    const profiles = await prisma.profile.findMany({
      where: {
        gamesPlayed: {
          has: gameName,
        },
      },
      orderBy: { displayName: 'asc' },
    });

    return profiles.map((profile) => this.applyPrivacyFilter(profile, false, 'GUEST' as any));
  }
}

export const profileService = new ProfileService();
