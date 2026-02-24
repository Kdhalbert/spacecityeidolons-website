import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
          <ProfileCard
            profile={profile}
            isOwnProfile={isOwnProfile}
            isAdmin={isAdmin}
            onEdit={() => navigate('/profile/edit')}
          />
        </DarkCard>
      </PageSection>
    </>
  );
};

export default ProfilePage;
