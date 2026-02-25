import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { ProfileCard } from '../components/profile/ProfileCard';
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
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'sans-serif' }}>
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
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'sans-serif' }}>
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

  return (
    <>
      <PageHero
        title={profile?.displayName || 'Member Profile'}
        subtitle="Space City Eidolons Community"
      />

      <PageSection>
        <DarkCard>
          <div style={{ padding: '32px' }}>
            <ProfileCard
              profile={profile}
              isOwnProfile={isOwnProfile}
              isAdmin={isAdmin}
              onEdit={() => navigate(`/profile/${userId}/edit`)}
            />

            {/* Additional sections could go here */}
            {profile.bio && (
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>About</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
              </div>
            )}

            {profile.gamesPlayed && profile.gamesPlayed.length > 0 && (
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Games</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.gamesPlayed.map((game) => (
                    <span
                      key={game}
                      style={{
                        backgroundColor: 'rgba(88, 101, 242, 0.2)',
                        color: 'var(--purple-lighter)',
                        padding: '8px 16px',
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
          </div>
        </DarkCard>
      </PageSection>
    </>
  );
};

export default ProfilePage;
