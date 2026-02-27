import React from 'react';
import { DarkCard, PageSection } from '../ui';
import type { Profile } from '../../types';

interface ProfileCardProps {
  profile: Profile;
  isOwnProfile?: boolean;
  isAdmin?: boolean;
  onEdit?: () => void;
}

/**
 * ProfileCard component - displays user profile information
 * Respects privacy settings and shows different content based on viewer role
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isOwnProfile = false,
  isAdmin = false,
  onEdit,
}) => {
  const getDiscordAvatarUrl = (): string | undefined => {
    if (profile.avatarUrl) {
      return profile.avatarUrl;
    }
    return undefined;
  };

  return (
    <PageSection>
      <DarkCard>
        <div style={{ padding: '32px' }}>
          {/* Header with Avatar and Name */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
            {getDiscordAvatarUrl() && (
              <img
                src={getDiscordAvatarUrl()}
                alt={profile.displayName || 'Profile'}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '3px solid var(--purple-lighter)',
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>
                {profile.displayName || 'Anonymous user'}
              </h2>
              {profile.bio && (
                <p style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', marginBottom: '12px' }}>
                  {profile.bio}
                </p>
              )}
              {profile.location && (
                <p style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>
                  📍 {profile.location}
                </p>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {(isOwnProfile || isAdmin) && onEdit && (
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={onEdit}
                className="invite-btn"
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Games Section */}
          {profile.gamesPlayed && profile.gamesPlayed.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Games Played</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.gamesPlayed.map((game) => (
                  <span
                    key={game}
                    style={{
                      backgroundColor: 'rgba(88, 101, 242, 0.2)',
                      color: 'var(--purple-lighter)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontFamily: 'sans-serif',
                      fontSize: '0.9rem',
                    }}
                  >
                    {game}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Twitch Link */}
          {profile.twitchUrl && (
            <div style={{ marginBottom: '24px' }}>
              <a
                href={profile.twitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--purple-lighter)',
                  textDecoration: 'none',
                  fontFamily: 'sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🎮 Watch on Twitch
              </a>
            </div>
          )}

          {/* Privacy Info (visible for own profile or admins) */}
          {(isOwnProfile || isAdmin) && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>
                {profile.privacyProfile ? '🔒 Profile is private' : '🌍 Profile is public'}
              </p>
            </div>
          )}

          {/* Created date */}
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontFamily: 'sans-serif',
              marginTop: '12px',
            }}
          >
            Joined {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </DarkCard>
    </PageSection>
  );
};

export default ProfileCard;
