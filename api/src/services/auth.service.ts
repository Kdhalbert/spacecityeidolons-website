import prisma from '../lib/db.js';
import { config } from '../config/index.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { Role } from '@prisma/client';

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  verified?: boolean;
}

export class AuthService {
  /**
   * Generate Discord OAuth authorization URL
   */
  generateDiscordAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: config.DISCORD_CLIENT_ID,
      redirect_uri: config.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: config.DISCORD_OAUTH_SCOPES,
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for Discord access token
   */
  async exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
    const params = new URLSearchParams({
      client_id: config.DISCORD_CLIENT_ID,
      client_secret: config.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.DISCORD_REDIRECT_URI,
    });

    console.log('Exchanging Discord code for token with config:', {
      client_id: config.DISCORD_CLIENT_ID,
      redirect_uri: config.DISCORD_REDIRECT_URI,
    });

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Discord token exchange failed:', {
        status: response.status,
        error,
        redirect_uri: config.DISCORD_REDIRECT_URI,
      });
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json() as Promise<DiscordTokenResponse>;
  }

  /**
   * Fetch Discord user data using access token
   */
  async getDiscordUser(accessToken: string): Promise<DiscordUser> {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Discord user: ${error}`);
    }

    return response.json() as Promise<DiscordUser>;
  }

  /**
   * Find existing user by Discord ID or create new user with Discord data
   * Also creates Profile record on first login
   */
  async findOrCreateUser(discordUser: DiscordUser) {
    let user = await prisma.user.findUnique({
      where: { discordId: discordUser.id },
      include: { profile: true },
    });

    if (!user) {
      // Create new user with Discord data
      user = await prisma.user.create({
        data: {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          discordAvatar: discordUser.avatar,
          email: discordUser.email || null,
          role: Role.MEMBER,
          profile: {
            create: {
              displayName: discordUser.username,
              avatarUrl: discordUser.avatar
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : null,
            },
          },
        },
        include: { profile: true },
      });
    }

    return user;
  }

  /**
   * Get user by ID with profile included
   */
  async getUserWithProfile(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  /**
   * Generate JWT access and refresh tokens for user
   */
  generateAuthTokens(userId: string, email: string | null, discordId: string, role: Role) {
    return generateTokens({
      userId,
      email: email || undefined,
      discordId,
      role,
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      // Fetch user to ensure they still exist and get current data
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const tokens = this.generateAuthTokens(
        user.id,
        user.email,
        user.discordId,
        user.role
      );

      return {
        accessToken: tokens.accessToken,
        user: {
          id: user.id,
          email: user.email,
          discordId: user.discordId,
          discordUsername: user.discordUsername,
          discordAvatar: user.discordAvatar,
          role: user.role,
        },
      };
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Handle complete Discord OAuth flow
   * Exchange code -> Get Discord user -> Find/create user -> Generate tokens
   */
  async handleDiscordCallback(code: string) {
    // Exchange code for Discord access token
    const tokenResponse = await this.exchangeCodeForToken(code);

    // Get Discord user data
    const discordUser = await this.getDiscordUser(tokenResponse.access_token);

    // Find or create user in database
    const user = await this.findOrCreateUser(discordUser);

    // Generate JWT tokens
    const tokens = this.generateAuthTokens(
      user.id,
      user.email,
      user.discordId,
      user.role
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        discordAvatar: user.discordAvatar,
        role: user.role,
        profile: user.profile,
      },
    };
  }
}

export const authService = new AuthService();
