import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { PageHero, PageSection, DarkCard } from '../components/ui';

/**
 * ProfilePage - displays a user's profile
 */
const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
  } = useProfile(userId);

  if (isLoading) {
    return (
      <>
        <PageHero title="Profile" />
        <PageSection>
          <DarkCard>
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'Cinzel' }}>
              Loading profile...
            </div>
          </DarkCard>
        </PageSection>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <PageHero title="Profile Not Found" />
        <PageSection>
          <DarkCard>
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'Cinzel' }}>
              <p style={{ marginBottom: '16px' }}>We couldn't find that profile.</p>
              <button
                onClick={() => navigate('/profiles')}
                className="invite-btn"
              >
                Browse All Profiles
              </button>
            </div>
          </DarkCard>
        </PageSection>
      </>
    );
  }

  const isOwnProfile = user?.id === userId;
  const isAdmin = user?.role === 'ADMIN';

  const getDiscordAvatarUrl = (): string | undefined => {
    if (profile.avatarUrl) {
      return profile.avatarUrl;
    }
    return undefined;
  };

  return (
    <>
      <PageHero
        title={profile?.displayName || 'Member Profile'}
        subtitle="Space City Eidolons Community"
      />

      {/* Header Card - Avatar and Name with Purple Background */}
      <PageSection>
        <div style={{
          background: 'var(--primary-purple)',
          border: '1px solid var(--gold)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 0 20px var(--gold-glow)',
        }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {getDiscordAvatarUrl() && (
              <img
                src={getDiscordAvatarUrl()}
                alt={profile.displayName || 'Profile'}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '3px solid var(--gold)',
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '0', fontSize: '1.8rem', color: 'var(--gold)' }}>
                {profile.displayName || 'Anonymous user'}
              </h2>
            </div>
            {(isOwnProfile || isAdmin) && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="invite-btn"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </PageSection>

      {/* Expanded Details Section */}
      <PageSection>
        <DarkCard>
          <div style={{ padding: '32px' }}>
            {/* Bio Section */}
            {profile.bio && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--gold)' }}>About</h3>
                <p style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'Cinzel',
                  color: 'var(--text-light)',
                  lineHeight: '1.7'
                }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Location Section */}
            {profile.location && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--gold)' }}>Location</h3>
                <p style={{ fontFamily: 'Cinzel', color: 'var(--text-light)' }}>
                  📍 {profile.location}
                </p>
              </div>
            )}

            {/* Timezone Section */}
            {profile.timezone && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--gold)' }}>Timezone</h3>
                <p style={{ fontFamily: 'Cinzel', color: 'var(--text-light)' }}>
                  🕐 {profile.timezone}
                </p>
              </div>
            )}

            {/* Games Section */}
            {profile.gamesPlayed && profile.gamesPlayed.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--gold)' }}>Games Played</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.gamesPlayed.map((game) => (
                    <span
                      key={game}
                      style={{
                        backgroundColor: 'var(--primary-purple)',
                        border: '1px solid var(--purple-lighter)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '16px',
                        fontFamily: 'Cinzel',
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
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--gold)' }}>Streaming</h3>
                <a
                  href={profile.twitchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--purple-lighter)',
                    textDecoration: 'none',
                    fontFamily: 'Cinzel',
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
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'Cinzel' }}>
                  {profile.privacyProfile ? '🔒 Profile is private' : '🌍 Profile is public'}
                  {' • '}
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Created date (for non-owners) */}
            {!isOwnProfile && !isAdmin && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'Cinzel',
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </DarkCard>
      </PageSection>
    </>
  );
};

export default ProfilePage;
