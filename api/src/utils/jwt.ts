import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface JWTPayload {
  userId: string;
  email?: string;
  discordId: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access and refresh tokens for a user
 */
export function generateTokens(payload: JWTPayload): AuthTokens {
  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify and decode JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify and decode JWT refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as {
      userId: string;
    };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
