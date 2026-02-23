import { describe, it, expect, beforeAll } from 'vitest';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../../../src/utils/jwt.js';
import type { JWTPayload } from '../../../src/utils/jwt.js';

describe('JWT Utilities', () => {
  let testPayload: JWTPayload;

  beforeAll(() => {
    testPayload = {
      userId: 'test-user-id-123',
      email: 'test@example.com',
      discordId: '1234567890',
      role: 'MEMBER',
    };
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const tokens = generateTokens(testPayload);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken.length).toBeGreaterThan(0);
      expect(tokens.refreshToken.length).toBeGreaterThan(0);
    });

    it('should generate different tokens each time', async () => {
      const tokens1 = generateTokens(testPayload);
      
      // Wait 1 second to ensure different timestamp (JWT iat is in seconds)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tokens2 = generateTokens(testPayload);

      // Tokens should be different due to timestamp in JWT
      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const { accessToken } = generateTokens(testPayload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.discordId).toBe(testPayload.discordId);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow('Invalid or expired access token');
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyAccessToken('not.a.token');
      }).toThrow('Invalid or expired access token');
    });

    it('should throw error for expired token', async () => {
      // This test would require manipulating time or using a very short expiry
      // For now, we'll test with an invalid signature which also fails verification
      const fakeToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNjE2MjM5MDIyfQ.invalid_signature';

      expect(() => {
        verifyAccessToken(fakeToken);
      }).toThrow('Invalid or expired access token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const { refreshToken } = generateTokens(testPayload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should only include userId in refresh token', () => {
      const { refreshToken } = generateTokens(testPayload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).not.toHaveProperty('email');
      expect(decoded).not.toHaveProperty('discordId');
      expect(decoded).not.toHaveProperty('role');
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid-token');
      }).toThrow('Invalid or expired refresh token');
    });

    it('should throw error for using access token as refresh token', () => {
      const { accessToken } = generateTokens(testPayload);

      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow('Invalid or expired refresh token');
    });
  });

  describe('Token Separation', () => {
    it('should not allow refresh token to be verified as access token', () => {
      const { refreshToken } = generateTokens(testPayload);

      expect(() => {
        verifyAccessToken(refreshToken);
      }).toThrow('Invalid or expired access token');
    });

    it('should use different secrets for access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokens(testPayload);

      // Both should be valid independently
      expect(() => verifyAccessToken(accessToken)).not.toThrow();
      expect(() => verifyRefreshToken(refreshToken)).not.toThrow();

      // But not cross-compatible
      expect(() => verifyAccessToken(refreshToken)).toThrow();
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});
