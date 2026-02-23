/**
 * Shared Type Definitions
 * Used by both frontend and backend for type safety and consistency
 * Keep in sync with api/src/types/index.ts
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum Role {
  GUEST = 'GUEST',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum Platform {
  DISCORD = 'DISCORD',
  MATRIX = 'MATRIX',
}

export enum InviteStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum EventVisibility {
  PUBLIC = 'PUBLIC',
  MEMBERS_ONLY = 'MEMBERS_ONLY',
  PRIVATE = 'PRIVATE',
}

export enum GameRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
}

// ============================================================================
// CORE USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  password?: string; // Omitted in API responses
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  twitchUrl?: string;
  gamesPlayed: string[];
  avatarUrl?: string;
  location?: string;
  timezone?: string;
  privacyProfile: boolean; // Public profile visibility
  privacyEvents: boolean; // Events attendance visibility
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithProfile extends User {
  profile?: Profile;
}

// ============================================================================
// INVITE REQUEST TYPES
// ============================================================================

export interface InviteRequest {
  id: string;
  email: string;
  name: string;
  platform: Platform;
  message?: string;
  status: InviteStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteRequestInput {
  email: string;
  name: string;
  platform: Platform;
  message?: string;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  duration?: number; // Minutes
  location?: string;
  visibility: EventVisibility;
  maxAttendees?: number;
  tags: string[];
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventInput {
  title: string;
  description?: string;
  date: Date;
  time: string;
  duration?: number;
  location?: string;
  visibility: EventVisibility;
  maxAttendees?: number;
  tags: string[];
}

// ============================================================================
// GAME TYPES
// ============================================================================

export interface Game {
  id: string;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GameInput {
  name: string;
  slug: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
}

export interface GamePageRequest {
  id: string;
  requesterId: string;
  gameName: string;
  description?: string;
  reason: string;
  status: GameRequestStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GamePageRequestInput {
  gameName: string;
  description?: string;
  reason: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  user: UserWithProfile;
  tokens: AuthTokens;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// PRIVACY & FILTERING
// ============================================================================

/**
 * Profile visibility based on viewer role
 * Controls which fields are exposed based on who is viewing
 */
export type ProfileVisibility = 'public' | 'members' | 'admin' | 'self';

export interface VisibilityOptions {
  showEmail: boolean;
  showProfile: boolean;
  showGames: boolean;
  showEvents: boolean;
}

export const getVisibilityOptions = (
  viewerRole: Role,
  isOwnProfile: boolean
): VisibilityOptions => {
  if (isOwnProfile) {
    return {
      showEmail: true,
      showProfile: true,
      showGames: true,
      showEvents: true,
    };
  }

  switch (viewerRole) {
    case Role.ADMIN:
      return {
        showEmail: true,
        showProfile: true,
        showGames: true,
        showEvents: true,
      };
    case Role.MEMBER:
      return {
        showEmail: false,
        showProfile: true,
        showGames: true,
        showEvents: true,
      };
    case Role.GUEST:
    default:
      return {
        showEmail: false,
        showProfile: false,
        showGames: false,
        showEvents: false,
      };
  }
};
