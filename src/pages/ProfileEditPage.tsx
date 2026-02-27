import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { PageHero } from '../components/ui';

/**
 * ProfileEditPage - allows users to edit their own profile
 */
export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  console.log('ProfileEditPage rendered, user:', user);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  const userId = user?.id;
  console.log('ProfileEditPage userId:', userId);
  
  const { data: profile, isLoading: profileIsLoading, error: profileError } = useProfile(userId);
  
  console.log('ProfileEditPage profile state:', {
    userId,
    profile,
    isLoading: profileIsLoading,
    error: profileError,
  });
  
  const updateProfileMutation = useUpdateProfile();

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!userId) return;

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await updateProfileMutation.mutateAsync({
        userId,
        ...data,
      });

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${userId}`);
      }, 1500);
    } catch (error: unknown) {
      console.error('Profile update failed:', error);
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const response = error.response as Record<string, unknown>;
        const data = response.data as Record<string, unknown> | undefined;
        if (data && typeof data.message === 'string') {
          errorMessage = data.message;
        }
      }
      setErrorMessage(errorMessage);
    }
  };

  if (!user) {
    return null;
  }

  if (profileError) {
    return (
      <>
        <PageHero title="Error Loading Profile" />
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          marginLeft: '32px',
          marginRight: '32px',
          fontFamily: 'sans-serif',
        }}>
          <p>Failed to load profile: {profileError instanceof Error ? profileError.message : String(profileError)}</p>
          <button
            onClick={() => navigate('/')}
            className="invite-btn"
            style={{ marginTop: '12px' }}
          >
            Go Back Home
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Edit Your Profile"
        subtitle="Share your gaming interests and connect with other players"
      />

      {successMessage && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          marginLeft: '32px',
          marginRight: '32px',
          fontFamily: 'sans-serif',
        }}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          marginLeft: '32px',
          marginRight: '32px',
          fontFamily: 'sans-serif',
        }}>
          {errorMessage}
        </div>
      )}

      <ProfileEditor
        profile={profile || null}
        isLoading={profileIsLoading || updateProfileMutation.isPending}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default ProfileEditPage;
