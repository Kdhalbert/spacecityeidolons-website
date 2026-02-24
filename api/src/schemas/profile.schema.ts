import { z } from 'zod';

/**
 * Twitch URL validation regex
 * Matches: https://twitch.tv/username or http://twitch.tv/username
 */
const TWITCH_URL_REGEX = /^https?:\/\/(www\.)?twitch\.tv\/[a-zA-Z0-9_-]+\/?$/i;

/**
 * Timezone validation using offset format or IANA timezone names
 */
const TIMEZONE_REGEX = /^[A-Za-z_]+\/[A-Za-z_]+$|^UTC[+-]\d{1,2}(:\d{2})?$|^UTC$/i;

/**
 * Profile update request schema
 * Used for PUT /api/profiles/:userId
 */
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .max(100, 'Display name must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  twitchUrl: z
    .string()
    .refine(
      (url) => !url || TWITCH_URL_REGEX.test(url),
      'Invalid Twitch URL format. Expected: https://twitch.tv/username'
    )
    .optional()
    .or(z.literal('')),
  gamesPlayed: z
    .array(
      z
        .string()
        .min(1, 'Game names cannot be empty')
        .max(100, 'Game name must be 100 characters or less')
    )
    .max(20, 'Cannot add more than 20 games')
    .optional(),
  location: z
    .string()
    .max(100, 'Location must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  timezone: z
    .string()
    .refine(
      (tz) => !tz || TIMEZONE_REGEX.test(tz),
      'Invalid timezone format'
    )
    .optional()
    .or(z.literal('')),
  privacyProfile: z.boolean().optional().default(false),
  privacyEvents: z.boolean().optional().default(false),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Profile query schema for filtering
 */
export const profileQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

/**
 * Privacy levels for profile visibility
 */
export enum ProfilePrivacy {
  PUBLIC = 'public',
  MEMBERS_ONLY = 'members_only',
  PRIVATE = 'private',
}

/**
 * Profile visibility rules based on viewer role
 */
export const getProfileVisibility = (viewerRole: string, isOwnProfile: boolean) => {
  if (isOwnProfile) {
    return {
      showDisplayName: true,
      showBio: true,
      showTwitchUrl: true,
      showGamesPlayed: true,
      showLocation: true,
      showTimezone: true,
      showAvatar: true,
    };
  }

  if (viewerRole === 'ADMIN') {
    return {
      showDisplayName: true,
      showBio: true,
      showTwitchUrl: true,
      showGamesPlayed: true,
      showLocation: true,
      showTimezone: true,
      showAvatar: true,
    };
  }

  // For members and guests, respect privacy settings (implementation in service)
  return {
    showDisplayName: true,
    showBio: true,
    showTwitchUrl: true,
    showGamesPlayed: true,
    showLocation: false, // Location hidden by default
    showTimezone: false, // Timezone hidden by default
    showAvatar: true,
  };
};
